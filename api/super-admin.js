// api/super-admin.js
// POST /api/super-admin  { password }
// Единый пароль платформы (SUPER_ADMIN_PASSWORD), не привязан к бизнесу.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' })
  }

  const { password } = req.body || {}
  if (!process.env.SUPER_ADMIN_PASSWORD || password !== process.env.SUPER_ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Неверный пароль' })
  }

  try {
    const { data: businesses, error: bizError } = await supabase
      .from('businesses')
      .select('id, name, slug, created_at')
      .order('created_at', { ascending: false })
    if (bizError) throw bizError

    const { data: winners, error: winError } = await supabase.from('winners').select('id, business_id, redeemed, created_at')
    if (winError) throw winError

    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true })

    const perBusiness = (businesses || []).map((b) => {
      const wins = (winners || []).filter((w) => w.business_id === b.id)
      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        created_at: b.created_at,
        total_spins: wins.length,
        total_redeemed: wins.filter((w) => w.redeemed).length,
      }
    })

    return res.status(200).json({
      total_businesses: (businesses || []).length,
      total_users: usersCount || 0,
      total_spins: (winners || []).length,
      total_redeemed: (winners || []).filter((w) => w.redeemed).length,
      businesses: perBusiness,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Internal error' })
  }
}
