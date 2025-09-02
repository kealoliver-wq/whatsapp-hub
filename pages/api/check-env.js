// pages/api/check-env.js
export default function handler(req, res) {
  res.status(200).json({
    VERIFY_TOKEN_PRESENT: !!process.env.VERIFY_TOKEN,
    VERIFY_TOKEN_LENGTH: process.env.VERIFY_TOKEN?.length || 0
  });
}
