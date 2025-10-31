const jwt = require('jsonwebtoken')
require('dotenv').config()
const secret = process.env.JWT_SECRET || 'please_change_me'

module.exports = (req, res, next) => {
  const auth = req.header('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: 'no token' })
  try {
    const decoded = jwt.verify(token, secret)
    req.user = { id: decoded.id }
    next()
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' })
  }
}
