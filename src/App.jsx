import { useState, useEffect } from "react";
import { useAppStore } from "./DataProvider";
import { supabase } from "./supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const GREEN = "#22c55e";

const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const CATEGORIES = ["Discipline", "Academics", "Behavior", "Sports"];

const cardIcons = {
  Students: { icon: "🎓", color: "#3b82f6" },
  "Tally & Stars": { icon: "⭐", color: "#f59e0b" },
  "Morning Bliss": { icon: "🌅", color: GREEN },
  "Prayer Attendance": { icon: "🕌", color: "#8b5cf6" },
  "Phone Pass": { icon: "📱", color: GREEN },
  "Gate Pass": { icon: "🪪", color: "#f97316" },
  Fines: { icon: "📋", color: "#ef4444" },
  "Admin Panel": { icon: "🛡️", color: GREEN },
};

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: type === "success" ? GREEN : "#ef4444", color: "#fff", padding: "10px 24px", borderRadius: 24, fontWeight: 600, fontSize: 14, zIndex: 999, whiteSpace: "nowrap" }}>
      {msg}
    </div>
  );
}

function DownloadPopup({ info, onClose }) {
  const [sharing, setSharing] = useState(false);

  if (!info) return null;

  const handleShare = async () => {
    try {
      setSharing(true);
      const file = new File([info.blob], info.name, { type: 'application/pdf' });
      const uniqueName = `report_${Date.now()}_${info.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      
      const { error } = await supabase.storage.from('morning_bliss_photos').upload(uniqueName, file);
      if (error) throw error;
      
      const publicUrl = supabase.storage.from('morning_bliss_photos').getPublicUrl(uniqueName).data.publicUrl;
      const text = `Here is the Perfomate report: ${info.name}\n\nView/Download: ${publicUrl}`;
      
      window.location.href = `whatsapp://send?text=${encodeURIComponent(text)}`;
    } catch (err) {
      console.error("Share failed", err);
      alert("Could not prepare file for WhatsApp sharing.");
    } finally {
      setSharing(false);
    }
  };

  const handlePreview = () => {
    window.open(info.url, '_blank');
  };

  const handleSave = () => {
    const a = document.createElement('a');
    a.href = info.url;
    a.download = info.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onClose();
  };

  return (
    <>
      <div 
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999, transition: "opacity 0.3s" }} 
        onClick={onClose} 
      />
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#fff", borderRadius: "24px 24px 0 0", padding: "24px 20px 32px", zIndex: 1000, boxShadow: "0 -4px 20px rgba(0,0,0,0.1)", animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <div style={{ width: 44, height: 5, background: "#e5e7eb", borderRadius: 3, margin: "0 auto 24px" }} />
        
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: "16px", background: "#22c55e15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
            📄
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#111827" }}>Report Generated</div>
            <div style={{ fontSize: 14, color: "#6b7280", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{info.name}</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <button onClick={handleShare} disabled={sharing} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "16px 20px", background: "#25D366", border: "none", borderRadius: 16, fontWeight: 700, fontSize: 15, color: "#fff", cursor: "pointer", boxShadow: "0 4px 12px rgba(37, 211, 102, 0.2)", opacity: sharing ? 0.7 : 1 }}>
            <span style={{ fontSize: 20 }}>💬</span> {sharing ? "Opening WhatsApp..." : "Share through WhatsApp"}
          </button>
          
          <a href={info.url} target="_blank" rel="noopener noreferrer" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "16px 20px", background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 16, fontWeight: 700, fontSize: 15, color: "#374151", cursor: "pointer", textDecoration: "none", boxSizing: "border-box" }}>
            <span style={{ fontSize: 20 }}>👁️</span> Preview
          </a>
          
          <button onClick={handleSave} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: 18, background: "#22c55e", border: "none", borderRadius: 16, fontWeight: 700, fontSize: 16, color: "#fff", cursor: "pointer", marginTop: 8, boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)" }}>
            <span style={{ fontSize: 18 }}>💾</span> Save to Device
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

function Header({ title, onBack, rightAction }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "16px 16px 8px", borderBottom: "1px solid #f0f0f0", background: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
      {onBack && (
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", marginRight: 8, color: "#333", padding: 0 }}>←</button>
      )}
      <span style={{ flex: 1, fontWeight: 700, fontSize: 16, color: "#1a1a1a", textAlign: onBack ? "left" : "center" }}>{title}</span>
      {rightAction}
    </div>
  );
}

