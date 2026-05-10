// ═══════════════════════════════════════════════════════════════════════════
// MiniGame.jsx — 미니게임 컴포넌트 (운동장/급식실/체육관/방과후교실)
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react"
import { MINIGAMES } from "./mapsData"

const MG_STYLE = `
  .mg-overlay{position:absolute;inset:0;background:rgba(0,0,10,0.92);z-index:50;display:flex;align-items:center;justify-content:center;}
  .mg-box{background:#000080;border:3px solid #ffffff;width:500px;max-width:94vw;}
  .mg-header{background:#000044;border-bottom:2px solid #00ffff;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;}
  .mg-title{color:#ffff00;font-size:16px;font-weight:700;}
  .mg-body{padding:16px;font-family:'Noto Sans KR',sans-serif;}
  .mg-desc{color:#aaaaff;font-size:13px;margin-bottom:14px;}
  .mg-score{color:#ffd700;font-size:18px;font-weight:700;}
  .mg-btn{background:#1a3a1a;color:#44ff88;border:2px solid #44ff88;padding:8px 20px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif;margin:4px;}
  .mg-btn:hover{background:#2a5a2a;}
  .mg-btn-neutral{background:#000050;color:#aaaaff;border-color:#4488ff;}
  .mg-word{display:inline-block;background:#000040;border:2px solid #4488ff;color:#fff;padding:8px 14px;font-size:15px;font-weight:700;margin:4px;cursor:pointer;transition:all 0.1s;}
  .mg-word:hover{background:#000070;border-color:#00ffff;}
  .mg-word.hit{background:#003300;border-color:#44ff88;color:#44ff88;}
  .mg-input{background:#00004a;color:#fff;border:2px solid #4488ff;padding:8px 12px;font-size:15px;font-family:'Noto Sans KR',sans-serif;outline:none;width:100%;margin-bottom:8px;}
  .mg-input:focus{border-color:#00ffff;}
  .mg-bar{background:#001;height:14px;border:1px solid #006;overflow:hidden;margin-bottom:10px;}
  .mg-bar-fill{height:100%;background:linear-gradient(90deg,#44ff88,#00cc44);transition:width 0.3s;}
  .mg-result{text-align:center;padding:16px;}
  .mg-result-title{color:#ffff00;font-size:20px;font-weight:700;margin-bottom:8px;}
  .mg-result-xp{color:#44ff88;font-size:16px;margin-bottom:12px;}
  .mg-emoji{font-size:36px;margin-bottom:8px;display:block;}
  .mg-timer{color:#ff8844;font-size:22px;font-weight:700;font-family:monospace;}
  .mg-choices{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;}
  .mg-choice{background:#000050;color:#fff;border:2px solid #4488ff;padding:10px;font-size:14px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;text-align:center;transition:all 0.1s;}
  .mg-choice:hover{background:#000080;}
  .mg-choice.correct{background:#003300;border-color:#44ff88;color:#44ff88;}
  .mg-choice.wrong{background:#330000;border-color:#ff4444;color:#ff6666;}
  .mg-close-btn{background:transparent;color:#ff6666;border:1px solid #ff4444;padding:3px 10px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;font-size:13px;}
`

