// ═══════════════════════════════════════════════════════════════════════════
// AdminDashboard.jsx — 관리자 대시보드
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useMemo } from "react"
import { supabase } from "./supabaseClient"
import SchoolKoreanGame from "./SchoolKoreanGame"

// ── 관리자용 게임 테스트 래퍼 ─────────────────────────────────────────────
function AdminGameTest({ initialMapMode, unlockedMaps, onExit }) {
  // 관리자는 모든 맵 열려있고, 저장 없이 테스트만
  const adminState = {
    xp: 999, level: 99, karma: 99,
    mapMode: initialMapMode,
    px: 280, py: 160,
    completed: [],
    storyCompleted: [],
    vocabulary: [],
    storyFlags: {},
    unlockedMaps: unlockedMaps,
  }

  return (
    <SchoolKoreanGame
      studentId={null}
      playerName="관리자"
      initialState={{ ...adminState, mapMode: initialMapMode }}
      unlockedMaps={unlockedMaps}
      onStateChange={null}
      onSave={null}
      onLogout={onExit}
    />
  )
}

const ADMIN_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Noto Sans KR', sans-serif; background: #0a0a14; color: #e0e0e0; }

  .adm-wrap { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; }

  /* 사이드바 */
  .adm-sidebar { background: #000060; border-right: 2px solid #00ffff; padding: 0; display: flex; flex-direction: column; }
  .adm-logo { padding: 16px; border-bottom: 1px solid #00004a; }
  .adm-logo-title { color: #ffff00; font-size: 15px; font-weight: 700; }
  .adm-logo-sub { color: #4488ff; font-size: 12px; margin-top: 2px; }
  .adm-nav { flex: 1; padding: 8px 0; }
  .adm-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 16px; color: #aaaaff; font-size: 13px; cursor: pointer; border-left: 3px solid transparent; transition: all 0.15s; }
  .adm-nav-item:hover { background: #000080; color: #fff; }
  .adm-nav-item.active { background: #000080; color: #ffff00; border-left-color: #ffff00; }
  .adm-logout { padding: 12px 16px; border-top: 1px solid #00004a; }
  .adm-logout-btn { width: 100%; background: #1a0000; color: #ff6666; border: 1px solid #ff4444; padding: 7px; font-size: 13px; cursor: pointer; font-family: 'Noto Sans KR', sans-serif; }

  /* 메인 */
  .adm-main { padding: 24px; overflow-y: auto; }
  .adm-page-title { color: #ffff00; font-size: 20px; font-weight: 700; margin-bottom: 4px; }
  .adm-page-sub { color: #888; font-size: 13px; margin-bottom: 20px; }

  /* 통계 카드 */
  .adm-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .adm-stat-card { background: #000060; border: 2px solid #00ffff; padding: 14px 16px; }
  .adm-stat-label { color: #00ffff; font-size: 12px; margin-bottom: 6px; }
  .adm-stat-val { color: #ffff00; font-size: 26px; font-weight: 700; }
  .adm-stat-sub { color: #666; font-size: 11px; margin-top: 4px; }

  /* 테이블 */
  .adm-card { background: #000050; border: 2px solid #00004a; margin-bottom: 20px; }
  .adm-card-header { background: #000040; border-bottom: 1px solid #00004a; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; }
  .adm-card-title { color: #00ffff; font-size: 14px; font-weight: 700; }
  .adm-table { width: 100%; border-collapse: collapse; }
  .adm-table th { background: #00003a; color: #00ffff; font-size: 12px; padding: 8px 12px; text-align: left; border-bottom: 1px solid #00004a; }
  .adm-table td { padding: 9px 12px; font-size: 13px; border-bottom: 1px solid #00002a; vertical-align: middle; }
  .adm-table tr:hover td { background: #00003a; }
  .adm-table tr:last-child td { border-bottom: none; }

  /* 배지 */
  .adm-badge { display: inline-block; padding: 2px 8px; font-size: 11px; border-radius: 2px; font-weight: 700; }
  .adm-badge-green { background: #003300; color: #44ff88; border: 1px solid #44ff88; }
  .adm-badge-blue  { background: #000044; color: #4488ff; border: 1px solid #4488ff; }
  .adm-badge-gold  { background: #1a1000; color: #ffd700; border: 1px solid #ffd700; }
  .adm-badge-gray  { background: #111; color: #888; border: 1px solid #444; }

  /* 버튼 */
  .adm-btn { background: #000080; color: #4488ff; border: 1px solid #4488ff; padding: 5px 12px; font-size: 12px; cursor: pointer; font-family: 'Noto Sans KR', sans-serif; }
  .adm-btn:hover { background: #0000aa; }
  .adm-btn-green { background: #003300; color: #44ff88; border-color: #44ff88; }
  .adm-btn-green:hover { background: #004400; }
  .adm-btn-red { background: #220000; color: #ff6666; border-color: #ff4444; }
  .adm-btn-red:hover { background: #330000; }
  .adm-btn-gold { background: #1a1000; color: #ffd700; border-color: #ffd700; }

  /* 검색 */
  .adm-search { background: #00004a; color: #fff; border: 1px solid #4488ff; padding: 6px 10px; font-size: 13px; font-family: 'Noto Sans KR', sans-serif; outline: none; width: 200px; }
  .adm-search:focus { border-color: #00ffff; }

  /* 프로그레스 바 */
  .adm-bar-bg { background: #000030; height: 8px; border-radius: 0; overflow: hidden; width: 80px; display: inline-block; vertical-align: middle; }
  .adm-bar-fill { height: 100%; background: #44ff88; }

  /* 상세 모달 */
  .adm-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 100; display: flex; align-items: center; justify-content: center; }
  .adm-modal { background: #000080; border: 3px solid #ffffff; width: 700px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; }
  .adm-modal-header { background: #000044; border-bottom: 2px solid #00ffff; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; }
  .adm-modal-body { overflow-y: auto; padding: 16px; flex: 1; }
  .adm-modal-close { background: transparent; color: #ff6666; border: 1px solid #ff4444; padding: 3px 10px; cursor: pointer; font-family: 'Noto Sans KR', sans-serif; font-size: 13px; }

  /* 지도 뷰 */
  .adm-map-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .adm-map-card { background: #000040; border: 2px solid #00004a; padding: 10px; text-align: center; }
  .adm-map-card.unlocked { border-color: #44ff88; }
  .adm-map-card.locked { opacity: 0.4; }
  .adm-map-icon { font-size: 24px; margin-bottom: 4px; }
  .adm-map-name { color: #fff; font-size: 12px; }
  .adm-map-status { font-size: 11px; margin-top: 3px; }

  /* 로딩 */
  .adm-loading { color: #4488ff; font-size: 14px; text-align: center; padding: 40px; }
  .adm-empty { color: #555; font-size: 13px; text-align: center; padding: 30px; }
`

const MAPS_INFO = [
  { id:"school",      name:"학교 복도",   icon:"🏫", chapter:"시작" },
  { id:"classroom",   name:"교실",        icon:"📚", chapter:"CH1" },
  { id:"playground",  name:"운동장",      icon:"🏃", chapter:"CH2" },
  { id:"cafeteria",   name:"급식실",      icon:"🍽", chapter:"CH2" },
  { id:"gym",         name:"체육관",      icon:"💪", chapter:"CH3" },
  { id:"restroom",    name:"화장실",      icon:"🚻", chapter:"CH3" },
  { id:"teacherroom", name:"교무실",      icon:"👩‍💼", chapter:"CH4" },
  { id:"afterschool", name:"방과후교실",  icon:"🌙", chapter:"CH4" },
]

export default function AdminDashboard({ onLogout }) {
  const [page, setPage]         = useState("overview")
  const [students, setStudents] = useState([])
  const [progress, setProgress] = useState([])
  const [logs, setLogs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState("")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [{ data: s }, { data: p }, { data: l }] = await Promise.all([
        supabase.from("students").select("*").order("created_at", { ascending: false }),
        supabase.from("student_progress").select("*"),
        supabase.from("activity_logs").select("*").order("date", { ascending: false }),
      ])
      setStudents(s || [])
      setProgress(p || [])
      setLogs(l || [])
    } finally { setLoading(false) }
  }

  // 학생별 진행 데이터 합치기
  const studentData = useMemo(() => {
    return students.map(s => {
      const prog = progress.find(p => p.student_id === s.id) || {}
      const todayLog = logs.find(l => l.student_id === s.id && l.date === new Date().toISOString().split("T")[0])
      const totalMissions = (prog.completed_missions || []).length
      const unlockedMaps  = (prog.unlocked_maps || ["school","classroom"]).length
      return { ...s, prog, todayLog, totalMissions, unlockedMaps }
    })
  }, [students, progress, logs])

  const filtered = useMemo(() =>
    studentData.filter(s => s.name.toLowerCase().includes(search.toLowerCase())),
    [studentData, search]
  )

  // 통계
  const totalStudents  = students.length
  const activeToday    = logs.filter(l => l.date === new Date().toISOString().split("T")[0]).length
  const totalXp        = progress.reduce((sum, p) => sum + (p.xp || 0), 0)
  const avgMissions    = progress.length > 0
    ? Math.round(progress.reduce((s, p) => s + (p.completed_missions || []).length, 0) / progress.length)
    : 0

  // CSV 내보내기
  function exportCSV() {
    const rows = [
      ["이름", "XP", "레벨", "카르마", "완료미션", "열린맵", "단어장", "마지막저장"],
      ...studentData.map(s => [
        s.name,
        s.prog.xp || 0,
        s.prog.level || 1,
        s.prog.karma || 0,
        s.totalMissions,
        s.unlockedMaps,
        (s.prog.vocabulary || []).length,
        s.prog.last_saved ? new Date(s.prog.last_saved).toLocaleString("ko-KR") : "-",
      ])
    ]
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url
    a.download = `students_${new Date().toISOString().split("T")[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  // 학생 삭제
  async function deleteStudent(id, name) {
    if (!window.confirm(`"${name}" 학생을 삭제할까요?`)) return
    await supabase.from("students").delete().eq("id", id)
    setStudents(prev => prev.filter(s => s.id !== id))
  }

  // 개별 학생 로그
  function getStudentLogs(studentId) {
    return logs.filter(l => l.student_id === studentId).slice(0, 14)
  }

  // ── 페이지별 렌더 ──
  function renderOverview() {
    return (
      <>
        <div className="adm-page-title">📊 전체 현황</div>
        <div className="adm-page-sub">모든 학생의 학습 현황을 한눈에 확인하세요.</div>

        {/* 통계 카드 */}
        <div className="adm-stats">
          <div className="adm-stat-card">
            <div className="adm-stat-label">총 학생 수</div>
            <div className="adm-stat-val">{totalStudents}</div>
            <div className="adm-stat-sub">명 등록</div>
          </div>
          <div className="adm-stat-card">
            <div className="adm-stat-label">오늘 접속</div>
            <div className="adm-stat-val">{activeToday}</div>
            <div className="adm-stat-sub">명 활동</div>
          </div>
          <div className="adm-stat-card">
            <div className="adm-stat-label">총 XP 합계</div>
            <div className="adm-stat-val">{totalXp.toLocaleString()}</div>
            <div className="adm-stat-sub">전체 학생</div>
          </div>
          <div className="adm-stat-card">
            <div className="adm-stat-label">평균 완료 미션</div>
            <div className="adm-stat-val">{avgMissions}</div>
            <div className="adm-stat-sub">개 / 학생</div>
          </div>
        </div>

        {/* 학생 테이블 */}
        <div className="adm-card">
          <div className="adm-card-header">
            <span className="adm-card-title">👤 학생 목록</span>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <input className="adm-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="이름 검색..." />
              <button className="adm-btn adm-btn-gold" onClick={exportCSV}>📥 CSV 내보내기</button>
              <button className="adm-btn adm-btn-green" onClick={loadAll}>🔄 새로고침</button>
            </div>
          </div>
          {loading ? <div className="adm-loading">불러오는 중...</div> :
            filtered.length === 0 ? <div className="adm-empty">등록된 학생이 없어요.</div> :
            <table className="adm-table">
              <thead>
                <tr>
                  <th>이름</th><th>LV</th><th>XP</th><th>완료 미션</th>
                  <th>열린 맵</th><th>단어장</th><th>오늘 접속</th><th>마지막 저장</th><th>관리</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td>
                      <span style={{color:"#ffff00",fontWeight:700}}>{s.name}</span>
                      <span style={{color:"#444",fontSize:"11px",marginLeft:6}}>
                        {new Date(s.created_at).toLocaleDateString("ko-KR")} 가입
                      </span>
                    </td>
                    <td><span className="adm-badge adm-badge-blue">Lv.{s.prog.level||1}</span></td>
                    <td style={{color:"#ffd700",fontWeight:700}}>{s.prog.xp||0}</td>
                    <td>
                      <span className="adm-badge adm-badge-green">{s.totalMissions}개</span>
                    </td>
                    <td>
                      <span className="adm-badge adm-badge-blue">{s.unlockedMaps}/{MAPS_INFO.length}</span>
                    </td>
                    <td style={{color:"#cc88ff"}}>{(s.prog.vocabulary||[]).length}개</td>
                    <td>
                      {s.todayLog
                        ? <span className="adm-badge adm-badge-green">✓ 접속</span>
                        : <span className="adm-badge adm-badge-gray">미접속</span>}
                    </td>
                    <td style={{color:"#666",fontSize:"12px"}}>
                      {s.prog.last_saved ? new Date(s.prog.last_saved).toLocaleString("ko-KR",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}) : "-"}
                    </td>
                    <td>
                      <div style={{display:"flex",gap:4}}>
                        <button className="adm-btn" onClick={()=>{ setSelectedStudent(s); setShowModal(true); }}>상세</button>
                        <button className="adm-btn adm-btn-red" onClick={()=>deleteStudent(s.id,s.name)}>삭제</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </div>
      </>
    )
  }

  function renderMapView() {
    return (
      <>
        <div className="adm-page-title">🗺 전체 맵 현황</div>
        <div className="adm-page-sub">학생별 맵 잠금 해제 현황을 확인하세요.</div>
        <div className="adm-card">
          <div className="adm-card-header"><span className="adm-card-title">맵별 접근 학생 수</span></div>
          <div style={{padding:16}}>
            {MAPS_INFO.map(map => {
              const count = progress.filter(p => (p.unlocked_maps||["school","classroom"]).includes(map.id)).length
              const pct = totalStudents > 0 ? Math.round(count/totalStudents*100) : 0
              return (
                <div key={map.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,padding:"10px 14px",background:"#000040",border:"1px solid #00004a"}}>
                  <span style={{fontSize:22}}>{map.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{color:"#fff",fontSize:14,fontWeight:700}}>{map.name}</div>
                    <div style={{color:"#666",fontSize:12}}>챕터: {map.chapter}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{color:"#ffd700",fontWeight:700}}>{count}명 / {totalStudents}명</div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4,justifyContent:"flex-end"}}>
                      <div className="adm-bar-bg" style={{width:120}}>
                        <div className="adm-bar-fill" style={{width:pct+"%",background:pct>70?"#44ff88":pct>30?"#ffcc44":"#ff6666"}}/>
                      </div>
                      <span style={{color:"#aaa",fontSize:12}}>{pct}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 학생별 맵 현황 */}
        <div className="adm-card">
          <div className="adm-card-header"><span className="adm-card-title">학생별 맵 잠금 해제 현황</span></div>
          <table className="adm-table">
            <thead>
              <tr>
                <th>학생</th>
                {MAPS_INFO.map(m => <th key={m.id}>{m.icon}</th>)}
              </tr>
            </thead>
            <tbody>
              {studentData.map(s => (
                <tr key={s.id}>
                  <td style={{color:"#ffff00",fontWeight:700}}>{s.name}</td>
                  {MAPS_INFO.map(m => {
                    const unlocked = (s.prog.unlocked_maps||["school","classroom"]).includes(m.id)
                    return <td key={m.id}>{unlocked ? "✅" : "🔒"}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  function renderActivity() {
    const today = new Date().toISOString().split("T")[0]
    const last7 = [...Array(7)].map((_,i) => {
      const d = new Date(); d.setDate(d.getDate()-i)
      return d.toISOString().split("T")[0]
    }).reverse()

    return (
      <>
        <div className="adm-page-title">📈 활동 로그</div>
        <div className="adm-page-sub">최근 7일간 학습 활동을 확인하세요.</div>

        {/* 날짜별 통계 */}
        <div className="adm-card" style={{marginBottom:20}}>
          <div className="adm-card-header"><span className="adm-card-title">날짜별 접속 학생 수</span></div>
          <div style={{padding:16,display:"flex",gap:8,alignItems:"flex-end",height:120}}>
            {last7.map(date => {
              const cnt = logs.filter(l=>l.date===date).length
              const maxCnt = Math.max(...last7.map(d=>logs.filter(l=>l.date===d).length),1)
              const h = Math.round((cnt/maxCnt)*80)
              return (
                <div key={date} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{color:"#ffd700",fontSize:11}}>{cnt}명</div>
                  <div style={{width:"100%",background:"#44ff88",height:h||2,minHeight:2}}/>
                  <div style={{color:"#555",fontSize:10}}>{date.slice(5)}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 오늘 활동 학생 */}
        <div className="adm-card">
          <div className="adm-card-header"><span className="adm-card-title">오늘 활동 학생 ({logs.filter(l=>l.date===today).length}명)</span></div>
          <table className="adm-table">
            <thead><tr><th>학생</th><th>완료 미션</th><th>획득 XP</th><th>방문 맵</th></tr></thead>
            <tbody>
              {logs.filter(l=>l.date===today).map(l=>{
                const s = students.find(st=>st.id===l.student_id)
                return s ? (
                  <tr key={l.id}>
                    <td style={{color:"#ffff00",fontWeight:700}}>{s.name}</td>
                    <td><span className="adm-badge adm-badge-green">{l.missions_completed}개</span></td>
                    <td style={{color:"#ffd700"}}>+{l.xp_earned} XP</td>
                    <td style={{color:"#aaaaff"}}>{(l.maps_visited||[]).join(", ")||"-"}</td>
                  </tr>
                ) : null
              })}
              {logs.filter(l=>l.date===today).length===0 && <tr><td colSpan={4} style={{color:"#555",textAlign:"center",padding:20}}>오늘 활동한 학생이 없어요.</td></tr>}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  // ── 상세 모달 ──
  function renderModal() {
    if (!selectedStudent) return null
    const s = selectedStudent
    const vocab    = s.prog.vocabulary || []
    const missions = s.prog.completed_missions || []
    const maps     = s.prog.unlocked_maps || ["school","classroom"]
    const storyDone= s.prog.story_completed || []
    const sLogs    = getStudentLogs(s.id)

    function exportStudentCSV() {
      const rows = [
        ["날짜","완료미션","획득XP"],
        ...sLogs.map(l=>[l.date, l.missions_completed, l.xp_earned])
      ]
      const csv = rows.map(r=>r.join(",")).join("\n")
      const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"})
      const url = URL.createObjectURL(blob)
      const a=document.createElement("a"); a.href=url
      a.download=`${s.name}_report.csv`; a.click(); URL.revokeObjectURL(url)
    }

    return (
      <div className="adm-modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
        <div className="adm-modal">
          <div className="adm-modal-header">
            <span style={{color:"#ffff00",fontSize:16,fontWeight:700}}>👤 {s.name} 상세 리포트</span>
            <div style={{display:"flex",gap:8}}>
              <button className="adm-btn adm-btn-gold" onClick={exportStudentCSV}>📥 CSV</button>
              <button className="adm-modal-close" onClick={()=>setShowModal(false)}>✕ 닫기</button>
            </div>
          </div>
          <div className="adm-modal-body">
            {/* 기본 정보 */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
              {[
                {label:"레벨",val:`Lv.${s.prog.level||1}`,color:"#4488ff"},
                {label:"XP",val:s.prog.xp||0,color:"#ffd700"},
                {label:"카르마",val:s.prog.karma||0,color:"#ff88aa"},
                {label:"단어장",val:`${vocab.length}개`,color:"#cc88ff"},
              ].map(({label,val,color})=>(
                <div key={label} style={{background:"#000040",border:"1px solid #00004a",padding:"10px 12px",textAlign:"center"}}>
                  <div style={{color:"#aaa",fontSize:11,marginBottom:4}}>{label}</div>
                  <div style={{color,fontSize:20,fontWeight:700}}>{val}</div>
                </div>
              ))}
            </div>

            {/* 맵 현황 */}
            <div style={{marginBottom:16}}>
              <div style={{color:"#00ffff",fontSize:13,fontWeight:700,marginBottom:8}}>🗺 맵 해금 현황</div>
              <div className="adm-map-grid">
                {MAPS_INFO.map(m=>{
                  const unlocked=maps.includes(m.id)
                  return (
                    <div key={m.id} className={`adm-map-card ${unlocked?"unlocked":"locked"}`}>
                      <div className="adm-map-icon">{m.icon}</div>
                      <div className="adm-map-name">{m.name}</div>
                      <div className="adm-map-status" style={{color:unlocked?"#44ff88":"#555"}}>
                        {unlocked?"✓ 해금":"🔒 잠김"}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 스토리 진행 */}
            <div style={{marginBottom:16}}>
              <div style={{color:"#00ffff",fontSize:13,fontWeight:700,marginBottom:8}}>📖 스토리 진행 ({storyDone.length}개 완료)</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {storyDone.length===0
                  ? <span style={{color:"#555",fontSize:12}}>아직 스토리를 시작하지 않았어요.</span>
                  : storyDone.map(id=>(
                    <span key={id} className="adm-badge adm-badge-green">{id}</span>
                  ))
                }
              </div>
            </div>

            {/* 단어장 */}
            <div style={{marginBottom:16}}>
              <div style={{color:"#00ffff",fontSize:13,fontWeight:700,marginBottom:8}}>📚 단어장 ({vocab.length}개)</div>
              {vocab.length===0
                ? <div style={{color:"#555",fontSize:12}}>아직 단어가 없어요.</div>
                : <div style={{maxHeight:120,overflowY:"auto",background:"#000030",padding:8}}>
                    {vocab.map((v,i)=>(
                      <span key={i} style={{display:"inline-block",background:"#000050",border:"1px solid #cc88ff",color:"#cc88ff",padding:"2px 8px",fontSize:12,margin:"2px"}}>{v.korean}</span>
                    ))}
                  </div>
              }
            </div>

            {/* 최근 활동 로그 */}
            <div>
              <div style={{color:"#00ffff",fontSize:13,fontWeight:700,marginBottom:8}}>📈 최근 활동 (14일)</div>
              {sLogs.length===0
                ? <div style={{color:"#555",fontSize:12}}>활동 기록이 없어요.</div>
                : <table className="adm-table" style={{fontSize:12}}>
                    <thead><tr><th>날짜</th><th>완료 미션</th><th>획득 XP</th></tr></thead>
                    <tbody>
                      {sLogs.map(l=>(
                        <tr key={l.id}>
                          <td>{l.date}</td>
                          <td><span className="adm-badge adm-badge-green">{l.missions_completed}개</span></td>
                          <td style={{color:"#ffd700"}}>+{l.xp_earned}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }

  const [testMap, setTestMap]   = useState(null)  // 테스트할 맵 ID
  const [testActive, setTestActive] = useState(false)

  function renderMapTest() {
    return (
      <>
        <div className="adm-page-title">🎮 맵 테스트</div>
        <div className="adm-page-sub">각 맵을 직접 실행해서 NPC, 미션, 미니게임을 테스트할 수 있어요.</div>

        {/* 맵 선택 그리드 */}
        {!testActive && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
            {MAPS_INFO.map(map=>(
              <div key={map.id}
                style={{background:"#000050",border:"2px solid #00ffff",padding:16,textAlign:"center",cursor:"pointer",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#ffff00";e.currentTarget.style.background="#000070";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#00ffff";e.currentTarget.style.background="#000050";}}
                onClick={()=>{ setTestMap(map.id); setTestActive(true); }}>
                <div style={{fontSize:32,marginBottom:8}}>{map.icon}</div>
                <div style={{color:"#ffff00",fontSize:14,fontWeight:700,marginBottom:4}}>{map.name}</div>
                <div style={{color:"#4488ff",fontSize:11}}>챕터: {map.chapter}</div>
                <div style={{marginTop:10,background:"#1a3a1a",color:"#44ff88",border:"1px solid #44ff88",padding:"5px 0",fontSize:12}}>
                  ▶ 테스트 시작
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 게임 실행 */}
        {testActive && testMap && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{color:"#ffff00",fontSize:15,fontWeight:700}}>
                {MAPS_INFO.find(m=>m.id===testMap)?.icon} {MAPS_INFO.find(m=>m.id===testMap)?.name} 테스트 중
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="adm-btn" onClick={()=>{ setTestActive(false); setTestMap(null); }}>
                  ← 맵 목록으로
                </button>
                {MAPS_INFO.filter(m=>m.id!==testMap).map(m=>(
                  <button key={m.id} className="adm-btn adm-btn-green"
                    style={{fontSize:11,padding:"4px 8px"}}
                    onClick={()=>setTestMap(m.id)}>
                    {m.icon} {m.name}
                  </button>
                ))}
              </div>
            </div>
            {/* 게임 iframe 방식으로 임베드 */}
            <div style={{border:"3px solid #ffff00",overflow:"hidden"}}>
              <AdminGameTest
                initialMapMode={testMap}
                unlockedMaps={MAPS_INFO.map(m=>m.id)}
                onExit={()=>{ setTestActive(false); setTestMap(null); }}
              />
            </div>
          </div>
        )}
      </>
    )
  }

  const navItems = [
    { id:"overview",  icon:"📊", label:"전체 현황" },
    { id:"mapview",   icon:"🗺", label:"전체 맵 현황" },
    { id:"activity",  icon:"📈", label:"활동 로그" },
    { id:"maptest",   icon:"🎮", label:"맵 테스트" },
  ]

  return (
    <>
      <style>{ADMIN_STYLE}</style>
      <div className="adm-wrap">
        {/* 사이드바 */}
        <div className="adm-sidebar">
          <div className="adm-logo">
            <div className="adm-logo-title">⚔ SCHOOL RPG</div>
            <div className="adm-logo-sub">관리자 대시보드</div>
          </div>
          <nav className="adm-nav">
            {navItems.map(item => (
              <div key={item.id} className={`adm-nav-item${page===item.id?" active":""}`}
                onClick={()=>setPage(item.id)}>
                <span>{item.icon}</span>{item.label}
              </div>
            ))}
          </nav>
          <div className="adm-logout">
            <div style={{color:"#555",fontSize:11,marginBottom:6}}>학생 {totalStudents}명 · 오늘 {activeToday}명 접속</div>
            <button className="adm-logout-btn" onClick={onLogout}>← 로그아웃</button>
          </div>
        </div>

        {/* 메인 */}
        <div className="adm-main">
          {page === "overview" && renderOverview()}
          {page === "mapview"  && renderMapView()}
          {page === "activity" && renderActivity()}
          {page === "maptest"  && renderMapTest()}
        </div>
      </div>

      {showModal && renderModal()}
    </>
  )
}
