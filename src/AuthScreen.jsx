// ═══════════════════════════════════════════════════════════════════════════
// AuthScreen.jsx — 로그인 화면 (학생 / 관리자)
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from "react"
import { supabase } from "./supabaseClient"

const AUTH_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Noto Sans KR', sans-serif; background: #000; }

  .auth-bg {
    min-height: 100vh; background: #000010;
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 24px;
  }
  .auth-title {
    color: #ffff00; font-size: 22px; font-weight: 700;
    letter-spacing: 2px; text-align: center;
    text-shadow: 0 0 20px #ffff0066;
  }
  .auth-sub { color: #4488ff; font-size: 13px; text-align: center; margin-top: 4px; }
  .auth-box {
    background: #000080; border: 3px solid #ffffff;
    width: 400px; max-width: 95vw;
  }
  .auth-tabs { display: flex; border-bottom: 2px solid #ffffff; }
  .auth-tab {
    flex: 1; padding: 10px; text-align: center;
    color: #aaaaff; font-size: 14px; font-weight: 700;
    cursor: pointer; background: #000060; border: none;
    font-family: 'Noto Sans KR', sans-serif;
    border-bottom: 3px solid transparent;
  }
  .auth-tab.active { color: #ffff00; background: #000080; border-bottom-color: #ffff00; }
  .auth-body { padding: 24px; }
  .auth-label { color: #00ffff; font-size: 13px; margin-bottom: 6px; display: block; }
  .auth-input {
    width: 100%; background: #00004a; color: #fff;
    border: 2px solid #4488ff; padding: 9px 12px;
    font-size: 14px; font-family: 'Noto Sans KR', sans-serif;
    outline: none; margin-bottom: 14px;
  }
  .auth-input:focus { border-color: #00ffff; }
  .auth-btn {
    width: 100%; background: #1a3a1a; color: #44ff88;
    border: 2px solid #44ff88; padding: 11px;
    font-size: 15px; font-weight: 700; cursor: pointer;
    font-family: 'Noto Sans KR', sans-serif;
    transition: background 0.15s;
  }
  .auth-btn:hover { background: #2a5a2a; }
  .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .auth-btn-admin { background: #1a0a00; color: #ff8844; border-color: #ff8844; }
  .auth-btn-admin:hover { background: #2a1500; }
  .auth-error { color: #ff6666; font-size: 13px; margin-top: 10px; text-align: center; }
  .auth-success { color: #44ff88; font-size: 13px; margin-top: 10px; text-align: center; }
  .auth-divider { border: none; border-top: 1px solid #000060; margin: 16px 0; }
  .auth-new { color: #888; font-size: 12px; text-align: center; cursor: pointer; margin-top: 12px; }
  .auth-new:hover { color: #aaa; }
  .auth-register { margin-top: 12px; padding-top: 12px; border-top: 1px solid #000060; }
  .auth-register-title { color: #ffcc44; font-size: 13px; font-weight: 700; margin-bottom: 10px; }

  .pixel-icon { font-size: 40px; text-align: center; margin-bottom: 8px; }
`

export default function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState("student")   // student | admin
  const [mode, setMode] = useState("login")   // login | register

  // 학생 로그인
  const [studentName, setStudentName] = useState("")
  const [studentPw, setStudentPw]     = useState("")

  // 학생 회원가입
  const [regName, setRegName] = useState("")
  const [regPw, setRegPw]     = useState("")
  const [regPw2, setRegPw2]   = useState("")

  // 관리자
  const [adminPw, setAdminPw] = useState("")

  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")

  // ── 학생 로그인 ──
  async function handleStudentLogin() {
    if (!studentName.trim() || !studentPw.trim()) { setError("이름과 비밀번호를 입력해 주세요."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const { data: rows, error: err } = await supabase
        .from("students")
        .select("*")
        .eq("name", studentName.trim())
        .eq("password", studentPw)
        .limit(1)
      if (err || !rows || rows.length === 0) { setError("이름 또는 비밀번호가 틀렸어요."); return; }
      const data = rows[0]

      // 진행 데이터 가져오기
      const { data: progressRows } = await supabase
        .from("student_progress")
        .select("*")
        .eq("student_id", data.id)
        .limit(1)
      const progress = progressRows?.[0] || null

      // 오늘 로그인 기록
      await logActivity(data.id, 0, 0)

      onLogin({ type: "student", student: data, progress: progress || null })
    } catch (e) {
      setError("오류가 발생했어요. 다시 시도해 주세요.")
    } finally { setLoading(false) }
  }

  // ── 학생 회원가입 ──
  async function handleRegister() {
    if (!regName.trim()) { setError("이름을 입력해 주세요."); return; }
    if (regPw.length < 4)  { setError("비밀번호는 4자 이상이어야 해요."); return; }
    if (regPw !== regPw2)  { setError("비밀번호가 일치하지 않아요."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      // 중복 체크
      const { data: existing } = await supabase
        .from("students").select("id").eq("name", regName.trim()).limit(1)
      if (existing && existing.length > 0) { setError("이미 있는 이름이에요. 다른 이름을 사용해 주세요."); return; }

      // 학생 생성
      const { data: newStudent, error: err } = await supabase
        .from("students").insert({ name: regName.trim(), password: regPw }).select().limit(1)
      if (err) throw err

      // 진행 데이터 초기화
      await supabase.from("student_progress").insert({ student_id: newStudent[0].id })

      setSuccess(`${regName} 계정이 만들어졌어요! 로그인해 보세요.`)
      setMode("login")
      setStudentName(regName.trim())
      setRegName(""); setRegPw(""); setRegPw2("")
    } catch (e) {
      setError("계정 생성에 실패했어요. 다시 시도해 주세요.")
    } finally { setLoading(false) }
  }

  // ── 관리자 로그인 ──
  async function handleAdminLogin() {
    if (!adminPw.trim()) { setError("비밀번호를 입력해 주세요."); return; }
    setLoading(true); setError("");
    try {
      const { data, error: err } = await supabase
        .from("admins").select("*").eq("password", adminPw.trim()).limit(1)
      console.log("admin login result:", { data, err, pw: adminPw.trim() })
      if (err) { setError("DB 오류: " + err.message); return; }
      if (!data || data.length === 0) { setError("비밀번호가 틀렸어요."); return; }
      onLogin({ type: "admin" })
    } catch (e) {
      setError("오류: " + e.message)
    } finally { setLoading(false) }
  }

  async function logActivity(studentId, missions, xp) {
    try {
      await supabase.from("activity_logs").upsert({
        student_id: studentId,
        date: new Date().toISOString().split("T")[0],
        missions_completed: missions,
        xp_earned: xp,
      }, { onConflict: "student_id,date", ignoreDuplicates: false })
    } catch (e) {}
  }

  return (
    <>
      <style>{AUTH_STYLE}</style>
      <div className="auth-bg">
        <div>
          <div className="pixel-icon">⚔️</div>
          <div className="auth-title">SCHOOL LIFE RPG</div>
          <div className="auth-sub">한국어 학습 어드벤처</div>
        </div>

        <div className="auth-box">
          {/* 탭 */}
          <div className="auth-tabs">
            <button className={`auth-tab${tab==="student"?" active":""}`} onClick={()=>{ setTab("student"); setMode("login"); setError(""); setSuccess(""); }}>
              👤 학생
            </button>
            <button className={`auth-tab${tab==="admin"?" active":""}`} onClick={()=>{ setTab("admin"); setError(""); setSuccess(""); }}>
              🔧 관리자
            </button>
          </div>

          <div className="auth-body">
            {/* 학생 탭 */}
            {tab === "student" && mode === "login" && (
              <>
                <label className="auth-label">이름</label>
                <input className="auth-input" value={studentName} onChange={e=>setStudentName(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleStudentLogin()}
                  placeholder="학생 이름을 입력하세요" />
                <label className="auth-label">비밀번호</label>
                <input className="auth-input" type="password" value={studentPw} onChange={e=>setStudentPw(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleStudentLogin()}
                  placeholder="비밀번호를 입력하세요" />
                <button className="auth-btn" onClick={handleStudentLogin} disabled={loading}>
                  {loading ? "로그인 중..." : "▶ 게임 시작"}
                </button>
                <div className="auth-new" onClick={()=>{ setMode("register"); setError(""); }}>
                  처음 오셨나요? 계정 만들기 →
                </div>
              </>
            )}

            {/* 학생 회원가입 */}
            {tab === "student" && mode === "register" && (
              <>
                <div className="auth-register-title">✨ 새 계정 만들기</div>
                <label className="auth-label">이름 (닉네임)</label>
                <input className="auth-input" value={regName} onChange={e=>setRegName(e.target.value)}
                  placeholder="이름을 입력하세요 (예: 알렉스)" />
                <label className="auth-label">비밀번호 (4자 이상)</label>
                <input className="auth-input" type="password" value={regPw} onChange={e=>setRegPw(e.target.value)}
                  placeholder="비밀번호를 입력하세요" />
                <label className="auth-label">비밀번호 확인</label>
                <input className="auth-input" type="password" value={regPw2} onChange={e=>setRegPw2(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleRegister()}
                  placeholder="비밀번호를 다시 입력하세요" />
                <button className="auth-btn" onClick={handleRegister} disabled={loading}>
                  {loading ? "생성 중..." : "✨ 계정 만들기"}
                </button>
                <div className="auth-new" onClick={()=>{ setMode("login"); setError(""); }}>
                  ← 로그인으로 돌아가기
                </div>
              </>
            )}

            {/* 관리자 탭 */}
            {tab === "admin" && (
              <>
                <label className="auth-label">관리자 비밀번호</label>
                <input className="auth-input" type="password" value={adminPw} onChange={e=>setAdminPw(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleAdminLogin()}
                  placeholder="관리자 비밀번호를 입력하세요" />
                <button className="auth-btn auth-btn-admin" onClick={handleAdminLogin} disabled={loading}>
                  {loading ? "확인 중..." : "🔧 관리자 대시보드 열기"}
                </button>
              </>
            )}

            {error   && <div className="auth-error">⚠ {error}</div>}
            {success && <div className="auth-success">✓ {success}</div>}
          </div>
        </div>

        <div style={{color:"#333",fontSize:"12px",textAlign:"center"}}>
          School Life RPG v2.0 · Powered by Claude AI
        </div>
      </div>
    </>
  )
}
