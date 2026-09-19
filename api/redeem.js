// api/redeem.js
//
// Staff-only. Requires the same env vars as api/spin.js, plus:
//   ADMIN_PASSWORD   (any string you choose — this is what staff types into /admin)
//
// POST /api/redeem  { code, password }

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code, password } = req.body || {}

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Неверный пароль администратора' })
  }

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'code is required' })
  }

  try {
    const { data: win, error } = await supabase.from('winners').select('*').eq('code', code.trim().toUpperCase()).maybeSingle()

    if (error) throw error
    if (!win) {
      return res.status(404).json({ error: 'Код не найден' })
    }
    if (win.redeemed) {
      return res.status(409).json({ error: 'Этот код уже был погашен' })
    }

    const { error: updateError } = await supabase
      .from('winners')
      .update({ redeemed: true, redeemed_at: new Date().toISOString() })
      .eq('id', win.id)

    if (updateError) throw updateError

    return res.status(200).json({ gift_name: win.gift_name, telegram_id: win.telegram_id })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Internal error' })
  }
}
