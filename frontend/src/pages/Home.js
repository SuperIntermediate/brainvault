// ── pages/Home.js ── FULLY RESPONSIVE (Desktop + Tablet + Mobile)
// Mobile: bottom nav bar + FAB, hero card, bar chart
// Tablet: icon-only sidebar
// Desktop: full sidebar
// Both dark + light themes via CSS variables

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import CreateNoteModal from "../components/CreateNoteModal";
import SettingsPage    from "../components/Settings";
import NoteCard        from "../components/NoteCard";

// ── Icons ──────────────────────────────────────────────────────────────────
const IC = {
  dashboard:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  notes:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
  tags:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  archive:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21,8 21,21 3,21 3,8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
  settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  folder:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  bell:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  search:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  plus:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  sun:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  menu:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  back:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>,
};

const NAV = [
  { id:"Dashboard", label:"Dashboard", icon:IC.dashboard },
  { id:"All Notes", label:"All Notes", icon:IC.notes     },
  { id:"Tags",      label:"Tags",      icon:IC.tags      },
  { id:"Archive",   label:"Archive",   icon:IC.archive   },
];

function getTheme() { return localStorage.getItem("bv_theme") || "dark"; }
function applyTheme(t) { document.documentElement.setAttribute("data-theme", t); localStorage.setItem("bv_theme", t); }

// Custom hook: detect screen size
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

