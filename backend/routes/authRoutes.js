// ── routes/authRoutes.js ──

const express = require("express");
const router = express.Router();
// const { registerUser } = require("../controllers/registerController");
// const { loginUser } = require("../controllers/loginController");
const{
    registerUser,
    loginUser,
    googleAuth
}= require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth); //called after Google sign-in on frontend
module.exports = router;