const express = require("express");
const router = express.Router();
const  protect  = require("../middleware/authMiddleware");
const { getProfile, updateProfile, changePassword, exportData, clearAllNotes, deleteAccount } = require("../controllers/userController");


router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);
router.get("/export", protect, exportData);
router.delete("/notes", protect, clearAllNotes);
router.delete("/account", protect, deleteAccount);

module.exports = router;