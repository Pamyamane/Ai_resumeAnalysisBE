const express = require ('express');

const { authMiddleware } = require('../middleware/auth.middleware');
const { 
 registerUsercontroller,
  loginUsercontroller,
  logoutUsercontroller,
  loginedinUsercontroller,
  googlelogincontroller
} = require('../controllers/auth.controller');   
const Authrouter = express.Router();



Authrouter.post("/register", (registerUsercontroller) );


Authrouter.get("/google/callback", googlelogincontroller);

Authrouter.post("/login",(loginUsercontroller));

Authrouter.get("/logout",(logoutUsercontroller));

Authrouter.get("/get-me", authMiddleware , loginedinUsercontroller)

module.exports = Authrouter;