export default function Home() {
  const [notes,        setNotes]        = useState([]);
  const [search,       setSearch]       = useState("");
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [activeNav,    setActiveNav]    = useState("Dashboard");
  const [showDashboard,setShowDashboard]= useState(true);
  const [filterTag,    setFilterTag]    = useState("");
  const [allTags,      setAllTags]      = useState([]);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [sort,         setSort]         = useState("newest");
  const [stats,        setStats]        = useState(null);
  const [folders,      setFolders]      = useState([]);
  const [activeFolder, setActiveFolder] = useState("");
  const [theme,        setTheme]        = useState(getTheme);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const searchRef = useRef(null);
  const navigate  = useNavigate();
  const isMobile  = useIsMobile();

  const user     = JSON.parse(localStorage.getItem("user") || '{"name":"User"}');
  const isSettings = activeNav === "Settings";
  const isArchive  = activeNav === "Archive";
  const isDark     = theme === "dark";

  useEffect(() => { applyTheme(theme); }, [theme]);
  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await API.get("/notes/stats");
      setStats(data);
      setFolders(data.folders?.map(f => f._id) || []);
    } catch (_) {}
  }, []);

  const fetchNotes = useCallback(async (sv="", tag="", archived=false, page=1, sortV="newest", folder="") => {
    try {
      let url = `/notes?search=${sv}&archived=${archived}&page=${page}&limit=9&sort=${sortV}`;
      if (tag)    url += `&tag=${tag}`;
      if (folder) url += `&folder=${encodeURIComponent(folder)}`;
      const { data } = await API.get(url);
      setNotes(data.notes || []);
      setCurrentPage(data.page  || 1);
      setTotalPages(data.pages  || 1);
      setAllTags([...new Set((data.notes||[]).flatMap(n=>n.tags||[]))]);
    } catch (e) {
      if (e.response?.status === 401) { localStorage.clear(); navigate("/login"); }
    }
  }, [navigate]);

  useEffect(() => {
    if (isSettings) return;
    const h = setTimeout(() => {
      setCurrentPage(1);
      fetchNotes(search, filterTag, isArchive, 1, sort, activeFolder);
      fetchStats();
    }, 400);
    return () => clearTimeout(h);
  }, [search, filterTag, isArchive, sort, activeFolder, fetchNotes, fetchStats, isSettings]);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === "n") { e.preventDefault(); setIsModalOpen(true); }
      if (e.ctrlKey && e.key === "f") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "Escape") { setIsModalOpen(false); setSidebarOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleNavClick = (id) => {
    setActiveNav(id); setFilterTag(""); setSearch(""); setActiveFolder("");
    setShowDashboard(id === "Dashboard"); setSidebarOpen(false);
  };
  const handleFolderClick = (f) => { setActiveFolder(f); setActiveNav("All Notes"); setShowDashboard(false); setFilterTag(""); setSearch(""); setSidebarOpen(false); };
  const handleTagClick    = (tag) => { setFilterTag(tag); setActiveNav("Tags"); setShowDashboard(false); };
  const handleRefresh     = () => { fetchNotes(search, filterTag, isArchive, currentPage, sort, activeFolder); fetchStats(); };
  const handleLogout      = () => { localStorage.clear(); navigate("/login"); };

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const todayStr = new Date().toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" });

  return (
    <div style={{ display:"flex", height:"100vh", background:"var(--bg)", overflow:"hidden" }}>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {isMobile && sidebarOpen && (
        <div className="bv-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── MOBILE DRAWER (separate from desktop sidebar, always in DOM) ── */}
      {isMobile && (
        <MobileDrawer
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeNav={activeNav}
          handleNavClick={handleNavClick}
          handleFolderClick={handleFolderClick}
          setIsModalOpen={setIsModalOpen}
          toggleTheme={toggleTheme}
          handleLogout={handleLogout}
          isDark={isDark}
          user={user}
          stats={stats}
          folders={folders}
          activeFolder={activeFolder}
          NAV={NAV}
          IC={IC}
          badge={badge}
        />
      )}

      {/* ── SIDEBAR (desktop + tablet only) ── */}
      <aside className="bv-sidebar" style={{
        width:"240px", background:"var(--sidebar-bg)", display:"flex", flexDirection:"column",
        flexShrink:0, borderRight:"1px solid var(--border)",
        boxShadow: isDark?"none":"2px 0 20px rgba(100,70,200,0.06)",
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"20px 18px 16px" }}>
          <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 4px 12px rgba(124,58,237,0.4)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <div className="bv-sidebar-logo-text">
            <div style={{ fontSize:"15px", fontWeight:"800", color:"var(--text-primary)", letterSpacing:"-0.3px" }}>BrainVault</div>
            <div style={{ fontSize:"10px", color:"var(--text-muted)", fontWeight:"500" }}>Personal PKM</div>
          </div>

        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"8px 10px", display:"flex", flexDirection:"column", gap:"2px", overflowY:"auto" }}>
          {NAV.map(item => {
            const active = activeNav === item.id;
            return (
              <div key={item.id} className={`bv-nav-item${active?" active":""}`}
                onClick={() => handleNavClick(item.id)}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", borderRadius:"10px", fontSize:"14px", fontWeight:"600", cursor:"pointer", color:active?"var(--nav-active-color)":"var(--text-secondary)", background:active?"var(--nav-active-bg)":"transparent" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  {item.icon}
                  <span className="bv-sidebar-label">{item.label}</span>
                </div>
                {item.id==="All Notes" && stats?.total > 0 && <span className="bv-sidebar-label" style={badge}>{stats.total}</span>}
                {item.id==="Archive"   && stats?.archived > 0 && <span className="bv-sidebar-label" style={badge}>{stats.archived}</span>}
              </div>
            );
          })}

          {/* Folders */}
          {folders.length > 0 && (
            <div className="bv-sidebar-folders" style={{ marginTop:"16px" }}>
              <div style={{ fontSize:"10px", fontWeight:"700", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"1.5px", padding:"0 12px 8px" }}>Folders</div>
              {folders.map(f => (
                <div key={f} className={`bv-folder${activeFolder===f?" active":""}`}
                  onClick={() => handleFolderClick(f)}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", borderRadius:"8px", fontSize:"13px", cursor:"pointer", color:activeFolder===f?"var(--accent)":"var(--text-muted)", transition:"all 0.15s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>{IC.folder} {f}</div>
                  <span style={{ fontSize:"10px", fontWeight:"700" }}>{stats?.folders?.find(x=>x._id===f)?.count||""}</span>
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* New Note */}
        <div style={{ padding:"0 12px 8px" }}>
          <button className="bv-btn-primary bv-sidebar-new-btn"
            onClick={() => { setIsModalOpen(true); setSidebarOpen(false); }}
            style={{ width:"100%", padding:"12px 16px", borderRadius:"12px", border:"none", background:"#7c3aed", color:"#fff", fontSize:"14px", fontWeight:"700", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", transition:"all 0.2s", boxShadow:"0 4px 16px rgba(124,58,237,0.4)" }}>
            {IC.plus}<span>New Note</span>
          </button>
        </div>

        {/* Settings */}
        <div style={{ padding:"0 10px 8px" }}>
          <div className={`bv-nav-item${activeNav==="Settings"?" active":""}`}
            onClick={() => handleNavClick("Settings")}
            style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", borderRadius:"10px", fontSize:"14px", fontWeight:"600", cursor:"pointer", color:activeNav==="Settings"?"var(--nav-active-color)":"var(--text-secondary)", background:activeNav==="Settings"?"var(--nav-active-bg)":"transparent" }}>
            {IC.settings}<span className="bv-sidebar-label">Settings</span>
          </div>
        </div>

        {/* User */}
        <div style={{ padding:"12px 14px", borderTop:"1px solid var(--border)", display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:"34px", height:"34px", borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:"800", fontSize:"13px", flexShrink:0 }}>
            {user.name?.[0]?.toUpperCase()||"U"}
          </div>
          <div className="bv-sidebar-user-info" style={{ flex:1, overflow:"hidden" }}>
            <div style={{ fontSize:"13px", fontWeight:"700", color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</div>
            <div style={{ fontSize:"10px", color:"var(--accent)", fontWeight:"600" }}>Pro Member</div>
          </div>
          <button onClick={toggleTheme} title={isDark?"Light mode":"Dark mode"}
            style={{ width:"30px", height:"30px", borderRadius:"8px", border:"1px solid var(--border2)", background:"var(--accent-soft)", color:"var(--text-secondary)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, transition:"all 0.2s" }}>
            {isDark ? IC.sun : IC.moon}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* ── TOPBAR ── */}
        {!isSettings && (
          <header className="bv-topbar" style={{ display:"flex", alignItems:"center", gap:"12px", padding:"14px 24px", background:"var(--topbar-bg)", borderBottom:"1px solid var(--topbar-border)", flexShrink:0, boxShadow:isDark?"none":"0 1px 12px rgba(100,70,200,0.06)" }}>
            {/* Mobile: hamburger */}
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} style={{ background:"none", border:"none", color:"var(--text-secondary)", cursor:"pointer", padding:"4px", flexShrink:0 }}>
                {IC.menu}
              </button>
            )}

            {/* Search */}
            <div style={{ flex:1, position:"relative", maxWidth:"520px" }}>
              <span style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)", pointerEvents:"none" }}>{IC.search}</span>
              <input ref={searchRef} className="bv-search" type="text"
                placeholder={isMobile ? "Search..." : "Search your knowledge base..."}
                value={search}
                onChange={e => { setSearch(e.target.value); setShowDashboard(false); setActiveNav("All Notes"); setFilterTag(""); setActiveFolder(""); }}
                style={{ width:"100%", padding:"9px 14px 9px 38px", borderRadius:"20px", border:"1px solid var(--border2)", background:"var(--accent-soft2)", color:"var(--text-primary)", fontSize:"14px", outline:"none", transition:"all 0.2s", fontFamily:"inherit" }}
              />
            </div>

            {!isMobile && (
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginLeft:"auto" }}>
                {!showDashboard && (
                  <select className="bv-select bv-topbar-sort" value={sort} onChange={e=>setSort(e.target.value)}
                    style={{ padding:"8px 14px", borderRadius:"10px", border:"1px solid var(--border2)", background:"var(--surface)", color:"var(--text-secondary)", fontSize:"13px", fontFamily:"inherit", fontWeight:"600" }}>
                    <option value="newest">🕐 Newest</option>
                    <option value="oldest">🕐 Oldest</option>
                    <option value="a-z">🔤 A–Z</option>
                    <option value="updated">✏️ Updated</option>
                  </select>
                )}
                <button style={{ width:"38px", height:"38px", borderRadius:"10px", border:"1px solid var(--border2)", background:"var(--surface)", color:"var(--text-secondary)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>{IC.bell}</button>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"6px 12px", borderRadius:"12px", border:"1px solid var(--border)", background:"var(--surface)" }}>
                  <div style={{ width:"30px", height:"30px", borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:"800", fontSize:"12px" }}>
                    {user.name?.[0]?.toUpperCase()||"U"}
                  </div>
                  <div>
                    <div style={{ fontSize:"13px", fontWeight:"700", color:"var(--text-primary)" }}>{user.name}</div>
                    <div style={{ fontSize:"10px", color:"var(--accent)", fontWeight:"600" }}>Pro Member</div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile: theme toggle in topbar */}
            {isMobile && (
              <button onClick={toggleTheme} style={{ background:"none", border:"1px solid var(--border2)", borderRadius:"8px", width:"34px", height:"34px", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-secondary)", cursor:"pointer", flexShrink:0 }}>
                {isDark ? IC.sun : IC.moon}
              </button>
            )}
          </header>
        )}

        {/* ── PAGE CONTENT ── */}
        <div className="bv-main-content" style={{ flex:1, overflow:"auto", padding: isSettings?"0":"24px 28px", paddingBottom: isMobile && !isSettings ? "88px" : undefined }}>

          {isSettings && <SettingsPage user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />}

          {/* ── DASHBOARD ── */}
          {!isSettings && showDashboard && (
            <div style={{ animation:"bv-fadein 0.4s ease" }}>

              {/* Mobile hero card */}
              {isMobile ? (
                <MobileHero user={user} greeting={greeting} stats={stats} isDark={isDark} />
              ) : (
                <>
                  {/* Desktop greeting row */}
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"24px", flexWrap:"wrap", gap:"12px" }}>
                    <div>
                      <h1 style={{ fontSize:"clamp(20px,3vw,28px)", fontWeight:"800", color:"var(--text-primary)", letterSpacing:"-0.5px" }}>
                        {greeting}, <span style={{ color:"var(--accent)" }}>{user.name?.split(" ")[0]}</span>
                      </h1>
                      <p style={{ fontSize:"14px", color:"var(--text-secondary)", marginTop:"6px" }}>Here's what's happening with your knowledge base today.</p>
                    </div>
                    <div className="bv-greeting-date" style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 14px", borderRadius:"10px", border:"1px solid var(--border2)", background:"var(--surface)", color:"var(--text-secondary)", fontSize:"13px", fontWeight:"600" }}>
                      📅 {todayStr}
                    </div>
                  </div>

                  {/* Stat cards */}
                  {stats && (
                    <div className="bv-stat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", marginBottom:"24px" }}>
                      <StatCard label="Total Notes"   value={stats.total}    change="+12%"  emoji="📄" isNeg={false}/>
                      <StatCard label="This Week"     value={stats.thisWeek} change="+5%"   emoji="📅" isNeg={false}/>
                      <StatCard label="Archived"      value={stats.archived} change="-2%"   emoji="📦" isNeg={true}/>
                      <StatCard label="Day Streak 🔥" value={`${stats.streak}d`} change="+100%" emoji="🔥" isNeg={false}/>
                    </div>
                  )}
                </>
              )}

              {/* Chart + Tags */}
              {stats && (
                <div className="bv-dashboard-bottom" style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 300px", gap:"20px", marginTop: isMobile?"16px":"0" }}>
                  {/* Chart */}
                  <div style={{ background:"var(--surface)", borderRadius:"16px", padding:"20px 20px 16px", border:"1px solid var(--border)", boxShadow:"var(--card-shadow)" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"6px" }}>
                      <div>
                        <h3 style={{ fontSize:"15px", fontWeight:"700", color:"var(--text-primary)" }}>Weekly Activity</h3>
                        <p style={{ fontSize:"11px", color:"var(--text-muted)", marginTop:"2px" }}>Last 7 days</p>
                      </div>
                      <span style={{ fontSize:"11px", fontWeight:"700", padding:"4px 10px", borderRadius:"20px", background:"var(--accent-soft)", color:"var(--accent)" }}>Last 7 Days</span>
                    </div>
                    <BarChart data={stats.daily} isDark={isDark} />
                  </div>

                  {/* Most used tags — hidden on mobile in this column (shown separately below) */}
                  {!isMobile && stats.tags?.length > 0 && (
                    <TagsList tags={stats.tags} onTagClick={handleTagClick} isDark={isDark} />
                  )}
                </div>
              )}

              {/* Mobile: tags below chart */}
              {isMobile && stats?.tags?.length > 0 && (
                <div style={{ marginTop:"16px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
                    <h3 style={{ fontSize:"14px", fontWeight:"700", color:"var(--text-primary)" }}>Most Used Tags</h3>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                    {stats.tags.slice(0,8).map((t,i) => {
                      const colors=["#7c3aed","#f59e0b","#10b981","#ec4899","#3b82f6","#f97316"];
                      const c=colors[i%colors.length];
                      return (
                        <button key={t._id} onClick={()=>handleTagClick(t._id)} className="bv-tag"
                          style={{ display:"flex", alignItems:"center", gap:"5px", padding:"6px 12px", borderRadius:"20px", border:`1px solid ${c}30`, background:`${c}12`, color:"var(--text-primary)", fontSize:"12px", fontWeight:"600", cursor:"pointer" }}>
                          <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:c }}/>
                          {t._id} <span style={{ color:"var(--text-muted)", fontWeight:"400", fontSize:"11px" }}>{t.count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!stats && (
                <div style={{ background:"var(--surface)", borderRadius:"16px", padding:"48px", border:"1px solid var(--border)", textAlign:"center", marginTop:"16px" }}>
                  <div style={{ fontSize:"40px", marginBottom:"12px" }}>🧠</div>
                  <p style={{ fontSize:"14px", color:"var(--text-muted)" }}>Your vault is empty. {isMobile ? "Tap + to create your first note." : "Press Ctrl+N to create your first note."}</p>
                </div>
              )}
            </div>
          )}

          {/* ── TAGS ── */}
          {!isSettings && !showDashboard && activeNav==="Tags" && (
            <div style={{ animation:"bv-fadein 0.4s ease" }}>
              <h2 style={{ fontSize:"20px", fontWeight:"800", color:"var(--text-primary)", marginBottom:"16px" }}>All Tags</h2>
              {allTags.length===0 ? <p style={{ color:"var(--text-muted)" }}>No tags yet.</p> : (
                <>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginBottom:"20px" }}>
                    {allTags.map(tag=>(
                      <span key={tag} className="bv-tag" onClick={()=>handleTagClick(tag)}
                        style={{ padding:"7px 14px", borderRadius:"20px", fontSize:"13px", fontWeight:"600", cursor:"pointer", transition:"all 0.15s", background:filterTag===tag?"#7c3aed":"var(--tag-bg)", color:filterTag===tag?"#fff":"var(--tag-color)", border:`1px solid ${filterTag===tag?"#7c3aed":"var(--tag-border)"}` }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                  {filterTag && (
                    <>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
                        <span style={{ fontSize:"14px", color:"var(--text-secondary)" }}>Tagged: <strong style={{ color:"var(--accent)" }}>#{filterTag}</strong></span>
                        <button onClick={()=>setFilterTag("")} style={{ background:"none", border:"1px solid var(--border2)", borderRadius:"8px", padding:"5px 12px", fontSize:"12px", color:"var(--text-secondary)", cursor:"pointer" }}>Clear</button>
                      </div>
                      <div className="bv-notes-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"14px" }}>
                        {notes.map(n=><NoteCard key={n._id} note={n} onRefresh={handleRefresh} onTagClick={handleTagClick}/>)}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── ALL NOTES / ARCHIVE ── */}
          {!isSettings && !showDashboard && activeNav!=="Tags" && (
            <div style={{ animation:"bv-fadein 0.4s ease" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px", flexWrap:"wrap", gap:"10px" }}>
                <div>
                  <h2 style={{ fontSize:"20px", fontWeight:"800", color:"var(--text-primary)" }}>
                    {isArchive?"Archive":activeFolder?`📁 ${activeFolder}`:"All Notes"}
                  </h2>
                  {activeFolder && (
                    <button onClick={()=>setActiveFolder("")} style={{ background:"none", border:"none", color:"var(--accent)", fontSize:"12px", cursor:"pointer", fontWeight:"600", padding:"4px 0 0" }}>← All notes</button>
                  )}
                </div>
                {/* Mobile sort */}
                {isMobile && (
                  <select className="bv-select" value={sort} onChange={e=>setSort(e.target.value)}
                    style={{ padding:"7px 12px", borderRadius:"10px", border:"1px solid var(--border2)", background:"var(--surface)", color:"var(--text-secondary)", fontSize:"12px", fontFamily:"inherit", fontWeight:"600" }}>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="a-z">A–Z</option>
                    <option value="updated">Updated</option>
                  </select>
                )}
              </div>
              {notes.length===0 ? (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"240px", color:"var(--text-muted)" }}>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ marginBottom:"12px" }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
                  </svg>
                  <p style={{ fontSize:"14px" }}>{isArchive?"No archived notes.":"No notes yet."}</p>
                </div>
              ) : (
                <div className="bv-notes-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"14px" }}>
                  {notes.map(n=><NoteCard key={n._id} note={n} onRefresh={handleRefresh} onTagClick={handleTagClick}/>)}
                </div>
              )}
              {totalPages>1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages}
                  onPageChange={p=>{ setCurrentPage(p); fetchNotes(search,filterTag,isArchive,p,sort,activeFolder); }}/>
              )}
            </div>
          )}
        </div>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className="bv-bottom-nav" style={{ display:"none", position:"fixed", bottom:0, left:0, right:0, height:"64px", background:"var(--bottom-nav-bg)", borderTop:"1px solid var(--bottom-nav-border)", zIndex:50, alignItems:"center", justifyContent:"space-around", padding:"0 8px", backdropFilter:"blur(12px)" }}>
          {[
            { id:"Dashboard", icon:IC.dashboard, label:"Home" },
            { id:"All Notes", icon:IC.notes,     label:"Notes" },
            { id:"Tags",      icon:IC.tags,       label:"Tags"  },
            { id:"Settings",  icon:IC.settings,  label:"Settings" },
          ].map(item=>{
            const active=activeNav===item.id;
            return (
              <button key={item.id} className={`bv-bottom-nav-btn${active?" active":""}`}
                onClick={()=>handleNavClick(item.id)}
                style={{ flex:1, background:"none", border:"none", color:active?"var(--accent)":"var(--text-muted)", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:"3px", padding:"8px 4px", borderRadius:"12px", transition:"all 0.15s" }}>
                {item.icon}
                <span style={{ fontSize:"10px", fontWeight:"600" }}>{item.label}</span>
                {active && <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:"var(--accent)", marginTop:"-2px" }}/>}
              </button>
            );
          })}
        </nav>

        {/* ── FAB (mobile new note) ── */}
        <button className="bv-fab" onClick={()=>setIsModalOpen(true)}
          style={{ display:"none", position:"fixed", bottom:"76px", left:"50%", transform:"translateX(-50%)", width:"52px", height:"52px", borderRadius:"50%", background:"#7c3aed", color:"#fff", border:"none", cursor:"pointer", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 24px rgba(124,58,237,0.55)", zIndex:51, transition:"transform 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.transform="translateX(-50%) scale(1.08)"}
          onMouseLeave={e=>e.currentTarget.style.transform="translateX(-50%)"}>
          {IC.plus}
        </button>
      </main>

      <CreateNoteModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)}
        onNoteCreated={()=>{ setShowDashboard(false); setActiveNav("All Notes"); setSearch(""); setFilterTag(""); setActiveFolder(""); handleRefresh(); }}
      />
    </div>
  );
}

// ── Mobile Hero Card ─────────────────────────────────────────────────────────
function MobileHero({ user, greeting, stats, isDark }) {
  const score = stats ? Math.min(100, Math.round((stats.thisWeek / Math.max(stats.total,1)) * 100 + 70)) : 85;
  return (
    <div>
      {/* Hero */}
      <div className="bv-hero-section" style={{ background:"var(--surface)", borderRadius:"20px", padding:"22px", border:"1px solid var(--border)", boxShadow:"var(--card-shadow)", marginBottom:"16px" }}>
        <div style={{ fontSize:"11px", fontWeight:"700", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"6px" }}>Welcome back</div>
        <h2 style={{ fontSize:"22px", fontWeight:"800", color:"var(--text-primary)", letterSpacing:"-0.4px", lineHeight:1.2, marginBottom:"16px" }}>
          {greeting},<br/>ready to learn?
        </h2>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:"11px", color:"var(--text-muted)", fontWeight:"600", marginBottom:"4px" }}>Knowledge Score</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:"8px" }}>
              <span style={{ fontSize:"32px", fontWeight:"800", color:"var(--accent)" }}>{score}%</span>
              <span style={{ fontSize:"12px", color:"#4ade80", fontWeight:"700" }}>↑+2.4%</span>
            </div>
          </div>
          {/* Circular progress */}
          <div style={{ position:"relative", width:"60px", height:"60px" }}>
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="24" fill="none" stroke="var(--border)" strokeWidth="4"/>
              <circle cx="30" cy="30" r="24" fill="none" stroke="var(--accent)" strokeWidth="4"
                strokeDasharray={`${(score/100)*150.8} 150.8`} strokeLinecap="round"
                transform="rotate(-90 30 30)"/>
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", fontWeight:"700", color:"var(--accent)" }}>
              {score}%
            </div>
          </div>
        </div>
      </div>

      {/* 2-col stat cards */}
      {stats && (
        <div className="bv-stat-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>
          <MiniStatCard label="TOTAL NOTES" value={stats.total}    icon="📄" iconBg="#ede9fe"/>
          <MiniStatCard label="ACTIVE TIME" value={`${stats.thisWeek * 10}m`} icon="⏱️" iconBg="#dbeafe"/>
        </div>
      )}
    </div>
  );
}

function MiniStatCard({ label, value, icon, iconBg }) {
  return (
    <div style={{ background:"var(--surface)", borderRadius:"14px", padding:"16px", border:"1px solid var(--border)", boxShadow:"var(--card-shadow)" }}>
      <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:iconBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"17px", marginBottom:"10px" }}>
        {icon}
      </div>
      <div style={{ fontSize:"9px", fontWeight:"700", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"4px" }}>{label}</div>
      <div style={{ fontSize:"22px", fontWeight:"800", color:"var(--text-primary)" }}>{value ?? "–"}</div>
    </div>
  );
}

// ── Desktop Stat Card ────────────────────────────────────────────────────────
function StatCard({ label, value, change, emoji, isNeg }) {
  const iconBgs = { "📄":"#ede9fe","📅":"#dbeafe","📦":"#fef3c7","🔥":"#fce7f3" };
  return (
    <div style={{ background:"var(--surface)", borderRadius:"16px", padding:"20px", border:"1px solid var(--border)", boxShadow:"var(--card-shadow)" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"14px" }}>
        <div style={{ width:"42px", height:"42px", borderRadius:"12px", background:iconBgs[emoji]||"#ede9fe", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>
          {emoji}
        </div>
        <span style={{ fontSize:"11px", fontWeight:"700", padding:"3px 8px", borderRadius:"20px", background:isNeg?"rgba(239,68,68,0.08)":"rgba(22,163,74,0.08)", color:isNeg?"#ef4444":"#16a34a" }}>
          {change}
        </span>
      </div>
      <div style={{ fontSize:"12px", color:"var(--text-muted)", fontWeight:"600", marginBottom:"4px" }}>{label}</div>
      <div style={{ fontSize:"24px", fontWeight:"800", color:"var(--text-primary)", letterSpacing:"-0.5px" }}>{value ?? "–"}</div>
    </div>
  );
}

// ── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data, isDark }) {
  if (!data || data.length === 0)
    return <p style={{ color:"var(--text-muted)", fontSize:"13px", marginTop:"12px" }}>No activity yet.</p>;

  const W=600, H=120, pad=8;
  const recent = data.slice(-7);
  const max    = Math.max(...recent.map(d=>d.count), 1);
  const barW   = (W - pad*2) / recent.length - 6;
  const days   = ["MON","TUE","WED","THU","FRI","SAT","SUN"];

  return (
    <svg viewBox={`0 0 ${W} ${H+28}`} style={{ width:"100%", height:"160px", marginTop:"8px" }}>
      {recent.map((d,i)=>{
        const barH = Math.max(4, (d.count/max)*(H-16));
        const x    = pad + i*(barW+6);
        const y    = H - barH;
        const isMax = d.count === max;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="6"
              fill={isMax ? "#7c3aed" : isDark ? "rgba(124,58,237,0.35)" : "rgba(124,58,237,0.18)"}
            />
            <text x={x+barW/2} y={H+18} textAnchor="middle" fontSize="9" fill={isMax?"var(--accent)":"var(--text-muted)"} fontFamily="inherit" fontWeight={isMax?"700":"400"}>
              {days[i] || ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Tags list (desktop sidebar) ──────────────────────────────────────────────
function TagsList({ tags, onTagClick, isDark }) {
  const palettes=[{bg:"#ede9fe",dot:"#7c3aed"},{bg:"#fef3c7",dot:"#f59e0b"},{bg:"#d1fae5",dot:"#10b981"},{bg:"#fce7f3",dot:"#ec4899"},{bg:"#dbeafe",dot:"#3b82f6"},{bg:"#fde8d8",dot:"#f97316"}];
  return (
    <div style={{ background:"var(--surface)", borderRadius:"16px", padding:"20px", border:"1px solid var(--border)", boxShadow:"var(--card-shadow)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px" }}>
        <h3 style={{ fontSize:"14px", fontWeight:"700", color:"var(--text-primary)" }}>Most Used Tags</h3>
        <button style={{ fontSize:"12px", color:"var(--accent)", fontWeight:"600", background:"none", border:"none", cursor:"pointer" }}>View All</button>
      </div>
      {tags.slice(0,6).map((t,i)=>{
        const p=palettes[i%palettes.length];
        return (
          <div key={t._id} onClick={()=>onTagClick(t._id)}
            style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 10px", borderRadius:"10px", cursor:"pointer", transition:"background 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.background="var(--accent-soft)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <div style={{ width:"28px", height:"28px", borderRadius:"8px", background:isDark?`${p.dot}20`:p.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:p.dot }}/>
              </div>
              <span style={{ fontSize:"13px", fontWeight:"600", color:"var(--text-primary)" }}>{t._id}</span>
            </div>
            <span style={{ fontSize:"11px", color:"var(--text-muted)", fontWeight:"500" }}>{t.count} notes</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({length:totalPages},(_,i)=>i+1);
  return (
    <div style={{ display:"flex", justifyContent:"center", gap:"6px", marginTop:"28px", flexWrap:"wrap" }}>
      <PgBtn label="‹" onClick={()=>onPageChange(currentPage-1)} disabled={currentPage===1}/>
      {pages.map(p=><PgBtn key={p} label={p} onClick={()=>onPageChange(p)} active={p===currentPage}/>)}
      <PgBtn label="›" onClick={()=>onPageChange(currentPage+1)} disabled={currentPage===totalPages}/>
    </div>
  );
}
function PgBtn({ label, onClick, disabled, active }) {
  return (
    <button className="bv-page-btn" onClick={onClick} disabled={disabled}
      style={{ minWidth:"36px", height:"36px", borderRadius:"8px", border:"1px solid var(--border2)", background:active?"#7c3aed":"var(--surface)", color:active?"#fff":"var(--text-secondary)", fontSize:"13px", fontWeight:"600", cursor:disabled?"default":"pointer", opacity:disabled?.4:1, transition:"all 0.15s" }}>
      {label}
    </button>
  );
}

const badge = { fontSize:"10px", fontWeight:"700", padding:"2px 7px", borderRadius:"20px", background:"var(--badge-bg)", color:"var(--badge-color)", minWidth:"20px", textAlign:"center" };

// ── Mobile Drawer ─────────────────────────────────────────────────────────────
function MobileDrawer({ sidebarOpen, setSidebarOpen, activeNav, handleNavClick, handleFolderClick,
  setIsModalOpen, toggleTheme, handleLogout, isDark, user, stats, folders, activeFolder, NAV, IC, badge }) {
  return (
    <div style={{
      position:"fixed", top:0, left:0, height:"100%", width:"280px",
      background:"var(--sidebar-bg)", zIndex:200,
      transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
      transition:"transform 0.28s cubic-bezier(0.4,0,0.2,1)",
      display:"flex", flexDirection:"column",
      boxShadow: sidebarOpen ? "6px 0 40px rgba(0,0,0,0.5)" : "none",
      borderRight:"1px solid var(--border)",
    }}>

      {/* Header */}
      <div style={{ padding:"20px 18px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid var(--border)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"38px", height:"38px", borderRadius:"11px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(124,58,237,0.4)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <div style={{ fontSize:"15px", fontWeight:"800", color:"var(--text-primary)", letterSpacing:"-0.3px" }}>BrainVault</div>
            <div style={{ fontSize:"10px", color:"var(--text-muted)", fontWeight:"600" }}>Personal PKM</div>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)}
          style={{ width:"32px", height:"32px", borderRadius:"9px", border:"1px solid var(--border2)", background:"var(--accent-soft)", color:"var(--text-muted)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:"16px" }}>
          ✕
        </button>
      </div>

      {/* User card */}
      <div style={{ margin:"14px 14px 8px", padding:"14px", background:"var(--accent-soft)", borderRadius:"14px", border:"1px solid var(--border2)", display:"flex", alignItems:"center", gap:"12px" }}>
        <div style={{ width:"42px", height:"42px", borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:"800", fontSize:"16px", flexShrink:0 }}>
          {user.name?.[0]?.toUpperCase()||"U"}
        </div>
        <div style={{ flex:1, overflow:"hidden" }}>
          <div style={{ fontSize:"14px", fontWeight:"700", color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</div>
          <div style={{ fontSize:"11px", color:"var(--accent)", fontWeight:"600", marginTop:"1px" }}>Pro Member ✦</div>
        </div>
        <button onClick={toggleTheme}
          style={{ width:"32px", height:"32px", borderRadius:"9px", border:"1px solid var(--border2)", background:"var(--surface)", color:"var(--text-secondary)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
          {isDark ? IC.sun : IC.moon}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"8px 10px", overflowY:"auto", display:"flex", flexDirection:"column", gap:"2px" }}>
        {/* Section label */}
        <div style={{ fontSize:"10px", fontWeight:"700", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"1.5px", padding:"4px 12px 8px" }}>Navigation</div>

        {NAV.map(item => {
          const active = activeNav === item.id;
          return (
            <div key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", borderRadius:"12px", fontSize:"14px", fontWeight:"600", cursor:"pointer", transition:"all 0.15s",
                color: active ? "var(--nav-active-color)" : "var(--text-secondary)",
                background: active ? "var(--nav-active-bg)" : "transparent",
              }}
              onMouseEnter={e=>{ if(!active) e.currentTarget.style.background="var(--nav-hover-bg)"; }}
              onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
              <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                {item.icon} {item.label}
              </div>
              {item.id==="All Notes" && stats?.total > 0    && <span style={badge}>{stats.total}</span>}
              {item.id==="Archive"   && stats?.archived > 0  && <span style={badge}>{stats.archived}</span>}
              {item.id==="Tags"      && stats?.tags?.length > 0 && <span style={badge}>{stats.tags.length}</span>}
            </div>
          );
        })}

        {/* Folders */}
        {folders.length > 0 && (
          <div style={{ marginTop:"12px" }}>
            <div style={{ fontSize:"10px", fontWeight:"700", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"1.5px", padding:"4px 12px 8px" }}>Folders</div>
            {folders.map(f => (
              <div key={f} onClick={() => handleFolderClick(f)}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", borderRadius:"10px", fontSize:"13px", fontWeight:"600", cursor:"pointer", transition:"all 0.15s",
                  color: activeFolder===f ? "var(--accent)" : "var(--text-muted)",
                  background: activeFolder===f ? "var(--accent-soft)" : "transparent",
                }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  {IC.folder} {f}
                </div>
                <span style={{ fontSize:"10px", fontWeight:"700", color:"var(--text-muted)" }}>
                  {stats?.folders?.find(x=>x._id===f)?.count||""}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Stats summary */}
        {stats && (
          <div style={{ marginTop:"16px" }}>
            <div style={{ fontSize:"10px", fontWeight:"700", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"1.5px", padding:"4px 12px 8px" }}>Quick Stats</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", padding:"0 4px" }}>
              {[
                { label:"Total Notes", value:stats.total,    emoji:"📄" },
                { label:"This Week",   value:stats.thisWeek, emoji:"📅" },
                { label:"Archived",    value:stats.archived, emoji:"📦" },
                { label:"Day Streak",  value:`${stats.streak}d`, emoji:"🔥" },
              ].map(s => (
                <div key={s.label} style={{ background:"var(--surface)", borderRadius:"10px", padding:"10px 12px", border:"1px solid var(--border)" }}>
                  <div style={{ fontSize:"14px", marginBottom:"4px" }}>{s.emoji}</div>
                  <div style={{ fontSize:"16px", fontWeight:"800", color:"var(--text-primary)", lineHeight:1 }}>{s.value ?? "–"}</div>
                  <div style={{ fontSize:"10px", color:"var(--text-muted)", fontWeight:"600", marginTop:"3px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer actions */}
      <div style={{ padding:"12px 14px 20px", borderTop:"1px solid var(--border)", display:"flex", flexDirection:"column", gap:"8px" }}>
        {/* New Note button */}
        <button onClick={() => { setIsModalOpen(true); setSidebarOpen(false); }}
          style={{ width:"100%", padding:"13px", borderRadius:"12px", border:"none", background:"#7c3aed", color:"#fff", fontSize:"14px", fontWeight:"700", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", boxShadow:"0 4px 16px rgba(124,58,237,0.4)" }}>
          {IC.plus} New Note
        </button>
        {/* Logout */}
        <button onClick={handleLogout}
          style={{ width:"100%", padding:"11px", borderRadius:"12px", border:"1px solid var(--border2)", background:"transparent", color:"var(--text-muted)", fontSize:"13px", fontWeight:"600", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}