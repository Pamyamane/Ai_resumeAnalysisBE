const usermode = require("../models/usermodels");
const bcrypt = require("bcryptjs");
const usermodel = require("../models/usermodels");
const blacklisttokenmodel = require("../models/blacklist.model");
const jwt = require("jsonwebtoken");

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none", // required for cross-origin requests
};
const { google } = require("googleapis");
const oauth2client = require("../utils/google.config");


const registerUsercontroller = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const isuseralreadyexists = await usermode.findOne({ email });
  if (isuseralreadyexists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedpassword = await bcrypt.hash(password, 10);
  const newuser = await usermode.create({ username, email, password: hashedpassword });

  const token = jwt.sign({ userId: newuser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

  res.cookie("token", token, cookieOptions);

  res.status(201).json({ 
    message: "User registered successfully", 
    token, // ← send token in body
    user: newuser 
  });
};

const loginUsercontroller = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await usermodel.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const ispasswordcorrect = await bcrypt.compare(password, user.password);
  if (!ispasswordcorrect) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

  res.cookie("token", token, cookieOptions);

  res.status(200).json({ 
    message: "User logged in successfully", 
    token, // ← send token in body
    user 
  });
};

const logoutUsercontroller = async (req, res) => {
  const token = req.cookies?.token || 
    req.headers.authorization?.split(" ")[1];

  if (token) {
    await blacklisttokenmodel.create({ token });
  }

  res.clearCookie("token", cookieOptions);
  res.status(200).json({ message: "User logged out successfully" });
};

const loginedinUsercontroller = async (req, res) => {
  try {
    const user = await usermodel.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const googlelogincontroller = async (req, res) => {
  try {
    const { code } = req.query;

    const googleResponse = await oauth2client.getToken(code);

    oauth2client.setCredentials(googleResponse.tokens);

    const oauth2 = google.oauth2({
      auth: oauth2client,
      version: "v2",
    });

    const userInfo = await oauth2.userinfo.get();

    const { email, name } = userInfo.data;

    let user = await usermodel.findOne({ email });

    if (!user) {
      user = await usermodel.create({
        username: name,
        email,
        password: "",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Google login success",
      token,
      user,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Google login failed",
    });
  }
};



module.exports = {
  registerUsercontroller,
  loginUsercontroller,
  logoutUsercontroller,
  loginedinUsercontroller,
  googlelogincontroller
};