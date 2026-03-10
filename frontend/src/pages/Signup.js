// ── pages/Signup.js ──
// Fully responsive — works on mobile (320px+), tablet, and desktop.

import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

const injectStyles = () => {
  if (document.getElementById("brainvault-auth-styles")) return;
  const style = document.createElement("style");
  style.id = "brainvault-auth-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    @keyframes bv-float   { 0%,100%{transform:translateY(0) rotate(0deg)} 33%{transform:translateY(-18px) rotate(1deg)} 66%{transform:translateY(-8px) rotate(-1deg)} }
    @keyframes bv-fadein  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes bv-shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    .bv-input:focus   { border-color:rgba(180,140,255,0.7)!important; box-shadow:0 0 0 3px rgba(150,100,255,0.18)!important; }
    .bv-input::placeholder { color:rgba(200,180,255,0.4); }
    .bv-btn-primary:hover  { transform:translateY(-1px); box-shadow:0 8px 30px rgba(255,255,255,0.25)!important; }
    .bv-link:hover         { color:#c4b5fd!important; }
    .bv-checkbox:checked   { accent-color:#a78bfa; }

    /* Mobile */
    @media (max-width: 480px) {
      .bv-card {
        padding: 24px 18px 20px !important;
        border-radius: 20px !important;
        margin: 8px !important;
      }
      .bv-h1  { font-size: 21px !important; }
      .bv-sub { font-size: 12px !important; }
      .bv-inp { font-size: 16px !important; } /* prevents iOS zoom */
      .bv-orb { display: none !important; }
    }

    /* Tablet */
    @media (min-width: 481px) and (max-width: 768px) {
      .bv-card { padding: 30px 26px !important; }
      .bv-h1   { font-size: 23px !important; }
    }
  `;
  document.head.appendChild(style);
};

export default function Signup() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [showCf,   setShowCf]   = useState(false);
  const [agreed,   setAgreed]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleGoogleResponse = useCallback(async (resp) => {
    setError(""); setLoading(true);
    try {
      const { data } = await API.post("/auth/google", { credential: resp.credential });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ name: data.name, email: data.email }));
    } catch (e) {
      setError(e.response?.data?.message || "Google sign-up failed.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    injectStyles();
    const initGoogle = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback:  handleGoogleResponse,
      });
      const el = document.getElementById("bv-google-btn-signup");
      if (el) window.google.accounts.id.renderButton(el, {
        type:"standard", theme:"filled_black",
        size:"large", width:"320", text:"signup_with", shape:"pill",
      });
    };
    if (document.getElementById("gsi-script")) { initGoogle(); return; }
    const s = document.createElement("script");
    s.id = "gsi-script"; s.src = "https://accounts.google.com/gsi/client";
    s.async = true; s.defer = true; s.onload = initGoogle;
    document.body.appendChild(s);
  }, [handleGoogleResponse]);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name.trim())         return setError("Full name is required");
    if (!email.trim())        return setError("Email is required");
    if (password.length < 6)  return setError("Password must be at least 6 characters");
    if (password !== confirm)  return setError("Passwords do not match");
    if (!agreed)              return setError("Please agree to the Terms and Privacy Policy");
    setError(""); setLoading(true);
    try {
      const { data } = await API.post("/auth/register", { name, email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ name: data.name, email: data.email }));
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={pg}>
      <div style={bg1} />
      <div style={bg2} />
      <div style={bg3} />
      <div style={bgNoise} />
      <div className="bv-orb" style={{ ...orb, width:"clamp(160px,25vw,340px)", height:"clamp(160px,25vw,340px)", top:"5%",  left:"10%", animationDelay:"0s",    background:"radial-gradient(circle,rgba(120,60,220,0.22) 0%,transparent 70%)" }} />
      <div className="bv-orb" style={{ ...orb, width:"clamp(120px,20vw,260px)", height:"clamp(120px,20vw,260px)", top:"65%", left:"68%", animationDelay:"-3.5s", background:"radial-gradient(circle,rgba(200,80,180,0.18) 0%,transparent 70%)" }} />

      <div className="bv-card" style={card}>
        <div style={iconWrap}>☀️</div>

        <h1 className="bv-h1" style={h1}>
          <span style={{ color:"#fff" }}>Create </span>
          <span style={{ color:"rgba(180,150,255,0.8)" }}>your </span>
          <span style={shimmer}>account</span>
        </h1>
        <p className="bv-sub" style={sub}>Your organized thinking starts here.</p>

        {error && <div style={errBox}>{error}</div>}

        {/* Full Name */}
        <div style={fw}>
          <label style={lbl}>Full Name</label>
          <input className="bv-input bv-inp" value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name" style={inp}
            autoComplete="name" />
        </div>

        {/* Email */}
        <div style={fw}>
          <label style={lbl}>Email</label>
          <input className="bv-input bv-inp" type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email" style={inp}
            autoComplete="email" />
        </div>

        {/* Password */}
        <div style={fw}>
          <label style={lbl}>Password</label>
          <div style={{ position:"relative" }}>
            <input className="bv-input bv-inp"
              type={showPw ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Choose password"
              style={{ ...inp, paddingRight:"44px" }}
              autoComplete="new-password" />
            <button onClick={() => setShowPw(v=>!v)} style={eyeBtn}>
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div style={fw}>
          <label style={lbl}>Confirm password</label>
          <div style={{ position:"relative" }}>
            <input className="bv-input bv-inp"
              type={showCf ? "text" : "password"} value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm password"
              style={{ ...inp, paddingRight:"44px", borderColor: confirm && confirm !== password ? "rgba(255,100,100,0.5)" : undefined }}
              autoComplete="new-password" />
            <button onClick={() => setShowCf(v=>!v)} style={eyeBtn}>
              {showCf ? "🙈" : "👁️"}
            </button>
          </div>
          {confirm && confirm !== password && (
            <span style={{ fontSize:"11px", color:"#fca5a5", marginTop:"4px", display:"block" }}>
              Passwords don't match
            </span>
          )}
        </div>

        {/* Terms checkbox */}
        <label style={{ display:"flex", alignItems:"flex-start", gap:"9px", fontSize:"13px", color:"rgba(210,190,255,0.7)", cursor:"pointer", margin:"4px 0 16px", lineHeight:"1.5" }}>
          <input className="bv-checkbox" type="checkbox" checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            style={{ width:"15px", height:"15px", flexShrink:0, marginTop:"2px" }} />
          I agree to the{" "}
          <span style={{ color:"rgba(180,150,255,0.9)", fontWeight:"600" }}>Terms</span>{" "}and{" "}
          <span style={{ color:"rgba(180,150,255,0.9)", fontWeight:"600" }}>Privacy Policy</span>
        </label>

        {/* Create Account button */}
        <button className="bv-btn-primary" onClick={handleSignup} disabled={loading}
          style={{ ...primaryBtn, opacity: loading ? 0.75 : 1 }}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        {/* Divider */}
        <div style={divider}>
          <div style={divLine}/><span style={divTxt}>Or</span><div style={divLine}/>
        </div>

        {/* Google button */}
        <div id="bv-google-btn-signup" style={{ display:"flex", justifyContent:"center", width:"100%", marginBottom:"16px" }} />

        <p style={{ textAlign:"center", fontSize:"13px", color:"rgba(200,180,255,0.5)", margin:0 }}>
          Already have an account?{" "}
          <Link to="/login" className="bv-link"
            style={{ color:"rgba(180,150,255,0.9)", fontWeight:"700", textDecoration:"none", transition:"color 0.2s" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── Style tokens ─────────────────────────────────────────────────────────────
const ff = "'Outfit','Segoe UI',sans-serif";
const pg  = { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:ff, position:"relative", overflow:"hidden", padding:"16px", boxSizing:"border-box" };
const bg1 = { position:"fixed", inset:0, zIndex:0, background:"linear-gradient(135deg,#050714 0%,#0d0920 40%,#130a2e 70%,#0a0618 100%)" };
const bg2 = { position:"fixed", top:"-20%", right:"-10%", width:"70%", height:"80%", zIndex:0, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(110,40,180,0.45) 0%,rgba(180,60,160,0.2) 40%,transparent 70%)", filter:"blur(40px)" };
const bg3 = { position:"fixed", bottom:"-20%", left:"-10%", width:"60%", height:"70%", zIndex:0, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(80,20,140,0.35) 0%,rgba(140,40,120,0.15) 50%,transparent 70%)", filter:"blur(50px)" };
const bgNoise = { position:"fixed", inset:0, zIndex:1, opacity:0.04, pointerEvents:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`, backgroundSize:"200px 200px" };
const orb = { position:"fixed", zIndex:1, borderRadius:"50%", pointerEvents:"none", animation:"bv-float 12s ease-in-out infinite" };
const card = { position:"relative", zIndex:10, width:"100%", maxWidth:"420px", background:"rgba(30,15,55,0.55)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", border:"1px solid rgba(180,140,255,0.18)", borderRadius:"24px", padding:"clamp(24px,5vw,36px) clamp(20px,5vw,32px) clamp(20px,4vw,28px)", boxShadow:"0 24px 80px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.08)", animation:"bv-fadein 0.6s ease both", boxSizing:"border-box" };
const iconWrap = { width:"44px", height:"44px", borderRadius:"14px", background:"rgba(120,80,200,0.3)", border:"1px solid rgba(180,140,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", marginBottom:"16px" };
const h1 = { fontFamily:ff, fontSize:"clamp(20px,4vw,26px)", fontWeight:"800", color:"#fff", margin:"0 0 6px", letterSpacing:"-0.5px" };
const shimmer = { background:"linear-gradient(90deg,#a78bfa,#e879f9,#a78bfa)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"bv-shimmer 3s linear infinite" };
const sub = { fontSize:"clamp(12px,2vw,13px)", color:"rgba(200,180,255,0.6)", margin:"0 0 20px", lineHeight:"1.5" };
const errBox = { background:"rgba(255,80,80,0.12)", border:"1px solid rgba(255,100,100,0.3)", borderRadius:"10px", padding:"10px 14px", fontSize:"13px", color:"#fca5a5", marginBottom:"14px" };
const fw  = { marginBottom:"12px" };
const lbl = { display:"block", fontSize:"13px", fontWeight:"500", color:"rgba(210,190,255,0.8)", marginBottom:"6px" };
const inp = { width:"100%", padding:"11px 14px", borderRadius:"12px", border:"1.5px solid rgba(150,110,220,0.3)", background:"rgba(255,255,255,0.06)", fontSize:"clamp(14px,3.5vw,15px)", color:"rgba(240,230,255,0.95)", outline:"none", boxSizing:"border-box", transition:"border-color 0.2s,box-shadow 0.2s", fontFamily:ff };
const eyeBtn = { position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(200,180,255,0.6)", fontSize:"18px", padding:"4px", touchAction:"manipulation" };
const primaryBtn = { width:"100%", padding:"13px", borderRadius:"50px", border:"none", background:"#fff", color:"#1a0a3d", fontSize:"clamp(14px,3.5vw,15px)", fontWeight:"700", cursor:"pointer", transition:"transform 0.2s,box-shadow 0.2s", fontFamily:ff, letterSpacing:"0.3px", boxShadow:"0 4px 20px rgba(255,255,255,0.15)", touchAction:"manipulation" };
const divider = { display:"flex", alignItems:"center", gap:"12px", margin:"16px 0" };
const divLine = { flex:1, height:"1px", background:"rgba(180,150,255,0.2)" };
const divTxt  = { fontSize:"13px", color:"rgba(200,180,255,0.5)", fontWeight:"500" };