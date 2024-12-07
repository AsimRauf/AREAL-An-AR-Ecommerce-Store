export default function handler(req, res) {
  res.json({
    has_password: !!process.env.MONGODB_PASSWORD,
    password_length: process.env.MONGODB_PASSWORD?.length || 0
  })
}