// ── 타이밍 게임 (운동장) ──────────────────────────────────────────────────
function TimingGame({ mapId, onFinish }) {
  const mg = MINIGAMES[mapId]
  const [phase, setPhase]       = useState("ready")
  const [words, setWords]       = useState([])
  const [score, setScore]       = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [wordStates, setWordStates] = useState({})
  const timerRef = useRef(null)

  function start() {
    setWords([...mg.words].sort(()=>Math.random()-0.5))
    setScore(0); setWordStates({}); setTimeLeft(30); setPhase("playing")
  }

  useEffect(()=>{
    if(phase!=="playing") return
    timerRef.current=setInterval(()=>{
      setTimeLeft(t=>{ if(t<=1){clearInterval(timerRef.current);setPhase("result");return 0;} return t-1; })
    },1000)
    return()=>clearInterval(timerRef.current)
  },[phase])

  function hit(i){
    if(wordStates[i]) return
    setWordStates(p=>({...p,[i]:"hit"}))
    setScore(s=>s+1)
    setTimeout(()=>setWordStates(p=>{const n={...p};delete n[i];return n}),700)
  }

  const xp = score*5
  return (
    <div className="mg-body">
      {phase==="ready"&&<>
        <div className="mg-desc">{mg.desc}</div>
        <div style={{color:"#aaa",fontSize:13,marginBottom:14}}>30초 안에 최대한 많이 클릭! 클릭마다 +5 XP</div>
        <div style={{textAlign:"center"}}><button className="mg-btn" onClick={start}>▶ 시작</button></div>
      </>}
      {phase==="playing"&&<>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span className="mg-score">점수: {score}</span>
          <span className="mg-timer">{timeLeft}s</span>
        </div>
        <div className="mg-bar"><div className="mg-bar-fill" style={{width:(timeLeft/30*100)+"%"}}/></div>
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",minHeight:100}}>
          {words.map((w,i)=><span key={i} className={`mg-word${wordStates[i]?" "+wordStates[i]:""}`} onClick={()=>hit(i)}>{w}</span>)}
        </div>
      </>}
      {phase==="result"&&<div className="mg-result">
        <span className="mg-emoji">{score>=6?"🏆":score>=3?"🥈":"🥉"}</span>
        <div className="mg-result-title">{score>=6?"대단해요!":score>=3?"잘했어요!":"다음엔 더 잘할 수 있어요!"}</div>
        <div style={{color:"#fff",fontSize:14,marginBottom:8}}>클릭: {score}개</div>
        <div className="mg-result-xp">+{xp} XP!</div>
        <button className="mg-btn" onClick={()=>onFinish(xp)}>완료</button>
        <button className="mg-btn mg-btn-neutral" onClick={start}>다시</button>
      </div>}
    </div>
  )
}

// ── 음식 퀴즈 (급식실) ───────────────────────────────────────────────────
function FoodQuiz({ onFinish }) {
  const qs = MINIGAMES["cafeteria"].questions
  const [idx, setIdx]       = useState(0)
  const [sel, setSel]       = useState(null)
  const [score, setScore]   = useState(0)
  const [done, setDone]     = useState(false)

  function pick(c){
    if(sel) return; setSel(c)
    if(c===qs[idx].answer) setScore(s=>s+1)
    setTimeout(()=>{ setSel(null); if(idx+1>=qs.length) setDone(true); else setIdx(i=>i+1); },900)
  }
  const xp=score*8
  if(done) return <div className="mg-body"><div className="mg-result">
    <span className="mg-emoji">{score>=4?"🍽":"🥄"}</span>
    <div className="mg-result-title">{score}/{qs.length} 정답!</div>
    <div className="mg-result-xp">+{xp} XP!</div>
    <button className="mg-btn" onClick={()=>onFinish(xp)}>완료</button>
  </div></div>

  const q=qs[idx]
  return <div className="mg-body">
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
      <span style={{color:"#aaa",fontSize:13}}>{idx+1}/{qs.length}</span>
      <span className="mg-score">점수: {score}</span>
    </div>
    <div style={{textAlign:"center",fontSize:52,marginBottom:8}}>{q.img}</div>
    <div style={{color:"#fff",fontSize:14,textAlign:"center",marginBottom:12}}>이 음식의 한국어 이름은?</div>
    <div className="mg-choices">
      {q.choices.map((c,i)=><button key={i}
        className={`mg-choice${sel===c?(c===q.answer?" correct":" wrong"):sel&&c===q.answer?" correct":""}`}
        onClick={()=>pick(c)}>{c}</button>)}
    </div>
  </div>
}

