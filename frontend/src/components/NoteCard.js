// ── components/NoteCard.js ──
// Dark purple theme — matches the PKM dashboard design.
// All logic unchanged. Only styles replaced.

import { useState } from "react";
import API from "../services/api";

const COLOR_OPTIONS = [
  { label:"Default", value:"" },
  { label:"Purple",  value:"rgba(124,58,237,0.08)"  },
  { label:"Blue",    value:"rgba(14,165,233,0.08)"  },
  { label:"Green",   value:"rgba(16,185,129,0.08)"  },
  { label:"Orange",  value:"rgba(249,115,22,0.08)"  },
  { label:"Pink",    value:"rgba(236,72,153,0.08)"  },
];

const TYPE_CONFIG = {
  note: { emoji:"📄", color:"#a78bfa", bg:"rgba(167,139,250,0.12)", label:"Note" },
  idea: { emoji:"💡", color:"#fbbf24", bg:"rgba(251,191,36,0.12)",  label:"Idea" },
  link: { emoji:"🔗", color:"#34d399", bg:"rgba(52,211,153,0.12)",  label:"Link" },
};

const ACCENTS = ["#7c3aed","#0ea5e9","#10b981","#ec4899","#f97316","#a855f7","#14b8a6","#f59e0b"];
const _m = {}; let _i = 0;
function getAccent(id) { if (!_m[id]) _m[id] = ACCENTS[_i++%ACCENTS.length]; return _m[id]; }

function timeAgo(d) {
  const diff=Date.now()-new Date(d).getTime(), m=Math.floor(diff/60000), h=Math.floor(diff/3600000), dy=Math.floor(diff/86400000);
  if(m<1) return "just now"; if(m<60) return `${m}m ago`; if(h<24) return `${h}h ago`;
  if(dy<30) return `${dy}d ago`;
  return new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short"});
}

