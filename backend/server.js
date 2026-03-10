// ── server.js ──
// CHANGE: dotenv.config() must be FIRST before any other require
// CHANGE: added authRoutes and userRoutes
// No other changes needed for Google OAuth — it's handled inside authController
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import authRoutes - register and login endpoints.
// Without this, users had no way to register or log in to the app.
const authRoutes = require("./routes/authRoutes");
const notesRoutes = require("./routes/notesRoutes");
const userRoutes = require("./routes/userRoutes");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Mount auth routes - /api/auth/register and /api/auth/login now work.
app.use("/api/auth", authRoutes); // POST /api/auth/register  and  POST /api/auth/login
app.use("/api/notes", notesRoutes); // GET / POST / PUT / DELETE /api/notes
app.use("/api/user", userRoutes); // GET / PUT /api/user/profile, PUT /api/user/password, GET /api/user/export, DELETE /api/user/notes, DELETE /api/user/account

app.get("/", (req, res) => {
    res.send("BrainVault API is Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});