const { google } = require("googleapis");

const oauth2client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://ai-resume-analysis-be.vercel.app/api/auth/google/callback" // ← must match Google Console exactly
);

module.exports = oauth2client; 