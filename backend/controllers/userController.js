const User = require("../models/User");
const Note = require("../models/Note");

// GET /api/user/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// PUT /api/user/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ message: "Name and email are required" });
    const emailExists = await User.findOne({ email, _id: { $ne: req.user._id } });
    if (emailExists) return res.status(400).json({ message: "Email already in use" });
    const user = await User.findByIdAndUpdate(req.user._id, { name, email }, { new: true }).select("-password");
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// PUT /api/user/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "All fields are required" });
    if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update password" });
  }
};

// GET /api/user/export
exports.exportData = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).select("-user -__v");
    const user = await User.findById(req.user._id).select("-password -__v");
    res.json({ exportedAt: new Date(), user, notes });
  } catch (error) {
    res.status(500).json({ message: "Failed to export data" });
  }
};

// DELETE /api/user/notes
exports.clearAllNotes = async (req, res) => {
  try {
    await Note.deleteMany({ user: req.user._id });
    res.json({ message: "All notes deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear notes" });
  }
};

// DELETE /api/user/account
exports.deleteAccount = async (req, res) => {
  try {
    await Note.deleteMany({ user: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete account" });
  }
};