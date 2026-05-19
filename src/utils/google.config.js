const { google } = require("googleapis");

const oauth2client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://ai-resume-analysis-be.vercel.app/auth/google/callback"
);

module.exports = oauth2client;