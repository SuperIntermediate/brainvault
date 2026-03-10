// ── models/Note.js ──
// MongoDB schema for a single note.
// CHANGES: Added pinned (F1), color (F3), folder (F4), dueDate (F9),
//          status, archived, fixed ref typo, fixed text index field name.
// Data Structure

const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    title:{
        type : String,
        required : true
    },
    content:{
        type : String,
        default : ""
    },
    url:{
        type : String,
        default : ""
    },
    tags : [{
        type : String,
        lowercase : true,
        trim : true
    }],
    type:{
        type : String,
        enum : ['note', 'link', 'idea'],
        default : "note"
    },
    // F1 — Pin: pinned notes always sort to the top of All Notes
  pinned: { 
    type: Boolean,
     default: false 
    },

  // F3 — Color: hex color chosen by user, used as card background tint
  color: { 
    type: String, 
    default: "" 
},

  // F4 — Folder: name of the folder/collection this note belongs to
  folder: { 
    type: String, 
    default: "" 
},

  // F9 — Due Date: optional deadline; overdue notes show a red badge
  dueDate: { type: Date, default: null },
    status:{
        type: String, 
        enum: ["active", 'completed'],
        default: 'active'
    },
    archived: {
        type: Boolean,
        default: false
    },
    //Attaching User to Notes
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "User", //Mongoose needs "ref" to know which model to populate.
        required: true
    }
}, {timestamps: true},
)

//Adding text index for search
noteSchema.index({
    title : "text",
    content : "text",
    tags : "text"
});

module.exports = mongoose.model("Note", noteSchema);