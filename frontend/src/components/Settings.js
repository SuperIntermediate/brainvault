// ── components/Settings.js ──
// Dark purple theme. All 6 tabs restored:
// Profile, Password, Preferences, Notifications, Data & Privacy, About

import { useState } from "react";
import API from "../services/api";

export default function Settings({ user, onLogout }) {
  const [name,       setName]       = useState(user?.name  || "");
  const [email,      setEmail]      = useState(user?.email || "");
  const [oldPw,      setOldPw]      = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [msg,        setMsg]        = useState("");
  const [msgType,    setMsgType]    = useState("success");
  const [loading,    setLoading]    = useState(false);
  const [activeTab,  setTab]        = useState("profile");

  // Preferences state
  const [darkMode,   setDarkMode]   = useState(localStorage.getItem("darkMode")==="true");
  const [compactView,setCompact]    = useState(localStorage.getItem("compactView")==="true");
  const [defaultSort,setDefaultSort]= useState(localStorage.getItem("defaultSort")||"newest");
  const [notesPerPage,setNPP]       = useState(localStorage.getItem("notesPerPage")||"9");

  // Notifications state
  const [emailNotifs,  setEmailNotifs]   = useState(localStorage.getItem("emailNotifs")!=="false");
  const [dueDateAlerts,setDueDateAlerts] = useState(localStorage.getItem("dueDateAlerts")!=="false");
  const [weeklyDigest, setWeeklyDigest]  = useState(localStorage.getItem("weeklyDigest")==="true");
  const [browserNotifs,setBrowserNotifs] = useState(localStorage.getItem("browserNotifs")==="true");

  const notify = (text, type="success") => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(""), 3500);
  };

  const updateProfile = async () => {
    if (!name.trim()) return notify("Name is required", "error");
    setLoading(true);
    try {
      await API.put("/user/profile", { name, email });
      localStorage.setItem("user", JSON.stringify({ name, email }));
      notify("Profile updated successfully ✓");
    } catch (e) { notify(e.response?.data?.message || "Update failed", "error"); }
    finally { setLoading(false); }
  };

  const changePassword = async () => {
    if (!oldPw || !newPw) return notify("Both password fields are required", "error");
    if (newPw.length < 6)  return notify("New password must be at least 6 characters", "error");
    if (newPw !== confirmPw) return notify("New passwords do not match", "error");
    setLoading(true);
    try {
      await API.put("/user/password", { oldPassword: oldPw, newPassword: newPw });
      setOldPw(""); setNewPw(""); setConfirmPw("");
      notify("Password changed successfully ✓");
    } catch (e) { notify(e.response?.data?.message || "Password change failed", "error"); }
    finally { setLoading(false); }
  };

  const savePreferences = () => {
    localStorage.setItem("darkMode",     darkMode);
    localStorage.setItem("compactView",  compactView);
    localStorage.setItem("defaultSort",  defaultSort);
    localStorage.setItem("notesPerPage", notesPerPage);
    notify("Preferences saved ✓");
  };

  const saveNotifications = () => {
    localStorage.setItem("emailNotifs",   emailNotifs);
    localStorage.setItem("dueDateAlerts", dueDateAlerts);
    localStorage.setItem("weeklyDigest",  weeklyDigest);
    localStorage.setItem("browserNotifs", browserNotifs);
    notify("Notification settings saved ✓");
  };

  const exportData = async () => {
    try {
      const { data } = await API.get("/notes?limit=1000");
      const blob = new Blob([JSON.stringify(data.notes, null, 2)], { type:"application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = "brainvault-export.json"; a.click();
      URL.revokeObjectURL(url);
      notify("Data exported successfully ✓");
    } catch { notify("Export failed", "error"); }
  };

  const TABS = [
    { id:"profile",   label:"👤 Profile",        icon:"👤" },
    { id:"password",  label:"🔒 Password",        icon:"🔒" },
    { id:"prefs",     label:"⚙️ Preferences",     icon:"⚙️" },
    { id:"notifs",    label:"🔔 Notifications",   icon:"🔔" },
    { id:"privacy",   label:"🛡️ Data & Privacy",  icon:"🛡️" },
    { id:"about",     label:"ℹ️ About",            icon:"ℹ️" },
  ];

  return (
    <div className="bv-settings-wrap" style={wrap}>
      {/* Page header */}
      <div style={{ marginBottom:"28px" }}>
        <h1 style={{ fontSize:"24px", fontWeight:"800", color:"#fff", letterSpacing:"-0.4px" }}>Settings</h1>
        <p style={{ fontSize:"14px", color:"var(--text-muted)", marginTop:"4px" }}>Manage your BrainVault account and preferences</p>
      </div>

      {/* Toast notification */}
      {msg && (
        <div style={{ ...notif,
          background:  msgType==="error" ? "rgba(239,68,68,0.1)"  : "rgba(74,222,128,0.1)",
          borderColor: msgType==="error" ? "rgba(239,68,68,0.3)"  : "rgba(74,222,128,0.3)",
          color:       msgType==="error" ? "#f87171"              : "#4ade80",
        }}>
          {msg}
        </div>
      )}

      {/* Mobile dropdown */}
      <div className="bv-settings-dropdown" style={{ display:"none", marginBottom:"16px" }}>
        <select value={activeTab} onChange={e => setTab(e.target.value)}
          style={{ width:"100%", padding:"12px 16px", borderRadius:"12px", border:"1px solid var(--border2)", background:"var(--surface)", color:"var(--text-primary)", fontSize:"14px", fontWeight:"600", fontFamily:"inherit", cursor:"pointer", appearance:"none", WebkitAppearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%237c3aed' stroke-width='2.5'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center", paddingRight:"40px", outline:"none" }}>
          {TABS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>

      <div className="bv-settings-layout" style={layout}>
        {/* Desktop: vertical tab sidebar — hidden on mobile via CSS */}
        <div className="bv-settings-tabside" style={tabSide}>
          <div style={{ fontSize:"10px", fontWeight:"700", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"1.5px", padding:"0 14px 8px" }}>Settings</div>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`${activeTab===t.id?"active-tab":""}`} style={{ ...tabBtn,
                background:  activeTab===t.id ? "var(--accent-soft)" : "transparent",
                color:       activeTab===t.id ? "var(--accent)"      : "var(--text-muted)",
                borderLeft:  activeTab===t.id ? "3px solid #7c3aed"  : "3px solid transparent",
                fontWeight:  activeTab===t.id ? "700"                : "500",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={content}>

          {/* ── PROFILE ── */}
          {activeTab==="profile" && (
            <Section title="Profile" desc="Manage your personal information">
              {/* User card */}
              <div style={{ display:"flex", alignItems:"center", gap:"14px", padding:"16px", background:"var(--input-bg)", borderRadius:"12px", border:"1px solid rgba(139,92,246,0.15)", marginBottom:"8px" }}>
                <div style={{ width:"52px", height:"52px", borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", fontWeight:"800", color:"#fff", flexShrink:0 }}>
                  {name?.[0]?.toUpperCase()||"U"}
                </div>
                <div>
                  <div style={{ fontSize:"15px", fontWeight:"700", color:"var(--text-primary)" }}>{name||"—"}</div>
                  <div style={{ fontSize:"13px", color:"var(--text-muted)", marginTop:"2px" }}>{email||"—"}</div>
                </div>
              </div>
              <Field label="Full Name">
                <input value={name} onChange={e=>setName(e.target.value)}
                  placeholder="Your full name" className="bv-modal-input" style={inp}/>
              </Field>
              <Field label="Email Address">
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="your@email.com" className="bv-modal-input" style={inp}/>
              </Field>
              <button onClick={updateProfile} disabled={loading} style={{ ...primaryBtn, opacity:loading?.7:1 }}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </Section>
          )}

          {/* ── PASSWORD ── */}
          {activeTab==="password" && (
            <Section title="Password" desc="Change your account password to keep it secure">
              <Field label="Current Password">
                <input type="password" value={oldPw} onChange={e=>setOldPw(e.target.value)}
                  placeholder="Enter current password" className="bv-modal-input" style={inp}/>
              </Field>
              <Field label="New Password">
                <input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)}
                  placeholder="Min 6 characters" className="bv-modal-input" style={inp}/>
              </Field>
              {newPw.length > 0 && <PasswordStrength password={newPw}/>}
              <Field label="Confirm New Password">
                <input type="password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)}
                  placeholder="Repeat new password" className="bv-modal-input"
                  style={{ ...inp, borderColor: confirmPw && confirmPw!==newPw ? "rgba(239,68,68,0.5)" : undefined }}/>
                {confirmPw && confirmPw!==newPw && (
                  <span style={{ fontSize:"11px", color:"#f87171", marginTop:"4px", display:"block" }}>Passwords don't match</span>
                )}
              </Field>
              <button onClick={changePassword} disabled={loading} style={{ ...primaryBtn, opacity:loading?.7:1 }}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </Section>
          )}

          {/* ── PREFERENCES ── */}
          {activeTab==="prefs" && (
            <Section title="Preferences" desc="Customize your BrainVault experience">
              <Toggle label="Dark Mode" desc="Use dark theme across the app (requires reload)" value={darkMode} onChange={setDarkMode}/>
              <Toggle label="Compact View" desc="Show more notes per row with smaller cards" value={compactView} onChange={setCompact}/>
              <Field label="Default Sort Order">
                <select value={defaultSort} onChange={e=>setDefaultSort(e.target.value)}
                  style={{ ...inp, cursor:"pointer" }}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="a-z">A – Z</option>
                  <option value="updated">Recently Updated</option>
                </select>
              </Field>
              <Field label="Notes Per Page">
                <select value={notesPerPage} onChange={e=>setNPP(e.target.value)}
                  style={{ ...inp, cursor:"pointer" }}>
                  <option value="6">6 notes</option>
                  <option value="9">9 notes</option>
                  <option value="12">12 notes</option>
                  <option value="18">18 notes</option>
                </select>
              </Field>
              <button onClick={savePreferences} style={primaryBtn}>Save Preferences</button>
            </Section>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab==="notifs" && (
            <Section title="Notifications" desc="Control how and when BrainVault notifies you">
              <Toggle label="Email Notifications" desc="Receive important updates via email" value={emailNotifs} onChange={setEmailNotifs}/>
              <Toggle label="Due Date Alerts" desc="Get reminded when notes are overdue" value={dueDateAlerts} onChange={setDueDateAlerts}/>
              <Toggle label="Weekly Digest" desc="Receive a summary of your notes activity every week" value={weeklyDigest} onChange={setWeeklyDigest}/>
              <Toggle label="Browser Notifications" desc="Show desktop push notifications in your browser" value={browserNotifs} onChange={v=>{
                if (v && "Notification" in window) Notification.requestPermission();
                setBrowserNotifs(v);
              }}/>
              <button onClick={saveNotifications} style={primaryBtn}>Save Notifications</button>
            </Section>
          )}

          {/* ── DATA & PRIVACY ── */}
          {activeTab==="privacy" && (
            <Section title="Data & Privacy" desc="Manage your data and account privacy settings">
              {/* Export */}
              <div style={actionCard}>
                <div>
                  <div style={{ fontSize:"14px", fontWeight:"600", color:"var(--text-primary)", marginBottom:"4px" }}>Export Your Data</div>
                  <div style={{ fontSize:"13px", color:"var(--text-muted)" }}>Download all your notes as a JSON file.</div>
                </div>
                <button onClick={exportData} style={secondaryBtn}>Export JSON</button>
              </div>
              {/* Sign out */}
              <div style={actionCard}>
                <div>
                  <div style={{ fontSize:"14px", fontWeight:"600", color:"var(--text-primary)", marginBottom:"4px" }}>Sign Out</div>
                  <div style={{ fontSize:"13px", color:"var(--text-muted)" }}>Sign out from your current session.</div>
                </div>
                <button onClick={onLogout} style={secondaryBtn}>Sign Out</button>
              </div>
              {/* Privacy policy */}
              <div style={actionCard}>
                <div>
                  <div style={{ fontSize:"14px", fontWeight:"600", color:"var(--text-primary)", marginBottom:"4px" }}>Privacy Policy</div>
                  <div style={{ fontSize:"13px", color:"var(--text-muted)" }}>Review how your data is stored and used.</div>
                </div>
                <button style={secondaryBtn}>View Policy</button>
              </div>
              {/* Delete account */}
              <div style={{ ...actionCard, borderColor:"rgba(239,68,68,0.2)", background:"rgba(239,68,68,0.04)" }}>
                <div>
                  <div style={{ fontSize:"14px", fontWeight:"600", color:"#f87171", marginBottom:"4px" }}>Delete Account</div>
                  <div style={{ fontSize:"13px", color:"var(--text-muted)" }}>Permanently delete your account and all data. Cannot be undone.</div>
                </div>
                <button style={{ ...secondaryBtn, background:"rgba(239,68,68,0.12)", color:"#f87171", borderColor:"rgba(239,68,68,0.3)" }}>Delete</button>
              </div>
            </Section>
          )}

          {/* ── ABOUT ── */}
          {activeTab==="about" && (
            <Section title="About BrainVault" desc="App information and credits">
              {/* App card */}
              <div style={{ display:"flex", alignItems:"center", gap:"16px", padding:"20px", background:"var(--accent-soft2)", borderRadius:"14px", border:"1px solid rgba(139,92,246,0.2)", marginBottom:"8px" }}>
                <div style={{ width:"56px", height:"56px", borderRadius:"16px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize:"18px", fontWeight:"800", color:"#fff" }}>BrainVault</div>
                  <div style={{ fontSize:"13px", color:"var(--text-secondary)", marginTop:"2px" }}>Your Personal Knowledge Management workspace</div>
                </div>
              </div>
              {[
                ["Version",     "1.0.0"],
                ["Build",       "2026.03"],
                ["Stack",       "React + Node.js + MongoDB"],
                ["Auth",        "JWT + Google OAuth 2.0"],
                ["License",     "MIT"],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid rgba(139,92,246,0.08)" }}>
                  <span style={{ fontSize:"13px", color:"var(--text-muted)", fontWeight:"500" }}>{k}</span>
                  <span style={{ fontSize:"13px", color:"#c4b5fd", fontWeight:"600" }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop:"16px", padding:"14px", background:"rgba(74,222,128,0.06)", borderRadius:"10px", border:"1px solid rgba(74,222,128,0.15)", fontSize:"13px", color:"var(--text-secondary)", textAlign:"center" }}>
                ✨ All systems operational
              </div>
            </Section>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────
function Section({ title, desc, children }) {
  return (
    <div style={{ background:"var(--surface)", borderRadius:"16px", padding:"24px", border:"1px solid rgba(139,92,246,0.15)", display:"flex", flexDirection:"column", gap:"16px" }}>
      <div style={{ marginBottom:"4px" }}>
        <h3 style={{ fontSize:"16px", fontWeight:"700", color:"var(--text-primary)", margin:0 }}>{title}</h3>
        <p style={{ fontSize:"13px", color:"var(--text-muted)", marginTop:"4px" }}>{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:"11px", fontWeight:"700", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"7px" }}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:"var(--accent-soft2)", borderRadius:"12px", border:"1px solid rgba(139,92,246,0.1)", gap:"16px" }}>
      <div>
        <div style={{ fontSize:"14px", fontWeight:"600", color:"var(--text-primary)" }}>{label}</div>
        {desc && <div style={{ fontSize:"12px", color:"var(--text-muted)", marginTop:"2px" }}>{desc}</div>}
      </div>
      <div onClick={() => onChange(!value)}
        style={{ width:"44px", height:"24px", borderRadius:"12px", background:value?"#7c3aed":"var(--border2)", border:`1px solid ${value?"#7c3aed":"rgba(139,92,246,0.3)"}`, cursor:"pointer", position:"relative", transition:"all 0.2s", flexShrink:0 }}>
        <div style={{ position:"absolute", top:"3px", left:value?"22px":"3px", width:"16px", height:"16px", borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }}/>
      </div>
    </div>
  );
}

function PasswordStrength({ password }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r=>r.test(password)).length;
  const labels= ["Weak","Fair","Good","Strong"];
  const colors= ["#ef4444","#f97316","#fbbf24","#4ade80"];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
      <div style={{ flex:1, height:"4px", borderRadius:"4px", background:"var(--border)", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${(score/4)*100}%`, background:colors[score-1]||"#ef4444", borderRadius:"4px", transition:"width 0.3s" }}/>
      </div>
      <span style={{ fontSize:"11px", fontWeight:"700", color:colors[score-1]||"#ef4444", minWidth:"40px" }}>{labels[score-1]||"Weak"}</span>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const wrap      = { padding:"32px", maxWidth:"960px", margin:"0 auto", width:"100%" };  // className: bv-settings-wrap
const layout    = { display:"flex", gap:"24px", alignItems:"flex-start" };
const tabSide   = { width:"200px", flexShrink:0, background:"var(--surface)", borderRadius:"16px", padding:"14px 10px", border:"1px solid rgba(139,92,246,0.15)", display:"flex", flexDirection:"column", gap:"2px" };
const tabBtn    = { width:"100%", padding:"10px 14px", borderRadius:"10px", border:"none", fontSize:"13px", cursor:"pointer", textAlign:"left", transition:"all 0.15s", fontFamily:"inherit" };
const content   = { flex:1, minWidth:0 };
const inp       = { width:"100%", padding:"11px 14px", borderRadius:"10px", border:"1px solid rgba(139,92,246,0.2)", background:"var(--input-bg)", color:"var(--text-primary)", fontSize:"14px", boxSizing:"border-box", transition:"all 0.2s", fontFamily:"inherit" };
const notif     = { borderRadius:"10px", padding:"12px 16px", fontSize:"13px", fontWeight:"500", marginBottom:"20px", border:"1px solid" };
const primaryBtn= { padding:"10px 22px", borderRadius:"10px", border:"none", background:"#7c3aed", color:"#fff", fontSize:"13px", fontWeight:"700", cursor:"pointer", boxShadow:"0 4px 16px rgba(124,58,237,0.35)", transition:"all 0.2s", alignSelf:"flex-start" };
const secondaryBtn={ padding:"9px 18px", borderRadius:"9px", border:"1px solid rgba(139,92,246,0.25)", background:"var(--border)", color:"rgba(196,181,253,0.8)", fontSize:"13px", fontWeight:"600", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 };
const actionCard= { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px", borderRadius:"12px", border:"1px solid rgba(139,92,246,0.15)", background:"var(--accent-soft2)", gap:"16px" };