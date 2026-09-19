// api/manager-login.js
// POST /api/manager-login  { slug, password }

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' })
  }

  const { slug, password } = req.body || {}
  if (!slug || !password) return res.status(400).json({ error: 'Укажи ссылку бизнеса и пароль' })

  const { data: business, error } = await supabase.from('businesses').select('name, manager_password').ilike('slug', slug).maybeSingle()
  if (error) return res.status(500).json({ error: error.message })
  if (!business) return res.status(404).json({ error: 'Бизнес не найден' })
  if (!business.manager_password) {
    return res.status(403).json({ error: 'Владелец ещё не настроил пароль для управляющего' })
  }
  if (business.manager_password !== password) {
    return res.status(401).json({ error: 'Неверный пароль' })
  }

  return res.status(200).json({ name: business.name })
}