// ── 리듬 게임 (체육관) ───────────────────────────────────────────────────
function RhythmGame({ onFinish }) {
  const seqs = MINIGAMES["gym"].sequences
  const [phase, setPhase]   = useState("ready")
  const [idx, setIdx]       = useState(0)
  const [input, setInput]   = useState("")
  const [score, setScore]   = useState(0)
  const [flash, setFlash]   = useState(null)
  const [beat, setBeat]     = useState(0)
  const beatRef             = useRef(null)

  function start(){
    setPhase("playing"); setIdx(0); setScore(0); setInput(""); setBeat(0)
    beatRef.current=setInterval(()=>setBeat(b=>b+1),600)
  }
  useEffect(()=>()=>clearInterval(beatRef.current),[])

  function submit(){
    const ok=(input.replace(/\s/g,"").toLowerCase()===seqs[idx].replace(/\s/g,"").toLowerCase())
    setFlash(ok?"correct":"wrong")
    if(ok) setScore(s=>s+1)
    setTimeout(()=>{
      setFlash(null); setInput("")
      if(idx+1>=seqs.length){clearInterval(beatRef.current);setPhase("result");}
      else setIdx(i=>i+1)
    },700)
  }

  const xp=score*10
  return <div className="mg-body">
    {phase==="ready"&&<>
      <div className="mg-desc">{MINIGAMES["gym"].desc}</div>
      <div style={{textAlign:"center"}}><button className="mg-btn" onClick={start}>▶ 시작</button></div>
    </>}
    {phase==="playing"&&<>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
        <span style={{color:"#aaa",fontSize:13}}>{idx+1}/{seqs.length}</span>
        <span className="mg-score">점수: {score}</span>
      </div>
      <div style={{display:"flex",gap:4,marginBottom:10,justifyContent:"center"}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,background:beat%4===i?"#44ff88":"#003300",border:"1px solid #006",transition:"background 0.1s"}}/>)}
      </div>
      <div style={{background:flash==="correct"?"#003300":flash==="wrong"?"#330000":"#000044",border:`3px solid ${flash==="correct"?"#44ff88":flash==="wrong"?"#ff4444":"#ffff00"}`,padding:14,textAlign:"center",marginBottom:10,transition:"all 0.15s"}}>
        <div style={{color:"#ffff00",fontSize:22,fontWeight:700}}>{seqs[idx]}</div>
      </div>
      <input className="mg-input" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="여기에 입력..." autoFocus/>
      <button className="mg-btn" style={{width:"100%"}} onClick={submit}>입력</button>
    </>}
    {phase==="result"&&<div className="mg-result">
      <span className="mg-emoji">🎵</span>
      <div className="mg-result-title">{score}/{seqs.length} 정답!</div>
      <div className="mg-result-xp">+{xp} XP!</div>
      <button className="mg-btn" onClick={()=>onFinish(xp)}>완료</button>
      <button className="mg-btn mg-btn-neutral" onClick={start}>다시</button>
    </div>}
  </div>
}

// ── 단어 퀴즈 (방과후교실) ───────────────────────────────────────────────
function VocabQuiz({ onFinish }) {
  const qs = MINIGAMES["afterschool"].questions
  const [idx, setIdx]     = useState(0)
  const [sel, setSel]     = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone]   = useState(false)

  function pick(c){
    if(sel) return; setSel(c)
    if(c===qs[idx].answer) setScore(s=>s+1)
    setTimeout(()=>{ setSel(null); if(idx+1>=qs.length) setDone(true); else setIdx(i=>i+1); },900)
  }
  const xp=score*8
  if(done) return <div className="mg-body"><div className="mg-result">
    <span className="mg-emoji">{score>=3?"📝":"✏️"}</span>
    <div className="mg-result-title">{score}/{qs.length} 정답!</div>
    <div className="mg-result-xp">+{xp} XP!</div>
    <button className="mg-btn" onClick={()=>onFinish(xp)}>완료</button>
  </div></div>

  const q=qs[idx]
  return <div className="mg-body">
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
      <span style={{color:"#aaa",fontSize:13}}>{idx+1}/{qs.length}</span>
      <span className="mg-score">점수: {score}</span>
    </div>
    <div style={{background:"#000044",border:"2px solid #ffff00",padding:14,textAlign:"center",marginBottom:12}}>
      <div style={{color:"#ffff00",fontSize:22,fontWeight:700}}>{q.korean}</div>
      <div style={{color:"#888",fontSize:12,marginTop:4}}>이 표현의 뜻은?</div>
    </div>
    <div className="mg-choices">
      {q.choices.map((c,i)=><button key={i}
        className={`mg-choice${sel===c?(c===q.answer?" correct":" wrong"):sel&&c===q.answer?" correct":""}`}
        onClick={()=>pick(c)}>{c}</button>)}
    </div>
  </div>
}

// ── 메인 ─────────────────────────────────────────────────────────────────
export default function MiniGame({ mapId, onClose, onXpEarned }) {
  const mg = MINIGAMES[mapId]
  if(!mg) return null

  function handleFinish(xp){ onXpEarned(xp); onClose(); }

  const games = {
    "timing":    <TimingGame mapId={mapId} onFinish={handleFinish}/>,
    "food-quiz": <FoodQuiz onFinish={handleFinish}/>,
    "rhythm":    <RhythmGame onFinish={handleFinish}/>,
    "vocab-quiz":<VocabQuiz onFinish={handleFinish}/>,
  }

  return <>
    <style>{MG_STYLE}</style>
    <div className="mg-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mg-box">
        <div className="mg-header">
          <span className="mg-title">{mg.title}</span>
          <button className="mg-close-btn" onClick={onClose}>✕ 닫기</button>
        </div>
        {games[mg.id]||<div style={{padding:16,color:"#888"}}>준비 중...</div>}
      </div>
    </div>
  </>
}