function EditNoteModal({ note, onClose, onSaved }) {
  const [title,  setTitle]  = useState(note.title);
  const [content,setContent]= useState(note.content);
  const [tags,   setTags]   = useState(note.tags?.join(", ")||"");
  const [folder, setFolder] = useState(note.folder||"");
  const [dueDate,setDueDate]= useState(note.dueDate?new Date(note.dueDate).toISOString().split("T")[0]:"");
  const [color,  setColor]  = useState(note.color||"");
  const [loading,setLoading]= useState(false);
  const [error,  setError]  = useState("");

  const save = async () => {
    if (!title.trim()) return setError("Title required");
    setLoading(true);
    try {
      await API.put(`/notes/${note._id}`,{ title, content, tags:tags.split(",").map(t=>t.trim().toLowerCase()).filter(Boolean), folder:folder.trim(), dueDate:dueDate||null, color });
      onSaved(); onClose();
    } catch { setError("Failed to save."); }
    finally { setLoading(false); }
  };

  return (
    <div style={ovl}>
      <div style={mod}>
        <div style={modH}>
          <span style={{ fontSize:"15px", fontWeight:"700", color:"var(--text-primary)" }}>Edit Note</span>
          <button onClick={onClose} style={xBtn}>✕</button>
        </div>
        {error && <div style={errB}>{error}</div>}
        <div style={modBody}>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title..." className="bv-modal-input" style={minp}/>
          <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Content..." className="bv-modal-input" style={{...minp,minHeight:"100px",resize:"vertical"}}/>
          <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="Tags (comma separated)" className="bv-modal-input" style={minp}/>
          <input value={folder} onChange={e=>setFolder(e.target.value)} placeholder="📁 Folder" className="bv-modal-input" style={minp}/>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <label style={mLbl}>Due date</label>
            <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="bv-modal-input" style={{...minp,flex:1,colorScheme:"dark"}}/>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <label style={mLbl}>Color</label>
            <div style={{ display:"flex", gap:"8px" }}>
              {COLOR_OPTIONS.map(c=>(
                <div key={c.value} onClick={()=>setColor(c.value)} title={c.label}
                  style={{ width:"20px", height:"20px", borderRadius:"50%", background:c.value||"var(--border2)", border:color===c.value?"2px solid #a78bfa":"2px solid rgba(139,92,246,0.2)", cursor:"pointer" }}/>
              ))}
            </div>
          </div>
        </div>
        <div style={modF}>
          <button onClick={onClose} style={cancelB}>Cancel</button>
          <button onClick={save} disabled={loading} style={{ ...saveB, opacity:loading?.7:1 }}>
            {loading?"Saving...":"Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NoteCard({ note, onRefresh, onTagClick }) {
  const [showEdit,   setShowEdit]   = useState(false);
  const [showDel,    setShowDel]    = useState(false);
  const [loading,    setLoading]    = useState("");
  const [hovered,    setHovered]    = useState(false);
  const [showColors, setShowColors] = useState(false);

  const isCompleted = note.status === "completed";
  const isArchived  = note.archived;
  const isPinned    = note.pinned;
  const isOverdue   = note.dueDate && new Date(note.dueDate)<new Date() && !isCompleted;
  const accent      = getAccent(note._id);
  const typeConf    = TYPE_CONFIG[note.type] || TYPE_CONFIG.note;

  const act = async (fn) => { try { await fn(); onRefresh(); } catch { alert("Action failed."); } };
  const handleDelete    = async () => { setLoading("del");  await act(()=>API.delete(`/notes/${note._id}`)); setLoading(""); setShowDel(false); };
  const handleArchive   = async () => { setLoading("arc");  await act(()=>API.patch(`/notes/${note._id}/archive`));  setLoading(""); };
  const handleComplete  = async () => { setLoading("comp"); await act(()=>API.patch(`/notes/${note._id}/complete`)); setLoading(""); };
  const handlePin       = async () => { setLoading("pin");  await act(()=>API.patch(`/notes/${note._id}/pin`));      setLoading(""); };
  const handleDuplicate = async () => { setLoading("dup");  await act(()=>API.post(`/notes/${note._id}/duplicate`)); setLoading(""); };
  const handleColor     = async (c) => { setShowColors(false); await act(()=>API.put(`/notes/${note._id}`,{color:c})); };

  return (
    <>
      {showEdit && <EditNoteModal note={note} onClose={()=>setShowEdit(false)} onSaved={onRefresh}/>}
      {showDel && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}
          onClick={e => { if(e.target===e.currentTarget) setShowDel(false); }}>
          <div style={{ background:"var(--surface)", borderRadius:"24px", width:"100%", maxWidth:"400px", border:"1px solid rgba(239,68,68,0.2)", boxShadow:"0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(239,68,68,0.1)", overflow:"hidden", animation:"bv-fadein 0.2s ease" }}>

            {/* ── Icon + Header ── */}
            <div style={{ padding:"32px 28px 20px", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}>
              {/* Warning icon circle */}
              <div style={{ width:"64px", height:"64px", borderRadius:"50%", background:"rgba(239,68,68,0.1)", border:"2px solid rgba(239,68,68,0.25)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"20px", flexShrink:0 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2"/>
                </svg>
              </div>

              <h3 style={{ fontSize:"20px", fontWeight:"800", color:"var(--text-primary)", margin:"0 0 10px", letterSpacing:"-0.3px" }}>
                Delete Note?
              </h3>

              <p style={{ fontSize:"14px", color:"var(--text-muted)", lineHeight:"1.6", margin:0 }}>
                This will permanently delete
              </p>
              <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text-primary)", margin:"4px 0 0", maxWidth:"300px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                "{note.title || "Untitled"}"
              </p>

              {/* Warning pill */}
              <div style={{ display:"flex", alignItems:"center", gap:"6px", marginTop:"14px", padding:"7px 14px", borderRadius:"20px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.18)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span style={{ fontSize:"11px", fontWeight:"600", color:"#f87171", letterSpacing:"0.3px" }}>This action cannot be undone</span>
              </div>
            </div>

            {/* ── Divider ── */}
            <div style={{ height:"1px", background:"var(--border)", margin:"0 28px" }}/>

            {/* ── Actions ── */}
            <div style={{ padding:"20px 28px 28px", display:"flex", gap:"12px" }}>
              <button onClick={()=>setShowDel(false)}
                style={{ flex:1, padding:"13px", borderRadius:"14px", border:"1px solid var(--border2)", background:"var(--accent-soft)", color:"var(--text-secondary)", fontSize:"14px", fontWeight:"600", cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit" }}
                onMouseEnter={e=>{ e.currentTarget.style.background="var(--border2)"; e.currentTarget.style.color="var(--text-primary)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="var(--accent-soft)"; e.currentTarget.style.color="var(--text-secondary)"; }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={loading==="del"}
                style={{ flex:1, padding:"13px", borderRadius:"14px", border:"none", background: loading==="del" ? "rgba(239,68,68,0.5)" : "linear-gradient(135deg,#ef4444,#dc2626)", color:"#fff", fontSize:"14px", fontWeight:"700", cursor: loading==="del"?"not-allowed":"pointer", transition:"all 0.15s", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:"7px", boxShadow: loading==="del"?"none":"0 4px 16px rgba(239,68,68,0.35)" }}
                onMouseEnter={e=>{ if(loading!=="del") e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; }}>
                {loading==="del" ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:"bv-fadein 0.3s" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    Deleting…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/></svg>
                    Delete Note
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      <div className="bv-note-card"
        onMouseEnter={()=>setHovered(true)}
        onMouseLeave={()=>{ setHovered(false); setShowColors(false); }}
        style={{
          background: note.color || "var(--surface)",
          borderRadius:"16px", overflow:"hidden",
          border: isPinned ? "1px solid rgba(167,139,250,0.5)" : "1px solid rgba(139,92,246,0.15)",
          transition:"transform 0.2s, box-shadow 0.2s",
          display:"flex", flexDirection:"column",
          boxShadow:"0 2px 12px rgba(0,0,0,0.3)",
          opacity: isArchived ? 0.75 : 1,
        }}>

        {/* Top accent bar */}
        <div style={{ height:"3px", background:accent, flexShrink:0 }}/>

        <div style={{ padding:"16px 16px 12px", display:"flex", flexDirection:"column", gap:"10px", flex:1 }}>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"4px" }}>
            <span style={{ fontSize:"10px", fontWeight:"700", padding:"3px 9px", borderRadius:"20px", textTransform:"uppercase", letterSpacing:"0.5px", background:typeConf.bg, color:typeConf.color }}>
              {typeConf.emoji} {typeConf.label}
            </span>
            <div style={{ display:"flex", gap:"4px", flexWrap:"wrap" }}>
              {isPinned    && <Chip c="rgba(167,139,250,0.2)" t="#c4b5fd">📌 Pinned</Chip>}
              {isCompleted && <Chip c="rgba(74,222,128,0.15)" t="#4ade80">✓ Done</Chip>}
              {isArchived  && <Chip c="rgba(156,163,175,0.15)" t="#9ca3af">📦 Archived</Chip>}
              {isOverdue   && <Chip c="rgba(239,68,68,0.15)" t="#f87171">⏰ Overdue</Chip>}
            </div>
          </div>

          {/* Title */}
          <h3 style={{ fontSize:"15px", fontWeight:"700", color: isCompleted?"var(--text-muted)":"var(--text-primary)", margin:0, lineHeight:"1.35", textDecoration: isCompleted?"line-through":"none", letterSpacing:"-0.2px" }}>
            {note.title}
          </h3>

          {/* Due date */}
          {note.dueDate && (
            <div style={{ fontSize:"11px", color: isOverdue?"#f87171":"rgba(196,181,253,0.5)", fontWeight:"600" }}>
              Due: {new Date(note.dueDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
            </div>
          )}

          {/* Content */}
          {note.content && (
            <div style={{ fontSize:"13px", color:"var(--text-secondary)", lineHeight:"1.6", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
              {note.content.startsWith("<") ? (
                <div dangerouslySetInnerHTML={{__html:note.content}} style={{fontSize:"13px",color:"var(--text-secondary)",lineHeight:"1.6"}}/>
              ) : (
                note.content.split(/(\bhttps?:\/\/\S+)/g).map((p,i)=>
                  /^https?:\/\//.test(p)
                    ? <a key={i} href={p} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{color:"#a78bfa",textDecoration:"underline",wordBreak:"break-all"}}>{p}</a>
                    : p
                )
              )}
            </div>
          )}

          {/* Folder badge */}
          {note.folder && (
            <span style={{ fontSize:"11px", color:"#a78bfa", fontWeight:"600", background:"var(--tag-bg)", padding:"2px 8px", borderRadius:"6px", alignSelf:"flex-start" }}>📁 {note.folder}</span>
          )}

          {/* Tags */}
          {note.tags?.length > 0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
              {note.tags.map(tag=>(
                <span key={tag} className="bv-tag" onClick={()=>onTagClick?.(tag)}
                  style={{ background:"var(--tag-bg)", color:"#c4b5fd", fontSize:"11px", fontWeight:"600", padding:"2px 9px", borderRadius:"20px", cursor:"pointer", border:"1px solid rgba(124,58,237,0.2)", transition:"all 0.15s" }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"auto", paddingTop:"8px", borderTop:"1px solid rgba(139,92,246,0.1)" }}>
            <span style={{ fontSize:"11px", color:"var(--text-muted)", fontWeight:"500" }}>
              🕐 {timeAgo(note.updatedAt||note.createdAt)}
            </span>
            {/* Action buttons — fade in on hover */}
            <div style={{ display:"flex", gap:"2px", opacity:hovered?1:0, transform:hovered?"translateY(0)":"translateY(4px)", transition:"opacity 0.2s, transform 0.2s" }}>
              <Ab onClick={handlePin}       loading={loading==="pin"}  title={isPinned?"Unpin":"Pin"}    icon="📌" c={isPinned?"#c4b5fd":"#666"}/>
              <Ab onClick={handleComplete}  loading={loading==="comp"} title={isCompleted?"Active":"Done"} icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>} c={isCompleted?"#4ade80":"#666"}/>
              <Ab onClick={()=>setShowEdit(true)} title="Edit" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>} c="#a78bfa"/>
              <div style={{position:"relative"}}>
                <Ab onClick={()=>setShowColors(v=>!v)} title="Color" icon="🎨" c="#888"/>
                {showColors && (
                  <div style={{ position:"absolute", bottom:"34px", right:0, background:"var(--surface)", border:"1px solid rgba(139,92,246,0.25)", borderRadius:"12px", padding:"10px", display:"flex", gap:"8px", boxShadow:"0 8px 24px rgba(0,0,0,0.4)", zIndex:20 }}>
                    {COLOR_OPTIONS.map(co=>(
                      <div key={co.value} onClick={()=>handleColor(co.value)} title={co.label}
                        style={{ width:"20px", height:"20px", borderRadius:"50%", background:co.value||"var(--tag-bg)", border:note.color===co.value?"2px solid #a78bfa":"2px solid rgba(139,92,246,0.2)", cursor:"pointer" }}/>
                    ))}
                  </div>
                )}
              </div>
              <Ab onClick={handleDuplicate} loading={loading==="dup"} title="Duplicate" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>} c="#888"/>
              <Ab onClick={handleArchive}   loading={loading==="arc"} title={isArchived?"Unarchive":"Archive"} icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21,8 21,21 3,21 3,8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>} c={isArchived?"#fbbf24":"#888"}/>
              <Ab onClick={()=>setShowDel(true)} title="Delete" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/></svg>} c="#f87171"/>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Badge chip
function Chip({ c, t, children }) {
  return <span style={{ fontSize:"10px", fontWeight:"700", padding:"3px 8px", borderRadius:"20px", background:c, color:t }}>{children}</span>;
}

// Action button
function Ab({ onClick, icon, title, loading, c }) {
  const [h, setH] = useState(false);
  return (
    <button className="bv-action-btn" onClick={onClick} disabled={loading} title={title}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ width:"28px", height:"28px", borderRadius:"7px", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:loading?"wait":"pointer", background:h?"var(--border2)":"transparent", color:c, transition:"all 0.15s", opacity:loading?.5:1, fontSize:typeof icon==="string"?"13px":undefined }}>
      {icon}
    </button>
  );
}

// Modal styles
const ovl    = { position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" };
const mod    = { background:"var(--surface)", borderRadius:"20px", width:"100%", maxWidth:"500px", border:"1px solid rgba(139,92,246,0.2)", boxShadow:"0 24px 60px rgba(0,0,0,0.6)", overflow:"hidden" };
const modH   = { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 20px", borderBottom:"1px solid rgba(139,92,246,0.12)", background:"rgba(124,58,237,0.08)" };
const xBtn   = { background:"none", border:"none", color:"rgba(196,181,253,0.5)", cursor:"pointer", fontSize:"16px", padding:"4px" };
const errB   = { margin:"12px 20px 0", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"8px", padding:"10px 14px", fontSize:"13px", color:"#f87171" };
const modBody= { padding:"18px 20px", display:"flex", flexDirection:"column", gap:"10px", maxHeight:"60vh", overflowY:"auto" };
const minp   = { width:"100%", padding:"10px 14px", borderRadius:"10px", border:"1px solid rgba(139,92,246,0.2)", background:"rgba(139,92,246,0.06)", color:"var(--text-primary)", fontSize:"14px", boxSizing:"border-box", transition:"all 0.2s", fontFamily:"inherit" };
const modF   = { display:"flex", justifyContent:"flex-end", gap:"10px", padding:"14px 20px", borderTop:"1px solid rgba(139,92,246,0.12)" };
const cancelB= { padding:"9px 18px", borderRadius:"10px", border:"1px solid rgba(139,92,246,0.25)", background:"transparent", color:"rgba(196,181,253,0.7)", fontSize:"13px", cursor:"pointer" };
const saveB  = { padding:"9px 20px", borderRadius:"10px", border:"none", background:"#7c3aed", color:"#fff", fontSize:"13px", fontWeight:"700", cursor:"pointer" };
const mLbl   = { fontSize:"12px", fontWeight:"600", color:"rgba(196,181,253,0.5)", whiteSpace:"nowrap" };