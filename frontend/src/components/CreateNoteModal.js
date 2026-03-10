// ── components/CreateNoteModal.js ──
// Dark purple theme matching the PKM dashboard.
// All logic unchanged — only styles replaced.

import { useState, useRef, useEffect, useCallback } from "react";
import API from "../services/api";

const COLORS = [
  { label:"Default", value:"" },
  { label:"Purple",  value:"var(--accent-soft2)" },
  { label:"Blue",    value:"rgba(14,165,233,0.08)" },
  { label:"Green",   value:"rgba(16,185,129,0.08)" },
  { label:"Orange",  value:"rgba(249,115,22,0.08)" },
  { label:"Pink",    value:"rgba(236,72,153,0.08)" },
];

const TEMPLATES = [
  { label:"📋 Meeting Notes", title:"Meeting Notes", content:"<h3>Agenda</h3><ul><li>Topic 1</li><li>Topic 2</li></ul><h3>Action Items</h3><ul><li></li></ul>" },
  { label:"📓 Daily Journal",  title:"Daily Journal", content:"<h3>Today's Goals</h3><ul><li></li></ul><h3>Reflections</h3><p></p>" },
  { label:"✅ Todo List",     title:"Todo List",     content:"<ul><li>Task 1</li><li>Task 2</li><li>Task 3</li></ul>" },
  { label:"💡 Idea Board",    title:"Idea Board",    content:"<h3>The Idea</h3><p></p><h3>Why it matters</h3><p></p><h3>Next steps</h3><ul><li></li></ul>" },
];

const TYPES = ["note","idea","link"];

