// ── controllers/noteController.js ──
// Handles all note operations.
// NEW functions: togglePin (F1), toggleArchive, toggleComplete,
//               duplicateNote (F7), getFolders (F4), getStats (F5+F13)

const Note = require("../models/Note");

// ── CREATE NOTE ──────────────────────────────────────────────────────────────
// POST /api/notes
// Saves a new note and attaches it to the logged-in user.
// Accepts: title, content, tags, type, color, folder, dueDate, pinned
exports.createNote = async (req, res) => {
  try {
    const note = await Note.create({ ...req.body, user: req.user._id });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: "Error creating the note" });
  }
};

// ── GET NOTES ────────────────────────────────────────────────────────────────
// GET /api/notes?search=&tag=&archived=&folder=&sort=&page=&limit=
// F1:  Pinned notes always come first via sort { pinned:-1 }
// F4:  Filter by folder name via ?folder=Work
// F6:  Sort by newest/oldest/a-z/updated via ?sort=
// Paginates results using ?page= and ?limit=
exports.getNotes = async (req, res) => {
  try {
    const { search, tag, archived, folder, sort } = req.query;

    // Always scope to the logged-in user
    let filter = { user: req.user._id };

    // Archive filter: archived=true → show archived; else show active
    filter.archived = archived === "true";

    // Full-text search across title, content, tags
    if (search) filter.$text = { $search: search };

    // Tag filter: find notes whose tags array includes this tag
    if (tag) filter.tags = { $in: [tag] };

    // F4 — Folder filter: show only notes inside a specific folder
    if (folder) filter.folder = folder;

    // F6 — Sort options. pinned:-1 keeps pinned notes at top in every sort.
    let sortOption = { pinned: -1, createdAt: -1 };          // default: newest
    if (sort === "oldest")  sortOption = { pinned: -1, createdAt: 1  };
    if (sort === "a-z")     sortOption = { pinned: -1, title: 1      };
    if (sort === "updated") sortOption = { pinned: -1, updatedAt: -1 };

    // Pagination
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 9;
    const skip  = (page - 1) * limit;

    const count = await Note.countDocuments(filter);
    const notes = await Note.find(filter).sort(sortOption).skip(skip).limit(limit);

    res.json({ notes, page, pages: Math.ceil(count / limit), total: count });
  } catch (err) {
    res.status(500).json({ message: "Error fetching notes." });
  }
};

// ── GET STATS ────────────────────────────────────────────────────────────────
// GET /api/notes/stats
// F5:  Provides counts for sidebar badges (total, archived, tag count)
// F13: Provides data for the Stats Dashboard:
//       - total notes, notes this week, top tags, notes per day (bar chart),
//         streak (consecutive days with at least one note)
exports.getStats = async (req, res) => {
  try {
    const uid = req.user._id;

    // Total active notes (used in sidebar badge)
    const total = await Note.countDocuments({ user: uid, archived: false });

    // Archived notes count (used in sidebar badge)
    const archived = await Note.countDocuments({ user: uid, archived: true });

    // Unique tag count (used in sidebar badge)
    const tagAgg = await Note.aggregate([
      { $match: { user: uid, archived: false } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort:  { count: -1 } }
    ]);

    // Folder list with note counts (used in sidebar F4)
    const folderAgg = await Note.aggregate([
      { $match: { user: uid, archived: false, folder: { $ne: "" } } },
      { $group: { _id: "$folder", count: { $sum: 1 } } },
      { $sort:  { _id: 1 } }
    ]);

    // Notes created in the last 7 days (dashboard stat card)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = await Note.countDocuments({
      user: uid, createdAt: { $gte: weekAgo }
    });

    // Notes per day for last 30 days (bar chart data)
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const daily = await Note.aggregate([
      { $match: { user: uid, createdAt: { $gte: monthAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Streak: count consecutive days (going backwards) with at least 1 note
    const allDays = await Note.aggregate([
      { $match: { user: uid } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
      }},
      { $sort: { _id: -1 } }
    ]);
    let streak = 0;
    let check  = new Date();
    check.setHours(0,0,0,0);
    for (const day of allDays) {
      const d = new Date(day._id);
      const diff = Math.round((check - d) / 86400000);
      if (diff <= 1) { streak++; check = d; }
      else break;
    }

    res.json({
      total, archived, thisWeek, streak,
      tags:    tagAgg,    // [{ _id:"react", count:3 }, ...]
      folders: folderAgg, // [{ _id:"Work",  count:5 }, ...]
      daily,              // [{ _id:"2026-03-01", count:2 }, ...]
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats." });
  }
};

// ── DELETE NOTE ──────────────────────────────────────────────────────────────
// DELETE /api/notes/:id
// Verifies ownership before deleting.
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found." });
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Successfully deleted the note." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete the note." });
  }
};

// ── UPDATE NOTE ──────────────────────────────────────────────────────────────
// PUT /api/notes/:id
// Used by edit modal and color picker. Accepts any field in req.body.
// updatedAt is auto-updated by Mongoose timestamps (used in F8).
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found." });
    const updated = await Note.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update the note." });
  }
};

// ── TOGGLE ARCHIVE ───────────────────────────────────────────────────────────
// PATCH /api/notes/:id/archive
// Flips note.archived boolean.
exports.toggleArchive = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found." });
    note.archived = !note.archived;
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Failed to archive note." });
  }
};

// ── TOGGLE COMPLETE ──────────────────────────────────────────────────────────
// PATCH /api/notes/:id/complete
// Switches status between "active" and "completed".
exports.toggleComplete = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found." });
    note.status = note.status === "completed" ? "active" : "completed";
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Failed to update note status." });
  }
};

// ── TOGGLE PIN (F1) ──────────────────────────────────────────────────────────
// PATCH /api/notes/:id/pin
// Flips note.pinned. The getNotes sort always puts pinned:-1 first,
// so pinned notes automatically float to the top of every listing.
exports.togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found." });
    note.pinned = !note.pinned;
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Failed to pin note." });
  }
};

// ── DUPLICATE NOTE (F7) ──────────────────────────────────────────────────────
// POST /api/notes/:id/duplicate
// Creates an identical copy of the note with "Copy of " prepended to title.
exports.duplicateNote = async (req, res) => {
  try {
    const orig = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!orig) return res.status(404).json({ message: "Note not found." });
    const copy = await Note.create({
      title:   "Copy of " + orig.title,
      content: orig.content,
      tags:    orig.tags,
      type:    orig.type,
      color:   orig.color,
      folder:  orig.folder,
      dueDate: orig.dueDate,
      pinned:  false,           // copies start unpinned
      user:    req.user._id
    });
    res.status(201).json(copy);
  } catch (err) {
    res.status(500).json({ message: "Failed to duplicate note." });
  }
};

// ── GET FOLDERS (F4) ─────────────────────────────────────────────────────────
// GET /api/notes/folders
// Returns array of distinct folder names for the current user.
// Used to populate the Folders section in the sidebar.
exports.getFolders = async (req, res) => {
  try {
    const folders = await Note.distinct("folder", {
      user: req.user._id,
      folder: { $ne: "" }
    });
    res.json(folders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch folders." });
  }
};