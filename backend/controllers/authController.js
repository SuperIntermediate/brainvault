// ── controllers/authController.js ──
// Handles register, login, and Google OAuth.
// NEW: googleAuth function — verifies Google ID token and creates/finds user.

const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Helper: generate a JWT token for our app (same as before)
//Creating a function that takes user ID.
const generateToken = (id) =>
    //sign() → Used to create a JWT token.
    //Payload → Contains user ID. 
    //Secret Key → Used to sign the token. (We'll define it in .env)
    //Options → Set token to expire in 30 days.
     jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn : "30d"
    } );

// ── REGISTER ─────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Creates a new local (email+password) user.
exports.registerUser = async (req,res) =>{
    const {name, email, password} = req.body;
    try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, authProvider: "local" });
    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Authenticates an email+password user.
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    // Block Google-only accounts from using password login
    if (user && user.authProvider === "google") {
      return res.status(400).json({ message: "This account uses Google sign-in. Please use the Google button." });
    }

    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id:   user._id,
        name:  user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    }
    res.status(401).json({ message: "Invalid email or password" });
  } catch (err) {
    res.status(500).json({ message: "Server error during login" });
  }
};

// ── GOOGLE AUTH (NEW) ─────────────────────────────────────────────────────────
// POST /api/auth/google
// Called by frontend after Google sign-in succeeds.
// Frontend sends the credential (ID token) from Google.
// We verify it using google-auth-library, then find or create the user.
exports.googleAuth = async (req, res) => {
  const { credential } = req.body; // Google ID token string from frontend

  if (!credential) {
    return res.status(400).json({ message: "No Google credential provided" });
  }

  try {
    // Verify the Google token and extract user info
    const { OAuth2Client } = require("google-auth-library");
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken:  credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    // payload contains: sub (unique Google ID), email, name, picture
    const { sub: googleId, email, name } = payload;

    // Find existing user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // If user exists but signed up with email+password before,
      // link their Google ID to the existing account
      if (!user.googleId) {
        user.googleId     = googleId;
        user.authProvider = "google";
        await user.save();
      }
    } else {
      // New user — create account without a password
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: "google",
        // password intentionally omitted — Google users don't need one
      });
    }

    // Return same shape as regular login so frontend code is identical
    res.json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      token: generateToken(user._id),
    });

  } catch (err) {
    console.error("Google auth error:", err.message);
    res.status(401).json({ message: "Google authentication failed. Please try again." });
  }
};

// Export generateToken so loginController and registerController can import it.
// Before: nothing was exported — both controllers crashed with 'generateToken is not defined'.
// module.exports = generateToken;