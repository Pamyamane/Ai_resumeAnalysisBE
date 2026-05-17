const express = require("express");
const  cookieParser = require("cookie-parser");
const app = express();

const authRoutes = require("./src/routes/userroutes");
const resumeRoutes = require("./src/routes/resume.routes");

// Middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());
app.use(cookieParser());        

console.log("Hello World");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);

module.exports = app;
