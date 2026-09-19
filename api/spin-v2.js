import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const CODE_LIFETIME_DAYS = 14

function startOfTodayISO() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()
}

function expiresAtISO() {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + CODE_LIFETIME_DAYS)
  return expiresAt.toISOString()
}

function generateCode(prefix = 'CM') {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
}

function pickWeighted(gifts) {
  const total = gifts.reduce((sum, gift) => sum + Number(gift.chance || gift.weight || 1), 0)
  let roll = Math.random() * total

  for (const gift of gifts) {
    roll -= Number(gift.chance || gift.weight || 1)
    if (roll <= 0) return gift
  }

  return gifts[0]
}

async function getBusiness(slug) {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name')
    .ilike('slug', slug)
    .maybeSingle()

  if (error) throw error
  return data
}

async function findTodayWin(businessId, telegramId) {
  const { data, error } = await supabase
    .from('winners')
    .select('*, gifts(name, rarity, icon)')
    .eq('business_id', businessId)
    .eq('telegram_id', telegramId)
    .gte('created_at', startOfTodayISO())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

function previousPrize(existing) {
  return {
    already_spun: true,
    can_spin: false,
    bonus_attempts: 0,
    attempts_available: 0,
    gift_name: existing.gift_name,
    rarity: existing.gifts?.rarity ?? 'rare',
    icon: existing.gifts?.icon ?? 'star',
    code: existing.code,
    redeemed: existing.redeemed,
    expires_at: existing.expires_at,
  }
}

async function registerUser({ telegramId, businessId, firstName, username, ref }) {
  const { data: existingUser, error: userLookupError } = await supabase
    .from('users')
    .select('telegram_id, referred_by')
    .eq('telegram_id', telegramId)
    .eq('business_id', businessId)
    .maybeSingle()

  if (userLookupError) throw userLookupError

  const isNewUser = !existingUser
  const referrerId = Number(ref)
  const validReferral = Number.isSafeInteger(referrerId) && referrerId > 0 && referrerId !== telegramId

  const { error: upsertError } = await supabase.from('users').upsert(
    {
      telegram_id: telegramId,
      business_id: businessId,
      first_name: firstName || '',
      username: username || null,
      ...(isNewUser && validReferral ? { referred_by: referrerId } : {}),
    },
    { onConflict: 'telegram_id,business_id' },
  )

  if (upsertError) throw upsertError

  if (!isNewUser || !validReferral) return

  const { data: referrer, error: referrerError } = await supabase
    .from('users')
    .select('bonus_attempts')
    .eq('telegram_id', referrerId)
    .eq('business_id', businessId)
    .maybeSingle()

  if (referrerError) throw referrerError
  if (!referrer) return

  const { error: rewardError } = await supabase
    .from('users')
    .update({ bonus_attempts: (referrer.bonus_attempts || 0) + 1 })
    .eq('telegram_id', referrerId)
    .eq('business_id', businessId)

  if (rewardError) throw rewardError
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Метод не поддерживается' })
  }

  const telegramId = Number(req.method === 'GET' ? req.query.telegram_id : req.body?.telegram_id)
  const slug = req.method === 'GET' ? req.query.slug : req.body?.slug

  if (!Number.isSafeInteger(telegramId) || telegramId <= 0) {
    return res.status(400).json({ error: 'telegram_id обязателен' })
  }
  if (!slug) return res.status(400).json({ error: 'Не указан бизнес (slug)' })

  try {
    const business = await getBusiness(slug)
    if (!business) return res.status(404).json({ error: 'Бизнес не найден — проверь ссылку' })

    if (req.method === 'POST') {
      await registerUser({
        telegramId,
        businessId: business.id,
        firstName: req.body?.first_name,
        username: req.body?.username,
        ref: req.body?.ref,
      })
    }

    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('bonus_attempts')
      .eq('telegram_id', telegramId)
      .eq('business_id', business.id)
      .maybeSingle()

    if (userError) throw userError

    const bonusAttempts = Math.max(0, Number(userRow?.bonus_attempts || 0))
    const existing = await findTodayWin(business.id, telegramId)

    if (existing && bonusAttempts <= 0) {
      return res.status(200).json(previousPrize(existing))
    }

    if (req.method === 'GET') {
      return res.status(200).json({
        already_spun: Boolean(existing),
        can_spin: true,
        bonus_attempts: bonusAttempts,
        attempts_available: existing ? bonusAttempts : 1 + bonusAttempts,
      })
    }

    const { data: gifts, error: giftsError } = await supabase
      .from('gifts')
      .select('*')
      .eq('business_id', business.id)
      .eq('active', true)

    if (giftsError) throw giftsError
    if (!gifts?.length) {
      return res.status(500).json({ error: 'Для этого бизнеса не настроены активные призы' })
    }

    const winner = pickWeighted(gifts)
    const code = generateCode(winner.prefix || 'CM')
    const expiresAt = expiresAtISO()

    const { error: insertError } = await supabase.from('winners').insert({
      business_id: business.id,
      telegram_id: telegramId,
      gift_id: winner.id,
      gift_name: winner.name,
      code,
      redeemed: false,
      expires_at: expiresAt,
    })

    if (insertError) throw insertError

    const remainingBonusAttempts = existing ? Math.max(0, bonusAttempts - 1) : bonusAttempts
    const { error: updateError } = await supabase
      .from('users')
      .update({
        bonus_attempts: remainingBonusAttempts,
        last_spin_at: new Date().toISOString(),
      })
      .eq('telegram_id', telegramId)
      .eq('business_id', business.id)

    if (updateError) throw updateError

    return res.status(200).json({
      already_spun: false,
      can_spin: remainingBonusAttempts > 0,
      bonus_attempts: remainingBonusAttempts,
      attempts_available: remainingBonusAttempts,
      gift_name: winner.name,
      rarity: winner.rarity || 'rare',
      icon: winner.icon || 'star',
      code,
      expires_at: expiresAt,
      redeemed: false,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Не удалось открыть кейс. Попробуй ещё раз.' })
  }
}
