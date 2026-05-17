const mongoose = require("mongoose");

const blacklistTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true, "Token is required to blacklist"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const BlacklistToken = mongoose.model(
  "BlacklistToken",
  blacklistTokenSchema
);

module.exports = BlacklistToken;