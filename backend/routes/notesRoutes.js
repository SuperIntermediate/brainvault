// ── routes/notesRoutes.js ──
// Maps HTTP methods + paths to controller functions.
// IMPORTANT: named routes (/stats, /folders) must come BEFORE /:id
//            otherwise Express matches "stats" as an id param.

const express = require("express");
const router  = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  createNote,
  getNotes,
  deleteNote,
  updateNote,
  toggleArchive,
  toggleComplete,
  togglePin,      // F1 — pin/unpin a note
  duplicateNote,  // F7 — clone a note
  getFolders,     // F4 — list all folder names
  getStats,       // F5 + F13 — sidebar counts + dashboard stats
} = require("../controllers/noteController");

// ── Named routes first (MUST be above /:id routes) ──
router.get("/stats",   protect, getStats);   // F5 + F13
router.get("/folders", protect, getFolders); // F4

// ── Standard CRUD ──
router.post("/",    protect, createNote);
router.get("/",     protect, getNotes);
router.delete("/:id", protect, deleteNote);
router.put("/:id",    protect, updateNote);

// ── Toggle actions ──
router.patch("/:id/archive",  protect, toggleArchive);
router.patch("/:id/complete", protect, toggleComplete);
router.patch("/:id/pin",      protect, togglePin);      // F1
router.post("/:id/duplicate", protect, duplicateNote);  // F7

module.exports = router;