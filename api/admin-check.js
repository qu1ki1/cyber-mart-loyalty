// api/admin-check.js
// POST { password } -> { ok: true } or 401

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { password } = req.body || {}

  if (password && password === process.env.ADMIN_PASSWORD) {
    return res.status(200).json({ ok: true })
  }

  return res.status(401).json({ ok: false })
}
