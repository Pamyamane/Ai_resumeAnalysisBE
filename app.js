const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

const authRoutes = require("./src/routes/userroutes");
const resumeRoutes = require("./src/routes/resume.routes");

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ai-resume-analysis-fe.vercel.app", // replace with your actual frontend URL
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);

module.exports = app;