export default function CreateNoteModal({ isOpen, onClose, onNoteCreated }) {
  const [title,    setTitle]   = useState("");
  const [tags,     setTags]    = useState("");
  const [type,     setType]    = useState("note");
  const [color,    setColor]   = useState("");
  const [folder,   setFolder]  = useState("");
  const [dueDate,  setDueDate] = useState("");
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState("");
  const editorRef = useRef(null);

  // Formatting toolbar commands
  const fmt = (cmd, val) => { editorRef.current?.focus(); document.execCommand(cmd, false, val); };

  const applyTemplate = (tpl) => {
    setTitle(tpl.title);
    if (editorRef.current) editorRef.current.innerHTML = tpl.content;
  };

  const handleClose = useCallback(() => {
    setTitle(""); setTags(""); setType("note"); setColor(""); setFolder(""); setDueDate(""); setError("");
    if (editorRef.current) editorRef.current.innerHTML = "";
    onClose();
  }, [onClose]);

  const handleSubmit = async () => {
    if (!title.trim()) return setError("Title is required");
    const content = editorRef.current?.innerHTML || "";
    setLoading(true); setError("");
    try {
      await API.post("/notes", {
        title: title.trim(), content,
        tags: tags.split(",").map(t=>t.trim().toLowerCase()).filter(Boolean),
        type, color, folder: folder.trim(), dueDate: dueDate || null,
      });
      handleClose();
      onNoteCreated?.();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create note.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="bv-modal-wrap" style={ovl} onClick={e=>{ if(e.target===e.currentTarget) handleClose(); }}>
      <div className="bv-modal-box" style={modal}>

        {/* ── Header ── */}
        <div style={hdr}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ width:"32px", height:"32px", borderRadius:"9px", background:"rgba(124,58,237,0.3)", border:"1px solid rgba(124,58,237,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px" }}>✏️</div>
            <span style={{ fontSize:"15px", fontWeight:"700", color:"var(--text-primary)" }}>New Note</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            {/* Template picker */}
            <select onChange={e=>{ const t=TEMPLATES.find(x=>x.label===e.target.value); if(t) applyTemplate(t); e.target.value=""; }}
              defaultValue="" style={selSm}>
              <option value="" disabled>📋 Templates</option>
              {TEMPLATES.map(t=><option key={t.label}>{t.label}</option>)}
            </select>
            <button onClick={handleClose} style={xBtn}>✕</button>
          </div>
        </div>

        {error && <div style={errBox}>{error}</div>}

        {/* ── Body ── */}
        <div style={body}>

          {/* Title */}
          <input value={title} onChange={e=>setTitle(e.target.value)}
            placeholder="Note title..." className="bv-modal-input"
            style={{ ...inp, fontSize:"16px", fontWeight:"700" }}
            onKeyDown={e=>e.key==="Enter"&&editorRef.current?.focus()}
            autoFocus
          />

          {/* Type tabs */}
          <div style={{ display:"flex", gap:"6px" }}>
            {TYPES.map(t=>(
              <button key={t} onClick={()=>setType(t)}
                style={{ padding:"6px 16px", borderRadius:"20px", border:"none", fontSize:"12px", fontWeight:"600", cursor:"pointer", transition:"all 0.15s",
                  background: type===t ? "#7c3aed" : "var(--border)",
                  color:      type===t ? "#fff"    : "var(--text-secondary)",
                  boxShadow:  type===t ? "0 2px 12px rgba(124,58,237,0.4)" : "none",
                }}>
                {t==="note"?"📄 Note":t==="idea"?"💡 Idea":"🔗 Link"}
              </button>
            ))}
          </div>

          {/* Formatting toolbar */}
          <div style={toolbar}>
            <ToolBtn onClick={()=>fmt("bold")}          title="Bold">        <b>B</b>     </ToolBtn>
            <ToolBtn onClick={()=>fmt("italic")}        title="Italic">      <i>I</i>     </ToolBtn>
            <ToolBtn onClick={()=>fmt("underline")}     title="Underline">   <u>U</u>     </ToolBtn>
            <div style={divider}/>
            <ToolBtn onClick={()=>fmt("insertUnorderedList")} title="Bullet list">• List</ToolBtn>
            <ToolBtn onClick={()=>fmt("insertOrderedList")}   title="Numbered list">1. List</ToolBtn>
            <ToolBtn onClick={()=>fmt("formatBlock","h3")}    title="Heading">H</ToolBtn>
            <div style={divider}/>
            <ToolBtn onClick={()=>fmt("removeFormat")}  title="Clear format" style={{color:"#f87171"}}>✕</ToolBtn>
          </div>

          {/* Rich text editor */}
          <div ref={editorRef} contentEditable suppressContentEditableWarning
            onInput={e=>{ /* content is read via editorRef.current.innerHTML on submit */ }}
            data-placeholder="Start writing your note..."
            style={editor}
          />

          {/* Row: tags + folder */}
          <div className="bv-modal-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
            <div>
              <label style={lbl}>🏷️ Tags</label>
              <input value={tags} onChange={e=>setTags(e.target.value)}
                placeholder="work, ideas, ..." className="bv-modal-input" style={inp}/>
            </div>
            <div>
              <label style={lbl}>📁 Folder</label>
              <input value={folder} onChange={e=>setFolder(e.target.value)}
                placeholder="Folder name" className="bv-modal-input" style={inp}/>
            </div>
          </div>

          {/* Row: due date + color */}
          <div className="bv-modal-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
            <div>
              <label style={lbl}>📅 Due Date</label>
              <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}
                className="bv-modal-input" style={{...inp,colorScheme:"dark"}}/>
            </div>
            <div>
              <label style={lbl}>🎨 Card Color</label>
              <div style={{ display:"flex", gap:"8px", marginTop:"6px", alignItems:"center" }}>
                {COLORS.map(c=>(
                  <div key={c.value} onClick={()=>setColor(c.value)} title={c.label}
                    style={{ width:"22px", height:"22px", borderRadius:"50%", background:c.value||"var(--border)",
                      border: color===c.value ? "2.5px solid #a78bfa" : "2px solid rgba(139,92,246,0.2)",
                      cursor:"pointer", transition:"transform 0.15s", transform:color===c.value?"scale(1.2)":"scale(1)"
                    }}/>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={ftr}>
          <span style={{ fontSize:"12px", color:"rgba(196,181,253,0.35)" }}>Ctrl+N to open · Esc to close</span>
          <div style={{ display:"flex", gap:"10px" }}>
            <button onClick={handleClose} style={cancelBtn}>Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="bv-btn-primary"
              style={{ ...saveBtn, opacity:loading?.7:1 }}>
              {loading ? "Creating..." : "Create Note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolBtn({ onClick, title, children, style:s={} }) {
  const [h, setH] = useState(false);
  return (
    <button onMouseDown={e=>{e.preventDefault();onClick();}} title={title}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ padding:"4px 10px", borderRadius:"7px", border:"none", fontSize:"12px", fontWeight:"700", cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit",
        background: h?"rgba(139,92,246,0.25)":"transparent",
        color: h?"#c4b5fd":"var(--text-secondary)", ...s }}>
      {children}
    </button>
  );
}

// Styles
const ovl     = { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" };
const modal   = { background:"var(--surface)", borderRadius:"20px", width:"100%", maxWidth:"600px", border:"1px solid rgba(139,92,246,0.2)", boxShadow:"0 24px 80px rgba(0,0,0,0.6)", display:"flex", flexDirection:"column", maxHeight:"90vh", overflow:"hidden", animation:"bv-fadein 0.2s ease" };
const hdr     = { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 20px", borderBottom:"1px solid rgba(139,92,246,0.12)", background:"var(--accent-soft2)", flexShrink:0 };
const errBox  = { margin:"12px 20px 0", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"10px", padding:"10px 14px", fontSize:"13px", color:"#f87171" };
const body    = { padding:"20px", display:"flex", flexDirection:"column", gap:"12px", overflowY:"auto", flex:1 };
const ftr     = { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderTop:"1px solid rgba(139,92,246,0.12)", flexShrink:0, background:"var(--accent-soft2)" };
const inp     = { width:"100%", padding:"10px 14px", borderRadius:"10px", border:"1px solid rgba(139,92,246,0.2)", background:"var(--input-bg)", color:"var(--text-primary)", fontSize:"14px", boxSizing:"border-box", transition:"all 0.2s", fontFamily:"inherit" };
const lbl     = { display:"block", fontSize:"11px", fontWeight:"700", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"6px" };
const toolbar = { display:"flex", alignItems:"center", gap:"2px", padding:"6px 10px", background:"var(--input-bg)", borderRadius:"10px", border:"1px solid rgba(139,92,246,0.12)", flexWrap:"wrap" };
const divider = { width:"1px", height:"16px", background:"var(--border2)", margin:"0 4px" };
const editor  = { minHeight:"130px", maxHeight:"220px", overflowY:"auto", padding:"12px 14px", borderRadius:"10px", border:"1px solid rgba(139,92,246,0.2)", background:"var(--accent-soft2)", color:"var(--text-primary)", fontSize:"14px", lineHeight:"1.7", outline:"none" };
const selSm   = { padding:"7px 12px", borderRadius:"9px", border:"1px solid rgba(139,92,246,0.2)", background:"var(--border)", color:"rgba(196,181,253,0.8)", fontSize:"12px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit" };
const xBtn    = { background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:"16px", padding:"4px", transition:"color 0.15s" };
const cancelBtn={ padding:"9px 20px", borderRadius:"10px", border:"1px solid rgba(139,92,246,0.25)", background:"transparent", color:"var(--text-secondary)", fontSize:"13px", fontWeight:"600", cursor:"pointer" };
const saveBtn = { padding:"9px 22px", borderRadius:"10px", border:"none", background:"#7c3aed", color:"#fff", fontSize:"13px", fontWeight:"700", cursor:"pointer", boxShadow:"0 4px 16px rgba(124,58,237,0.4)" };