function ClassGrid({ onSelect, title, onBack }) {
  const { classes } = useAppStore();
  return (
    <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
      <Header title={title} onBack={onBack} />
      <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {classes.map(cls => (
          <button key={cls} onClick={() => onSelect(cls)} style={{ background: "#fff", border: `2px solid ${GREEN}`, borderRadius: 16, padding: "24px 8px", fontWeight: 700, fontSize: 20, color: "#1a1a1a", cursor: "pointer", boxShadow: "0 2px 8px #0001" }}>
            {cls}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const { users } = useAppStore();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const handle = () => {
    if (email === "admin@gmail.com" && pass === "perfomate@123") {
      onLogin({ name: "Admin", email, role: "admin", permissions: { students: true, tally: true, morning_bliss: true, prayer: true, phone_pass: true, gate_pass: true, fines: true } });
    } else {
      const mentor = users.find(u => u.email === email);
      if (mentor) onLogin({ ...mentor });
      else setErr("Invalid credentials");
    }
  };
  return (
    <div style={{ background: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 32 }}>🏫</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#1a1a1a", marginBottom: 4 }}>Perfomate</div>
      <div style={{ fontSize: 14, color: GREEN, fontWeight: 600, marginBottom: 40 }}>Caliph Life School</div>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" style={{ width: "100%", maxWidth: 340, padding: "14px 16px", border: "1.5px solid #e0e0e0", borderRadius: 12, fontSize: 15, marginBottom: 12, outline: "none", boxSizing: "border-box" }} />
      <input value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" type="password" style={{ width: "100%", maxWidth: 340, padding: "14px 16px", border: "1.5px solid #e0e0e0", borderRadius: 12, fontSize: 15, marginBottom: 8, outline: "none", boxSizing: "border-box" }} />
      {err && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 8 }}>{err}</div>}
      <button onClick={handle} style={{ width: "100%", maxWidth: 340, padding: "14px", background: GREEN, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer", marginTop: 8 }}>Login</button>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ user, onNavigate, onLogout }) {
  const { setDownloadInfo } = useAppStore();
  const mentorCards = ["Students", "Tally & Stars", "Morning Bliss", "Prayer Attendance", "Phone Pass", "Gate Pass", "Fines"];
  const adminCards = [...mentorCards, "Admin Panel"];

  const cards = user.role === "admin" ? adminCards : mentorCards.filter(c => {
    const keyMap = { "Students": "students", "Tally & Stars": "tally", "Morning Bliss": "morning_bliss", "Prayer Attendance": "prayer", "Phone Pass": "phone_pass", "Gate Pass": "gate_pass", "Fines": "fines" };
    return user.permissions?.[keyMap[c]];
  });

  return (
    <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
      <div style={{ background: "#fff", padding: "16px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0" }}>
        <span style={{ fontSize: 22 }}>☰</span>
        <span style={{ fontWeight: 800, fontSize: 16, color: "#1a1a1a" }}>CALIPH LIFE SCHOOL</span>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
          {user.name && user.name[0]}
        </div>
      </div>
      <div style={{ padding: "20px 16px 8px" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#1a1a1a" }}>Hello,</div>
        <div style={{ fontSize: 14, color: "#6b7280", marginTop: 2 }}>{user.email}</div>
      </div>
      <div style={{ padding: "8px 16px 16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {cards.map(card => (
          <button key={card} onClick={() => onNavigate(card)} style={{ background: "#fff", border: "none", borderRadius: 16, padding: "20px 8px 14px", cursor: "pointer", boxShadow: "0 2px 10px #0001", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 28 }}>{cardIcons[card].icon}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#374151", textAlign: "center", lineHeight: 1.3 }}>{card}</span>
          </button>
        ))}
      </div>
      <div style={{ padding: "8px 16px 32px" }}>
        <button onClick={onLogout} style={{ width: "100%", padding: "12px", background: "none", border: "1.5px solid #e0e0e0", borderRadius: 12, color: "#6b7280", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Logout</button>
      </div>
    </div>
  );
}

// ─── STUDENTS ────────────────────────────────────────────────────────────────
function StudentsScreen({ onBack }) {
  const { students } = useAppStore();
  const [cls, setCls] = useState(null);
  const [student, setStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("fines");

  if (student) {
    return (
      <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
        <Header title="Student Profile" onBack={() => setStudent(null)} />
        <div style={{ padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 12, boxShadow: "0 2px 8px #0001" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 22, marginBottom: 12 }}>{student.name[0]}</div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{student.name}</div>
            <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>{student.roll} · {cls}</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, overflowX: "auto" }}>
            {["fines", "tally", "gate", "phone", "prayer"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 14px", borderRadius: 20, border: "none", background: tab === t ? GREEN : "#fff", color: tab === t ? "#fff" : "#374151", fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                {t === "fines" ? "Fines" : t === "tally" ? "Tally" : t === "gate" ? "Gate" : t === "phone" ? "Phone" : "Prayer"}
              </button>
            ))}
          </div>
          <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 2px 8px #0001" }}>
            <div style={{ color: "#6b7280", fontSize: 14, textAlign: "center", padding: "20px 0" }}>
              {tab === "fines" ? "No fines recorded" : tab === "tally" ? "No tally records" : tab === "gate" ? "No gate passes" : tab === "phone" ? "No phone passes" : "No prayer records"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cls) {
    const list = (students[cls] || []).filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.toLowerCase().includes(search.toLowerCase()));
    return (
      <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
        <Header title={`Class ${cls}`} onBack={() => { setCls(null); setSearch(""); }} />
        <div style={{ padding: 12 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." style={{ width: "100%", padding: "12px 16px", border: "1.5px solid #e0e0e0", borderRadius: 12, fontSize: 14, marginBottom: 12, boxSizing: "border-box", outline: "none" }} />
          {list.map(s => (
            <button key={s.id} onClick={() => setStudent(s)} style={{ width: "100%", background: "#fff", border: "none", borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", boxShadow: "0 1px 4px #0001" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e8fdf0", display: "flex", alignItems: "center", justifyContent: "center", color: GREEN, fontWeight: 700, fontSize: 16 }}>{s.name[0]}</div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: "#1a1a1a" }}>{s.name}</div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>{s.roll}</div>
              </div>
            </button>
          ))}
          {list.length === 0 && <div style={{ textAlign: "center", color: "#6b7280", padding: 32 }}>No students found</div>}
        </div>
      </div>
    );
  }

  return <ClassGrid title="Students" onBack={onBack} onSelect={cls => { setCls(cls); setSearch(""); }} />;
}

// ─── TALLY & STARS ────────────────────────────────────────────────────────────
function TallyScreen({ onBack }) {
  const { students: MOCK_TALLY, loadData, pointRules, pointLogs } = useAppStore();
  const [category, setCategory] = useState(null); // tally | stars | others
  const [cls, setCls] = useState(null);
  const [student, setStudent] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const [toast, setToast] = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  if (student) {
    const rules = pointRules.filter(r => r.category === category);
    const history = pointLogs.filter(l => l.student_id === student.id && l.category === category);
    return (
      <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
        <Header title={`Add ${category}`} onBack={() => setStudent(null)} rightAction={
          <button onClick={() => setShowAdd(true)} style={{ background: GREEN, color: "#fff", border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add</button>
        } />
        <Toast msg={toast} type="success" />
        <div style={{ padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 2px 8px #0001" }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{student.name}</div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>{student.roll} · {cls}</div>
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <div style={{ color: "#ef4444", fontWeight: 700, fontSize: 14 }}>Tally: {student.tally_points}</div>
              <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: 14 }}>Stars: {student.star_points}</div>
              <div style={{ color: "#3b82f6", fontWeight: 700, fontSize: 14 }}>Others: {student.other_points}</div>
            </div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Reason History</div>
          {history.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 16, padding: 20, textAlign: "center", color: "#6b7280" }}>No history for {category}. Click + Add to assign some!</div>
          ) : history.map(log => (
            <div key={log.id} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px #0001" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{log.reason}</div>
                <div style={{ color: "#9ca3af", fontSize: 11, marginTop: 4 }}>{new Date(log.created_at).toLocaleDateString()}</div>
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: log.value > 0 ? GREEN : "#ef4444" }}>{log.value > 0 ? '+' : ''}{log.value}</span>
            </div>
          ))}
        </div>

        {showAdd && (
          <div style={{ position: "fixed", inset: 0, background: "#0008", display: "flex", alignItems: "flex-end", zIndex: 100 }} onClick={() => setShowAdd(false)}>
            <div style={{ background: "#f8f8f8", width: "100%", height: "80vh", borderRadius: "20px 20px 0 0", padding: 20, overflowY: "auto" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>Select Rule</div>
                <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", fontSize: 20, fontWeight: 700, cursor: "pointer", color: "#6b7280" }}>✕</button>
              </div>
              {rules.length === 0 && <div style={{ textAlign: "center", color: "#6b7280", marginTop: 20 }}>No reasons defined by admin for {category}.</div>}
              {rules.map(rule => (
                <button key={rule.id} onClick={async () => {
                  const col = category === "tally" ? "tally_points" : category === "stars" ? "star_points" : "other_points";
                  await supabase.from('students').update({ [col]: student[col] + rule.value, points: student.points + rule.value }).eq('id', student.id);
                  await supabase.from('point_logs').insert({ student_id: student.id, category, reason: rule.reason, value: rule.value });
                  await loadData();
                  showToast(`${rule.value > 0 ? '+' : ''}${rule.value} applied successfully!`);
                  setShowAdd(false);
                }} style={{ width: "100%", background: "#fff", border: "none", borderRadius: 14, padding: "16px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", boxShadow: "0 1px 4px #0001" }}>
                  <span style={{ fontWeight: 600, fontSize: 15, color: "#1a1a1a" }}>{rule.reason}</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: rule.value > 0 ? GREEN : "#ef4444" }}>{rule.value > 0 ? '+' : ''}{rule.value}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (cls) {
    const list = MOCK_TALLY[cls] || [];
    return (
      <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
        <Header title={`${category} — ${cls}`} onBack={() => setCls(null)} />
        <div style={{ padding: 12 }}>
          {list.map((s) => (
            <button key={s.id} onClick={() => setStudent(s)} style={{ width: "100%", background: "#fff", border: "none", borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", boxShadow: "0 1px 4px #0001" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", fontWeight: 700, fontSize: 16 }}>{s.name[0]}</div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>{s.roll}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: category === "tally" ? "#ef4444" : category === "stars" ? "#f59e0b" : "#3b82f6" }}>
                {category === "tally" ? s.tally_points : category === "stars" ? s.star_points : s.other_points} pts
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (category) {
    return <ClassGrid title={`Select Class (${category})`} onBack={() => setCategory(null)} onSelect={setCls} />;
  }

  return (
    <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
      <Header title="Manage Points" onBack={onBack} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        {[{ id: "tally", icon: "📋", label: "Tally", color: "#ef4444" }, { id: "stars", icon: "⭐", label: "Stars", color: "#f59e0b" }, { id: "others", icon: "📌", label: "Others", color: "#3b82f6" }].map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)} style={{ background: "#fff", border: "none", borderRadius: 16, padding: 24, display: "flex", alignItems: "center", gap: 16, cursor: "pointer", boxShadow: "0 2px 8px #0001" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: c.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: c.color }}>{c.icon}</div>
            <div style={{ textAlign: "left", flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#1a1a1a", textTransform: "capitalize" }}>{c.label}</div>
              <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Assign {c.label.toLowerCase()} to students</div>
            </div>
            <span style={{ color: "#9ca3af", fontSize: 20 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}


// (Other screens converted to use components properly but safely mocking untracked DB until later integration)
function MorningBlissScreen({ onBack }) {
  const { classes, students, morningBliss, loadData, triggerDownload } = useAppStore();
  const [cls, setCls] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewPhoto, setViewPhoto] = useState(null);

  const [form, setForm] = useState({ student_id: "", topic: "", mark: "", files: [] });
  const [toast, setToast] = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const today = new Date().toISOString().split("T")[0];

  if (!cls) {
    const allDates = [...new Set(morningBliss.map(m => m.date))].sort().reverse();
    const displayDate = allDates.includes(today) ? today : (allDates[0] || today);
    const isShowingToday = displayDate === today;

    const globalToday = morningBliss.filter(m => m.date === displayDate);
    let globalToppers = [];
    if (globalToday.length > 0) {
      const maxMark = Math.max(...globalToday.map(m => m.mark));
      globalToppers = globalToday.filter(m => m.mark === maxMark);
    }

    const handleDownloadGlobalPDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(34, 197, 94); // GREEN
      doc.text(`Morning Bliss Global Report`, 14, 22);
      doc.setFontSize(12);
      doc.setTextColor(107, 114, 128);
      doc.text(`Date: ${displayDate} · Comprehensive School Report`, 14, 30);

      const tableData = [];
      classes.forEach(c => {
        const classRecords = morningBliss.filter(m => m.class_id === c && m.date === displayDate);
        if (classRecords.length > 0) {
          classRecords.forEach(r => {
            tableData.push([
              c,
              (students[c] || []).find(s => s.id === r.student_id)?.name || "Unknown",
              r.topic,
              `${r.mark}/10`,
              r.evaluated_by || "-"
            ]);
          });
        }
      });

      autoTable(doc, {
        startY: 40,
        head: [['Class', 'Student Name', 'Topic', 'Mark', 'Evaluator']],
        body: tableData,
        headStyles: { fillColor: [34, 197, 94] }
      });
      triggerDownload(doc, `Morning_Bliss_Global_${displayDate}.pdf`);
    };

    const getSName = (cid, sid) => (students[cid] || []).find(s => s.id === Number(sid))?.name || "Unknown";

    return (
      <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
        <Header title="Morning Bliss" onBack={onBack} />
        <div style={{ padding: 16 }}>
          <button onClick={handleDownloadGlobalPDF} style={{ width: "100%", padding: 14, background: "#fff", color: GREEN, border: `2px solid ${GREEN}`, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span>📄</span> Download Global Report ({displayDate})
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {classes.map(c => (
              <button key={c} onClick={() => setCls(c)} style={{ background: "#fff", border: `2px solid ${GREEN}`, borderRadius: 16, padding: "24px 8px", fontWeight: 700, fontSize: 20, color: "#1a1a1a", cursor: "pointer", boxShadow: "0 2px 8px #0001" }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {globalToppers.length > 0 && (
          <div style={{ padding: "0 16px 16px" }}>
            <div style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", borderRadius: 16, padding: 20, color: "#fff", boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)" }}>
              <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                👑 {isShowingToday ? "Today's Topper" : `Last Session Topper (${displayDate})`}
              </div>
              {globalToppers.map((gt, idx) => (
                <div key={gt.id} style={{ borderTop: idx > 0 ? "1px solid #fff3" : "none", paddingTop: idx > 0 ? 12 : 0, marginTop: idx > 0 ? 12 : 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{getSName(gt.class_id, gt.student_id)} <span style={{ fontSize: 15, fontWeight: 600, opacity: 0.9 }}>— {gt.class_id}</span></div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{gt.topic} · {gt.mark}/10</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: "0 16px 32px" }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Global Records — {displayDate}</div>
          {globalToday.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, textAlign: "center", color: "#6b7280" }}>No records.</div>
          ) : globalToday.map(r => (
            <div key={r.id} style={{ background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 12, boxShadow: "0 1px 4px #0001" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: r.photos.length > 0 ? 10 : 0 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{getSName(r.class_id, r.student_id)} <span style={{ color: "#6b7280", fontSize: 13 }}>— {r.class_id}</span></div>
                  <div style={{ color: "#6b7280", fontSize: 14, marginTop: 2 }}>{r.topic}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, color: GREEN }}>{r.mark}<span style={{ fontSize: 12, color: "#9ca3af" }}>/10</span></div>
              </div>
              {r.photos.length > 0 && (
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                  {r.photos.map((p, i) => (
                    <img key={i} src={p} onClick={() => setViewPhoto(p)} alt="bliss" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #e0e0e0", cursor: "pointer" }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {viewPhoto && (
          <div style={{ position: "fixed", inset: 0, background: "#000e", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setViewPhoto(null)}>
            <img src={viewPhoto} style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", borderRadius: 12 }} />
            <button onClick={() => setViewPhoto(null)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#fff", fontSize: 32, cursor: "pointer" }}>✕</button>
          </div>
        )}
      </div>
    );
  }

  const todaysRecords = morningBliss.filter(m => m.class_id === cls && m.date === today);
  const getStudentName = id => (students[cls] || []).find(s => s.id === Number(id))?.name || "Unknown";
  let todaysToppers = [];
  if (todaysRecords.length > 0) {
    const max = Math.max(...todaysRecords.map(r => r.mark));
    todaysToppers = todaysRecords.filter(r => r.mark === max);
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Morning Bliss Report - ${cls}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Date: ${today}`, 14, 30);

    if (topper) doc.text(`👑 Topper: ${getStudentName(topper.student_id)} (${topper.mark}/10)`, 14, 40);

    const tableData = todaysRecords.map((r, i) => [
      i + 1,
      getStudentName(r.student_id),
      r.topic,
      `${r.mark}/10`,
      r.photos.length > 0 ? `${r.photos.length} photos` : 'None'
    ]);

    doc.autoTable({
      startY: 50,
      head: [['#', 'Student Name', 'Topic', 'Mark', 'Photos']],
      body: tableData,
    });
    triggerDownload(doc, `Morning_Bliss_${cls}_${today}.pdf`);
  };

  return (
    <div style={{ background: "#f8f8f8", minHeight: "100vh", position: "relative" }}>
      <Header title={`Morning Bliss — ${cls}`} onBack={() => setCls(null)} rightAction={
        <button onClick={() => setShowAdd(true)} style={{ background: GREEN, color: "#fff", border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add</button>
      } />
      <Toast msg={toast} type="success" />

      <div style={{ padding: 16 }}>
        {todaysToppers.length > 0 && (
          <div style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", borderRadius: 16, padding: 20, marginBottom: 16, color: "#fff", boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>👑 Today's Topper</div>
            {todaysToppers.map((t, idx) => (
              <div key={t.id} style={{ borderTop: idx > 0 ? "1px solid #fff3" : "none", paddingTop: idx > 0 ? 12 : 0, marginTop: idx > 0 ? 12 : 0 }}>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{getStudentName(t.student_id)}</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{t.topic} · {t.mark}/10</div>
              </div>
            ))}
          </div>
        )}

        {todaysRecords.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, textAlign: "center", color: "#6b7280" }}>No records yet today.</div>
        ) : (
          todaysRecords.map(r => (
            <div key={r.id} style={{ background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 12, boxShadow: "0 1px 4px #0001" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: r.photos.length > 0 ? 10 : 0 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{getStudentName(r.student_id)}</div>
                  <div style={{ color: "#6b7280", fontSize: 14, marginTop: 2 }}>{r.topic}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, color: GREEN }}>{r.mark}<span style={{ fontSize: 12, color: "#9ca3af" }}>/10</span></div>
              </div>
              {r.photos.length > 0 && (
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                  {r.photos.map((p, i) => (
                    <img key={i} onClick={() => setViewPhoto(p)} src={p} alt="bliss" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #e0e0e0", cursor: "pointer" }} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {todaysRecords.length > 0 && (
          <button onClick={handleDownloadPDF} style={{ width: "100%", padding: 14, background: "#fff", color: "#374151", border: "2px solid #e5e7eb", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 8 }}>
            📄 Download Today's Report (PDF)
          </button>
        )}
      </div>

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "#0008", display: "flex", alignItems: "flex-end", zIndex: 100 }} onClick={() => !uploading && setShowAdd(false)}>
          <div style={{ background: "#f8f8f8", width: "100%", borderRadius: "20px 20px 0 0", padding: 20, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Record Morning Bliss</div>
              {!uploading && <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", fontSize: 20, fontWeight: 700, cursor: "pointer", color: "#6b7280" }}>✕</button>}
            </div>

            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Student</div>
            <select value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 12, outline: "none", background: "#fff" }}>
              <option value="" disabled>Select Student...</option>
              {(students[cls] || []).map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll})</option>)}
            </select>

            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Topic</div>
            <input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="What did they present?" style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 12, outline: "none", boxSizing: "border-box" }} />

            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Mark / 10</div>
            <input type="number" min="0" max="10" value={form.mark} onChange={e => setForm({ ...form, mark: e.target.value })} placeholder="0 - 10" style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 12, outline: "none", boxSizing: "border-box" }} />

            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Photos (Max 4)</div>
            <input type="file" multiple accept="image/*" onChange={e => {
              const fs = Array.from(e.target.files);
              if (fs.length > 4) {
                showToast("Maximum 4 photos allowed!");
                setForm({ ...form, files: fs.slice(0, 4) });
              } else {
                setForm({ ...form, files: fs });
              }
            }} style={{ width: "100%", padding: "10px", background: "#fff", border: "1.5px dashed #d1d5db", borderRadius: 10, fontSize: 13, marginBottom: 16 }} />

            <button disabled={uploading || !form.student_id || !form.topic || !form.mark} onClick={async () => {
              setUploading(true);
              const photoUrls = [];
              for (const file of form.files) {
                const ext = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
                const { data, error } = await supabase.storage.from('morning_bliss_photos').upload(fileName, file);
                if (data) {
                  const url = supabase.storage.from('morning_bliss_photos').getPublicUrl(fileName).data.publicUrl;
                  photoUrls.push(url);
                }
              }
              await supabase.from('morning_bliss').insert({
                date: today,
                class_id: cls,
                student_id: Number(form.student_id),
                topic: form.topic,
                mark: Number(form.mark),
                photos: photoUrls,
                evaluated_by: user.short_name || user.name
              });
              await loadData();
              setForm({ student_id: "", topic: "", mark: "", files: [] });
              setShowAdd(false);
              setUploading(false);
              showToast("Recorded permanently!");
            }} style={{ width: "100%", padding: 14, background: GREEN, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: uploading ? 0.7 : 1 }}>
              {uploading ? "Uploading & Saving..." : "Save Record"}
            </button>
          </div>
        </div>
      )}

      {viewPhoto && (
        <div style={{ position: "fixed", inset: 0, background: "#000e", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setViewPhoto(null)}>
          <img src={viewPhoto} style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", borderRadius: 12 }} />
          <button onClick={() => setViewPhoto(null)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#fff", fontSize: 32, cursor: "pointer" }}>✕</button>
        </div>
      )}
    </div>
  );
}

function PrayerScreen({ onBack }) {
  const { classes, students, loadData } = useAppStore();
  const [date, setDate] = useState("2026-04-13");
  const [prayer, setPrayer] = useState("Fajr");
  const [cls, setCls] = useState("C1A");
  const [attendance, setAttendance] = useState({});
  const [tab, setTab] = useState("mark");
  const [toast, setToast] = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };
  const currentStudents = students[cls] || [];
  const toggle = (id) => setAttendance(a => ({ ...a, [id]: a[id] === "present" ? "absent" : "present" }));

  return (
    <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
      <Header title="Prayer Attendance" onBack={onBack} />
      <Toast msg={toast} type="success" />
      <div style={{ display: "flex", padding: "12px 16px 0" }}>
        {["mark", "history"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "10px", border: "none", background: tab === t ? GREEN : "#f3f4f6", color: tab === t ? "#fff" : "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer", borderRadius: t === "mark" ? "10px 0 0 10px" : "0 10px 10px 0" }}>
            {t === "mark" ? "Mark" : "History"}
          </button>
        ))}
      </div>
      <div style={{ padding: 16 }}>
        {tab === "mark" ? (
          <>
            <div style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 2px 8px #0001" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Date</div>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Class</div>
                  <select value={cls} onChange={e => setCls(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 13, outline: "none" }}>
                    {classes.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Prayer</div>
              <div style={{ display: "flex", gap: 6 }}>
                {PRAYERS.map(p => (
                  <button key={p} onClick={() => setPrayer(p)} style={{ flex: 1, padding: "8px 2px", border: "none", borderRadius: 8, background: prayer === p ? "#8b5cf6" : "#f3f4f6", color: prayer === p ? "#fff" : "#374151", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>{p}</button>
                ))}
              </div>
            </div>
            {currentStudents.map(s => (
              <button key={s.id} onClick={() => toggle(s.id)} style={{ width: "100%", background: "#fff", border: `2px solid ${attendance[s.id] === "present" ? GREEN : attendance[s.id] === "absent" ? "#ef4444" : "#e0e0e0"}`, borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", boxShadow: "0 1px 4px #0001" }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</div>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>{s.roll}</div>
                </div>
                <div style={{ padding: "6px 14px", borderRadius: 20, background: attendance[s.id] === "present" ? GREEN : attendance[s.id] === "absent" ? "#ef4444" : "#f3f4f6", color: attendance[s.id] ? "#fff" : "#6b7280", fontWeight: 700, fontSize: 13 }}>
                  {attendance[s.id] === "present" ? "Present" : attendance[s.id] === "absent" ? "Absent" : "—"}
                </div>
              </button>
            ))}
            <button onClick={async () => {
              for (const [id, stat] of Object.entries(attendance)) {
                await supabase.from('prayer_attendance').insert({ date, class_name: cls, prayer, student_id: Number(id), status: stat });
              }
              await loadData();
              showToast("Attendance submitted!");
            }} style={{ width: "100%", padding: 14, background: GREEN, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 8 }}>Submit All</button>
          </>
        ) : (
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, textAlign: "center", color: "#6b7280" }}>History stored in Supabase</div>
        )}
      </div>
    </div>
  );
}

function PhonePassScreen({ onBack }) {
  const { phonePasses, loadData } = useAppStore();
  const [tab, setTab] = useState("issue");
  const [form, setForm] = useState({ student: "", reason: "" });
  const [toast, setToast] = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const active = phonePasses.filter(p => p.status === 'active');

  return (
    <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
      <Header title="Phone Pass" onBack={onBack} />
      <Toast msg={toast} type="success" />
      <div style={{ display: "flex", padding: "12px 16px 0" }}>
        {["issue", "active"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "10px", border: "none", background: tab === t ? GREEN : "#f3f4f6", color: tab === t ? "#fff" : "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer", borderRadius: t === "issue" ? "10px 0 0 10px" : "0 10px 10px 0" }}>
            {t === "issue" ? "Issue" : `Active (${active.length})`}
          </button>
        ))}
      </div>
      <div style={{ padding: 16 }}>
        {tab === "issue" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 8px #0001" }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Student Name</div>
            <input value={form.student} onChange={e => setForm({ ...form, student: e.target.value })} placeholder="Search student..." style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 14, outline: "none", boxSizing: "border-box" }} />
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Reason</div>
            <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason for phone use..." style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box" }} />
            <button onClick={async () => {
              if (!form.student || !form.reason) return;
              await supabase.from('phone_passes').insert({ student_name: form.student, reason: form.reason, time_issued: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), status: 'active' });
              setForm({ student: "", reason: "" });
              await loadData();
              showToast("Phone pass issued!");
              setTab("active");
            }}
              style={{ width: "100%", padding: 13, background: GREEN, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Issue Pass</button>
          </div>
        )}
        {tab === "active" && (
          <>
            {active.length === 0 && <div style={{ background: "#fff", borderRadius: 16, padding: 24, textAlign: "center", color: "#6b7280" }}>No active passes</div>}
            {active.map(p => (
              <div key={p.id} style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 10, boxShadow: "0 1px 4px #0001" }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{p.student_name}</div>
                <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>{p.reason} · Issued: {p.time_issued}</div>
                <button onClick={async () => {
                  await supabase.from('phone_passes').update({ status: 'returned' }).eq('id', p.id);
                  loadData();
                  showToast("Marked as returned!");
                }}
                  style={{ marginTop: 10, padding: "8px 18px", background: "#dcfce7", color: "#15803d", border: "none", borderRadius: 20, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✓ Mark Returned</button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function GatePassScreen({ onBack }) {
  const { gatePasses, loadData } = useAppStore();
  const [tab, setTab] = useState("issue");
  const [form, setForm] = useState({ student: "", reason: "", returnTime: "" });
  const [toast, setToast] = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const passes = gatePasses.filter(p => p.status === 'out');

  return (
    <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
      <Header title="Gate Pass" onBack={onBack} />
      <Toast msg={toast} type="success" />
      <div style={{ display: "flex", padding: "12px 16px 0" }}>
        {["issue", "today"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "10px", border: "none", background: tab === t ? "#f97316" : "#f3f4f6", color: tab === t ? "#fff" : "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer", borderRadius: t === "issue" ? "10px 0 0 10px" : "0 10px 10px 0" }}>
            {t === "issue" ? "Issue" : `Today (${passes.length})`}
          </button>
        ))}
      </div>
      <div style={{ padding: 16 }}>
        {tab === "issue" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 8px #0001" }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Student</div>
            <input value={form.student} onChange={e => setForm({ ...form, student: e.target.value })} placeholder="Search student..." style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 14, outline: "none", boxSizing: "border-box" }} />
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Reason</div>
            <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason for leaving..." style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 14, outline: "none", boxSizing: "border-box" }} />
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Expected Return</div>
            <input type="time" value={form.returnTime} onChange={e => setForm({ ...form, returnTime: e.target.value })} style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box" }} />
            <button onClick={async () => {
              if (!form.student || !form.reason) return;
              await supabase.from('gate_passes').insert({ student_name: form.student, reason: form.reason, time_return: form.returnTime, status: 'out' });
              setForm({ student: "", reason: "", returnTime: "" });
              loadData();
              showToast("Gate pass issued!"); setTab("today");
            }} style={{ width: "100%", padding: 13, background: "#f97316", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Issue Gate Pass</button>
          </div>
        )}
        {tab === "today" && passes.map(p => (
          <div key={p.id} style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 10, boxShadow: "0 1px 4px #0001" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{p.student_name}</div>
                <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>{p.reason}</div>
                <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>Return by: {p.time_return}</div>
              </div>
              <span style={{ padding: "4px 12px", borderRadius: 20, background: p.status === "out" ? "#fff7ed" : "#dcfce7", color: p.status === "out" ? "#f97316" : "#15803d", fontWeight: 700, fontSize: 12 }}>{p.status === "out" ? "OUT" : "RETURNED"}</span>
            </div>
            {p.status === "out" && <button onClick={async () => {
              await supabase.from('gate_passes').update({ status: 'returned' }).eq('id', p.id);
              loadData();
              showToast("Marked as returned!");
            }} style={{ marginTop: 10, padding: "8px 18px", background: "#dcfce7", color: "#15803d", border: "none", borderRadius: 20, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✓ Mark Returned</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function FinesScreen({ onBack }) {
  const { fines, loadData } = useAppStore();
  const [tab, setTab] = useState("unpaid");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ student: "", amount: "", reason: "" });
  const [toast, setToast] = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const total = fines.filter(f => f.status === "unpaid").reduce((a, f) => a + f.amount, 0);
  const list = fines.filter(f => f.status === tab);

  return (
    <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
      <Header title="Fines" onBack={onBack} rightAction={
        <button onClick={() => setShowAdd(true)} style={{ background: GREEN, color: "#fff", border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add</button>
      } />
      <Toast msg={toast} type="success" />
      <div style={{ margin: "12px 16px", background: GREEN, borderRadius: 16, padding: "14px 20px", color: "#fff" }}>
        <div style={{ fontSize: 13, opacity: 0.9 }}>Total Outstanding</div>
        <div style={{ fontSize: 28, fontWeight: 800 }}>₹{total}</div>
      </div>
      <div style={{ display: "flex", margin: "0 16px 12px" }}>
        {["unpaid", "paid"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "10px", border: "none", background: tab === t ? "#ef4444" : "#f3f4f6", color: tab === t ? "#fff" : "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer", borderRadius: t === "unpaid" ? "10px 0 0 10px" : "0 10px 10px 0", textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>
      <div style={{ padding: "0 16px 16px" }}>
        {list.length === 0 && <div style={{ background: "#fff", borderRadius: 16, padding: 24, textAlign: "center", color: "#6b7280" }}>No {tab} fines</div>}
        {list.map(f => (
          <div key={f.id} style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 10, boxShadow: "0 1px 4px #0001" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{f.student_name}</div>
                <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>{f.class_name} · {f.date}</div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>{f.reason}</div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 20, color: "#ef4444" }}>₹{f.amount}</div>
            </div>
            {f.status === "unpaid" && <button onClick={async () => {
              await supabase.from('fines').update({ status: 'paid' }).eq('id', f.id);
              loadData();
              showToast("Marked as paid!");
            }} style={{ marginTop: 10, padding: "8px 18px", background: "#dcfce7", color: "#15803d", border: "none", borderRadius: 20, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✓ Mark as Paid</button>}
          </div>
        ))}
      </div>
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "#0008", display: "flex", alignItems: "flex-end", zIndex: 100 }} onClick={() => setShowAdd(false)}>
          <div style={{ background: "#fff", width: "100%", borderRadius: "20px 20px 0 0", padding: 24 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Add Fine</div>
            <input value={form.student} onChange={e => setForm({ ...form, student: e.target.value })} placeholder="Student name" style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 12, outline: "none", boxSizing: "border-box" }} />
            <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="Amount (₹)" style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 12, outline: "none", boxSizing: "border-box" }} />
            <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason" style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box" }} />
            <button onClick={async () => {
              if (!form.student || !form.amount) return;
              await supabase.from('fines').insert({ student_name: form.student, class_name: "—", amount: Number(form.amount), reason: form.reason, status: "unpaid", date: new Date().toISOString().split("T")[0] });
              setForm({ student: "", amount: "", reason: "" }); setShowAdd(false);
              loadData();
              showToast("Fine added!");
            }} style={{ width: "100%", padding: 14, background: "#ef4444", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Add Fine</button>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel({ onBack }) {
  const { classes, students, users, loadData, pointRules, morningBliss, prayerAttendance, fines, pointLogs, triggerDownload } = useAppStore();
  const [section, setSection] = useState("home");
  const [ruleCat, setRuleCat] = useState("tally");
  const [ruleForm, setRuleForm] = useState({ reason: "", value: "" });

  const [newClass, setNewClass] = useState("");
  const [selCls, setSelCls] = useState("C1A");

  const [toast, setToast] = useState("");
  const [addStudentForm, setAddStudentForm] = useState({ name: "", roll: "", cls: "C1A" });
  const [addUserForm, setAddUserForm] = useState({ name: "", shortName: "", email: "", password: "", permissions: { students: true, tally: true, morning_bliss: true, prayer: true, phone_pass: true, gate_pass: true, fines: true } });

  // Morning Bliss Section Stats
  const mbDates = [...new Set((morningBliss || []).map(m => m.date))].sort().reverse();
  const [viewDate, setViewDate] = useState("");
  const [viewPhoto, setViewPhoto] = useState(null);

  // Sync viewDate if it's empty but mbDates has values
  useEffect(() => {
    if (!viewDate && mbDates.length > 0) {
      setViewDate(mbDates[0]);
    }
  }, [mbDates, viewDate]);

  // Reports Section Stats
  const [repClass, setRepClass] = useState("C1A");
  const [repDate, setRepDate] = useState(new Date().toISOString().split('T')[0]);
  const [repStart, setRepStart] = useState("");
  const [repEnd, setRepEnd] = useState("");
  const [repView, setRepView] = useState(null); // null = menu, 'bliss', 'points', 'prayer', 'fines'

  const sharePDF = async (doc, filename) => {
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: filename, text: 'Shared Report from Perfomate' });
      } catch (e) {
        triggerDownload(doc, filename);
      }
    } else {
      triggerDownload(doc, filename);
      alert("Sharing not supported on this browser. File has been downloaded.");
    }
  };

  if (section === "home") return (
    <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
      <Header title="Admin Panel" onBack={onBack} />
      <Toast msg={toast} type="success" />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        {[{ id: "classes", icon: "🏫", label: "Class Management", desc: "Add, edit, delete classes" }, { id: "students", icon: "👥", label: "Student Management", desc: "Manage students by class" }, { id: "users", icon: "🔑", label: "User Management", desc: "Create mentor accounts" }, { id: "rules", icon: "⚙️", label: "Manage Tally Rules", desc: "Predefine tally & star reasons" }, { id: "morning_bliss", icon: "🌅", label: "Morning Bliss", desc: "Global morning bliss view" }, { id: "reports", icon: "📄", label: "Generate Reports", desc: "Generate PDF summaries" }].map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{ background: "#fff", border: "none", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16, cursor: "pointer", boxShadow: "0 2px 8px #0001", textAlign: "left" }}>
            <span style={{ fontSize: 32 }}>{s.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{s.label}</div>
              <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>{s.desc}</div>
            </div>
            <span style={{ marginLeft: "auto", color: "#9ca3af" }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );

  if (section === "classes") return (
    <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
      <Header title="Class Management" onBack={() => setSection("home")} />
      <Toast msg={toast} type="success" />
      <div style={{ padding: 16 }}>
        {classes.sort().map(c => (
          <div key={c} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px #0001" }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{c}</span>
            <button onClick={async () => {
              await supabase.from('classes').delete().match({ id: c });
              loadData();
              showToast(`Class ${c} deleted`);
            }}
              style={{ background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 20, padding: "6px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Delete</button>
          </div>
        ))}
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginTop: 8, boxShadow: "0 1px 4px #0001" }}>
          <input value={newClass} onChange={e => setNewClass(e.target.value)} placeholder="New class name (e.g. C3A)" style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 10, outline: "none", boxSizing: "border-box" }} />
          <button onClick={async () => {
            if (!newClass.trim()) return;
            let cid = newClass.trim().toUpperCase();
            await supabase.from('classes').insert({ id: cid, name: cid });
            setNewClass("");
            loadData();
            showToast("Class added!");
          }}
            style={{ width: "100%", padding: 12, background: GREEN, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>+ Add Class</button>
        </div>
      </div>
    </div>
  );

  if (section === "students") return (
    <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
      <Header title="Student Management" onBack={() => setSection("home")} />
      <Toast msg={toast} type="success" />
      <div style={{ padding: 16 }}>
        <select value={selCls} onChange={e => setSelCls(e.target.value)} style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 14, outline: "none" }}>
          {classes.map(c => <option key={c}>{c}</option>)}
        </select>
        {(students[selCls] || []).map(s => (
          <div key={s.id} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px #0001" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>{s.roll}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={async () => {
                await supabase.from('students').delete().match({ id: s.id });
                loadData();
                showToast("Student deleted");
              }}
                style={{ background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 20, padding: "6px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        ))}
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginTop: 8, boxShadow: "0 1px 4px #0001" }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Add Student</div>
          <input value={addStudentForm.name} onChange={e => setAddStudentForm({ ...addStudentForm, name: e.target.value })} placeholder="Full name *" style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 10, outline: "none", boxSizing: "border-box" }} />
          <input value={addStudentForm.roll} onChange={e => setAddStudentForm({ ...addStudentForm, roll: e.target.value })} placeholder="Roll number *" style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 10, outline: "none", boxSizing: "border-box" }} />
          <select value={addStudentForm.cls} onChange={e => setAddStudentForm({ ...addStudentForm, cls: e.target.value })} style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 12, outline: "none" }}>
            <option value="" disabled>Select a class</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={async () => {
            if (!addStudentForm.name || !addStudentForm.roll || !addStudentForm.cls) return;
            await supabase.from('students').insert({ name: addStudentForm.name, roll_number: addStudentForm.roll, class_id: addStudentForm.cls });
            setAddStudentForm({ name: "", roll: "", cls: selCls });
            showToast("Student added!");
          }}
            style={{ width: "100%", padding: 12, background: GREEN, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>+ Add Student</button>
        </div>
      </div>
    </div>
  );

  if (section === "users") {
    const PERM_LABELS = { students: "Students", tally: "Tally & Stars", morning_bliss: "Morning Bliss", prayer: "Prayer Attendance", phone_pass: "Phone Pass", gate_pass: "Gate Pass", fines: "Fines" };
    return (
      <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
        <Header title="User Management" onBack={() => setSection("home")} />
        <Toast msg={toast} type="success" />
        <div style={{ padding: 16 }}>
          {users.map(u => (
            <div key={u.id} style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 10, boxShadow: "0 1px 4px #0001" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{u.name} {u.short_name && <span style={{ color: GREEN, fontSize: 13 }}>({u.short_name})</span>}</div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>{u.email}</div>
                </div>
                <button onClick={async () => {
                  await supabase.from('users').delete().match({ id: u.id });
                  loadData();
                  showToast("User deleted");
                }}
                  style={{ background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 20, padding: "6px 12px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          ))}
          <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginTop: 8, boxShadow: "0 1px 4px #0001" }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Add New Mentor</div>
            <input value={addUserForm.name} onChange={e => setAddUserForm({ ...addUserForm, name: e.target.value })} placeholder="Full name *" style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 10, outline: "none", boxSizing: "border-box" }} />
            <input value={addUserForm.shortName} onChange={e => setAddUserForm({ ...addUserForm, shortName: e.target.value })} placeholder="Short Name (e.g. AJ) *" style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 10, outline: "none", boxSizing: "border-box" }} />
            <input value={addUserForm.email} onChange={e => setAddUserForm({ ...addUserForm, email: e.target.value })} placeholder="Email address *" style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 10, outline: "none", boxSizing: "border-box" }} />
            <input type="password" value={addUserForm.password} onChange={e => setAddUserForm({ ...addUserForm, password: e.target.value })} placeholder="Password *" style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 14, outline: "none", boxSizing: "border-box" }} />
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Module Permissions</div>
            {Object.entries(PERM_LABELS).map(([key, label]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>{label}</span>
                <div onClick={() => setAddUserForm({ ...addUserForm, permissions: { ...addUserForm.permissions, [key]: !addUserForm.permissions[key] } })} style={{ width: 44, height: 24, borderRadius: 12, background: addUserForm.permissions[key] ? GREEN : "#d1d5db", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: addUserForm.permissions[key] ? 23 : 3, transition: "left 0.2s" }} />
                </div>
              </div>
            ))}
            <button onClick={async () => {
              if (!addUserForm.name || !addUserForm.email || !addUserForm.password || !addUserForm.shortName) return;
              await supabase.from('users').insert({ name: addUserForm.name, short_name: addUserForm.shortName, email: addUserForm.email, role: 'mentor', permissions: addUserForm.permissions });
              setAddUserForm({ name: "", shortName: "", email: "", password: "", permissions: { students: true, tally: true, morning_bliss: true, prayer: true, phone_pass: true, gate_pass: true, fines: true } });
              loadData();
              showToast("Mentor created!");
            }}
              style={{ width: "100%", padding: 13, background: GREEN, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 14 }}>Create Mentor Account</button>
          </div>
        </div>
      </div>
    );
  }

  if (section === "rules") {
    const activeRules = pointRules.filter(r => r.category === ruleCat);
    return (
      <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
        <Header title="Manage Point Rules" onBack={() => setSection("home")} />
        <Toast msg={toast} type="success" />
        <div style={{ display: "flex", padding: "12px 16px 0" }}>
          {["tally", "stars", "others"].map(t => (
            <button key={t} onClick={() => setRuleCat(t)} style={{ flex: 1, padding: "10px", border: "none", background: ruleCat === t ? GREEN : "#f3f4f6", color: ruleCat === t ? "#fff" : "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer", borderRadius: t === "tally" ? "10px 0 0 0" : t === "others" ? "0 10px 10px 0" : "0", textTransform: "capitalize" }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ padding: 16 }}>
          {activeRules.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, textAlign: "center", color: "#6b7280" }}>No rules for {ruleCat}</div>
          ) : activeRules.map(r => (
            <div key={r.id} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px #0001" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{r.reason}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: r.value > 0 ? GREEN : "#ef4444" }}>{r.value > 0 ? '+' : ''}{r.value}</span>
                <button onClick={async () => {
                  await supabase.from('point_rules').delete().match({ id: r.id });
                  loadData();
                  showToast("Rule deleted");
                }} style={{ background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 20, padding: "6px 10px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          ))}
          <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginTop: 12, boxShadow: "0 1px 4px #0001" }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Add Rule</div>
            <input value={ruleForm.reason} onChange={e => setRuleForm({ ...ruleForm, reason: e.target.value })} placeholder="Reason (e.g. Speaking in Class)" style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 10, outline: "none", boxSizing: "border-box" }} />
            <input type="number" value={ruleForm.value} onChange={e => setRuleForm({ ...ruleForm, value: e.target.value })} placeholder="Value (e.g. -5 or 10)" style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 12, outline: "none", boxSizing: "border-box" }} />
            <button onClick={async () => {
              if (!ruleForm.reason || !ruleForm.value) return;
              await supabase.from('point_rules').insert({ category: ruleCat, reason: ruleForm.reason, value: Number(ruleForm.value) });
              setRuleForm({ reason: "", value: "" });
              loadData();
              showToast("Rule added!");
            }} style={{ width: "100%", padding: 12, background: GREEN, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>+ Add Rule</button>
          </div>
        </div>
      </div>
    );
  }

  if (section === "morning_bliss") {
    const filteredRecords = (morningBliss || []).filter(m => m.date === viewDate);

    return (
      <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
        <Header title="Global Morning Bliss" onBack={() => setSection("home")} />
        <div style={{ padding: 16 }}>
          <select value={viewDate} onChange={e => setViewDate(e.target.value)} style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 16, outline: "none" }}>
            <option value="" disabled>Select Date...</option>
            {mbDates.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {filteredRecords.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, textAlign: "center", color: "#6b7280" }}>No records for this date.</div>
          ) : (
            filteredRecords.map(r => {
              const sName = (students[r.class_id] || []).find(s => s.id === r.student_id)?.name || "Unknown";
              return (
                <div key={r.id} style={{ background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 12, boxShadow: "0 1px 4px #0001" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: (r.photos || []).length > 0 ? 10 : 0 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{sName} <span style={{ color: "#6b7280", fontSize: 13 }}>— {r.class_id}</span></div>
                      <div style={{ color: "#6b7280", fontSize: 14, marginTop: 2 }}>{r.topic}</div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: GREEN }}>{r.mark}<span style={{ fontSize: 12, color: "#9ca3af" }}>/10</span></div>
                  </div>
                  {(r.photos || []).length > 0 && (
                    <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                      {r.photos.map((p, i) => <img key={i} src={p} onClick={() => setViewPhoto(p)} alt="bliss" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid #e0e0e0", cursor: "pointer" }} />)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {viewPhoto && (
          <div style={{ position: "fixed", inset: 0, background: "#000e", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setViewPhoto(null)}>
            <img src={viewPhoto} style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", borderRadius: 12 }} />
            <button onClick={() => setViewPhoto(null)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#fff", fontSize: 32, cursor: "pointer" }}>✕</button>
          </div>
        )}
      </div>
    );
  }

  if (section === "reports") {
    const studentsData = students;

    const SubHeader = ({ title }) => (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 16px 8px", background: "#f8f8f8" }}>
        <button onClick={() => setRepView(null)} style={{ background: "#fff", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px #0002", cursor: "pointer" }}>←</button>
        <div style={{ fontWeight: 700, fontSize: 18 }}>{title}</div>
      </div>
    );

    const ReportForm = ({ color, onDownload, onShare, children }) => (
      <div style={{ padding: 16 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 8px #0001" }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#4b5563", marginBottom: 6 }}>Select Class</div>
          <select value={repClass} onChange={e => setRepClass(e.target.value)} style={{ width: "100%", padding: 12, border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 14 }}>
            {classes.map(c => <option key={c}>{c}</option>)}
          </select>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>From</div>
              <input type="date" value={repStart} onChange={e => setRepStart(e.target.value)} style={{ width: "100%", padding: 12, border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 13 }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>To</div>
              <input type="date" value={repEnd} onChange={e => setRepEnd(e.target.value)} style={{ width: "100%", padding: 12, border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 13 }} />
            </div>
          </div>
          {children}
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={onDownload} style={{ flex: 1, padding: 14, background: color, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Download PDF</button>
            <button onClick={onShare} style={{ padding: "14px 20px", background: "#25D366", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>💬 Share</button>
          </div>
        </div>
      </div>
    );

    const generatePointsReport = (forShare = false) => {
      const doc = new jsPDF();
      doc.setTextColor(52, 101, 192); doc.setFontSize(20); doc.text("Points & Financial Report", 14, 20);
      doc.setTextColor(0); doc.setFontSize(11);
      doc.text(`Class: ${repClass} | Range: ${repStart || 'All'} to ${repEnd || 'Now'}`, 14, 28);

      const tableData = (studentsData[repClass] || [])
        .sort((a, b) => {
          const aRoll = parseInt(a.roll) || 0;
          const bRoll = parseInt(b.roll) || 0;
          return aRoll - bRoll;
        })
        .map(s => {
          const logsInRange = (pointLogs || []).filter(l => l.student_id === s.id && (!repStart || l.created_at >= repStart) && (!repEnd || l.created_at <= repEnd + 'T23:59:59'));

          const tallyCount = logsInRange.filter(l => l.category === 'tally').length;
          const starCount = logsInRange.filter(l => l.category === 'stars').length;
          const othersCount = logsInRange.filter(l => l.category === 'others').length;

          const netTallyAmount = Math.max(0, (tallyCount - (starCount * 2)) * 10);
          const otherAmount = othersCount * 10;
          const totalAmount = netTallyAmount + otherAmount;

          return [s.roll, s.name, tallyCount, starCount, othersCount, `₹${totalAmount}`];
        });

      autoTable(doc, {
        startY: 35,
        head: [['Roll', 'Student', 'Tally', 'Stars', 'Others', 'Total (₹)']],
        body: tableData,
        headStyles: { fillColor: [52, 101, 192] },
        columnStyles: { 0: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' }, 5: { halign: 'right', fontStyle: 'bold' } }
      });
      const filename = `Points_${repClass}_${repStart || 'LTD'}.pdf`;
      if (forShare) sharePDF(doc, filename); else triggerDownload(doc, filename);
    };

    if (repView === "bliss") return (
      <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
        <Header title="Morning Bliss Reports" onBack={() => setRepView(null)} />
        <div style={{ padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 8px #0001", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: "#1e40af" }}>Daily Bliss Summary</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>Report of presentations for a specific day.</div>
            <input type="date" value={repDate} onChange={e => setRepDate(e.target.value)} style={{ width: "100%", padding: 12, border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, marginBottom: 14 }} />
            <button onClick={() => {
              const doc = new jsPDF();
              const ds = repDate.split("-").reverse().join("/");
              doc.setTextColor(52, 101, 192); doc.setFontSize(18); doc.text(`MORNING BLISS – ${ds}`, 14, 22);
              const data = classes.sort().map(c => {
                const r = morningBliss.find(m => m.date === repDate && m.class_id === c);
                const sn = r ? (studentsData[c] || []).find(s => s.id === r.student_id)?.name || "Unknown" : "";
                return [c, sn, r?.topic || "", r?.mark || "", r?.evaluated_by || (r ? "" : "Invalid")];
              });
              autoTable(doc, { startY: 30, head: [['Class', 'Student', 'Topic', 'Score', 'By']], body: data, headStyles: { fillColor: [52, 101, 192] } });
              triggerDownload(doc, `Bliss_${repDate}.pdf`);
            }} style={{ width: "100%", padding: 14, background: "#2563eb", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Download PDF</button>
          </div>
        </div>
      </div>
    );

    if (repView === "points") return (
      <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
        <Header title="Points & Financials" onBack={() => setRepView(null)} />
        <ReportForm color="#5465c0" onDownload={() => generatePointsReport(false)} onShare={() => generatePointsReport(true)}>
          <div style={{ padding: "10px 0", fontSize: 12, color: "#6b7280" }}>Consolidated report for Tally, Stars, and Others (Sorted by Roll Number).</div>
        </ReportForm>
      </div>
    );

    if (repView === "prayer") return (
      <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
        <Header title="Prayer Attendance" onBack={() => setRepView(null)} />
        <ReportForm color="#059669" onDownload={() => {
          const doc = new jsPDF();
          doc.setTextColor(5, 150, 105); doc.setFontSize(20); doc.text(`Prayer History: ${repClass}`, 14, 20);
          const data = (studentsData[repClass] || []).map(s => {
            const count = prayerAttendance.filter(p => p.student_id === s.id && p.status === 'present' && (!repStart || p.date >= repStart) && (!repEnd || p.date <= repEnd)).length;
            return [s.name, s.roll, count];
          });
          autoTable(doc, { startY: 30, head: [['Student', 'Roll', 'Total Present Days']], body: data, headStyles: { fillColor: [5, 150, 105] } });
          triggerDownload(doc, `Prayer_${repClass}.pdf`);
        }} onShare={() => { }}>
          <div style={{ padding: "10px 0", fontSize: 12, color: "#6b7280" }}>Total "Present" marks recorded within the selected date range.</div>
        </ReportForm>
      </div>
    );

    if (repView === "fines") return (
      <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
        <Header title="Outstanding Fines" onBack={() => setRepView(null)} />
        <ReportForm color="#dc2626" onDownload={() => {
          const doc = new jsPDF();
          doc.setTextColor(220, 38, 38); doc.setFontSize(20); doc.text(`Fines: ${repClass}`, 14, 20);
          const data = (fines || []).filter(f => f.class_name === repClass && f.status === "unpaid" && (!repStart || f.date >= repStart) && (!repEnd || f.date <= repEnd)).map(f => [f.student_name, f.reason, f.date, `₹${f.amount}`]);
          autoTable(doc, { startY: 30, head: [['Student', 'Reason', 'Date', 'Amount']], body: data, headStyles: { fillColor: [220, 38, 38] } });
          triggerDownload(doc, `Fines_${repClass}.pdf`);
        }} onShare={() => { }}>
          <div style={{ padding: "10px 0", fontSize: 12, color: "#6b7280" }}>List of unpaid fines issued within the selected date range.</div>
        </ReportForm>
      </div>
    );

    return (
      <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
        <Header title="Report Hub" onBack={() => setSection("home")} />
        <div style={{ padding: 16 }}>
          {[
            { id: "bliss", icon: "🌅", label: "Morning Bliss", color: "#2563eb", desc: "Select a date for Bliss report" },
            { id: "points", icon: "💰", label: "Points & Financials", color: "#5465c0", desc: "Tally, Stars, and Others (Sorted by Roll No)" },
            { id: "prayer", icon: "🕌", label: "Prayer Attendance", color: "#059669", desc: "Summary of prayer records" },
            { id: "fines", icon: "💸", label: "Outstanding Fines", color: "#dc2626", desc: "Unpaid fines per class" }
          ].map(r => (
            <button key={r.id} onClick={() => setRepView(r.id)} style={{ width: "100%", background: "#fff", border: "none", borderRadius: 16, padding: "20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", boxShadow: "0 2px 8px #0001", textAlign: "left", marginBottom: 12 }}>
              <span style={{ fontSize: 32 }}>{r.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: r.color }}>{r.label}</div>
                <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>{r.desc}</div>
              </div>
              <span style={{ marginLeft: "auto", color: "#9ca3af" }}>→</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const { downloadInfo, setDownloadInfo } = useAppStore();
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [screen, setScreen] = useState("dashboard");

  if (!user) return <LoginScreen onLogin={u => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
    setScreen("dashboard");
  }} />;

  const screens = {
    dashboard: <Dashboard user={user} onNavigate={s => setScreen(s)} onLogout={() => {
      setUser(null);
      localStorage.removeItem('user');
    }} />,
    Students: <StudentsScreen onBack={() => setScreen("dashboard")} />,
    "Tally & Stars": <TallyScreen onBack={() => setScreen("dashboard")} />,
    "Morning Bliss": <MorningBlissScreen onBack={() => setScreen("dashboard")} />,
    "Prayer Attendance": <PrayerScreen onBack={() => setScreen("dashboard")} />,
    "Phone Pass": <PhonePassScreen onBack={() => setScreen("dashboard")} />,
    "Gate Pass": <GatePassScreen onBack={() => setScreen("dashboard")} />,
    Fines: <FinesScreen onBack={() => setScreen("dashboard")} />,
    "Admin Panel": <AdminPanel onBack={() => setScreen("dashboard")} />,
  };

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f8f8f8", minHeight: "100vh" }}>
      {screens[screen] || screens.dashboard}
      <DownloadPopup info={downloadInfo} onClose={() => setDownloadInfo(null)} />
    </div>
  );
}
