// ═══════════════════════════════════════════════════════════════════════════
// App.jsx — 전체 라우팅 + 저장 시스템 연동
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from "react"
import AuthScreen       from "./AuthScreen"
import AdminDashboard   from "./AdminDashboard"
import SchoolKoreanGame from "./SchoolKoreanGame"
import { saveProgress, updateActivityLog, progressToGameState, saveLocalBackup } from "./saveManager"
import { CHAPTER_UNLOCK } from "./mapsData"

const APP_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Noto Sans KR',sans-serif;background:#000;}

  .save-toast{
    position:fixed;bottom:20px;right:20px;
    background:#003300;border:2px solid #44ff88;
    color:#44ff88;font-size:13px;padding:8px 16px;
    z-index:9999;font-family:'Noto Sans KR',sans-serif;
    animation:fadeInOut 2.5s ease forwards;
  }
  .unlock-toast{
    position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
    background:#000080;border:4px solid #ffff00;
    color:#ffff00;font-size:17px;font-weight:700;
    padding:20px 32px;z-index:9999;text-align:center;
    animation:unlockPop 3.2s ease forwards;
    font-family:'Noto Sans KR',sans-serif;
  }
  @keyframes fadeInOut{
    0%{opacity:0;transform:translateY(10px);}
    15%{opacity:1;transform:translateY(0);}
    75%{opacity:1;}100%{opacity:0;}
  }
  @keyframes unlockPop{
    0%{opacity:0;transform:translate(-50%,-50%) scale(0.8);}
    15%{opacity:1;transform:translate(-50%,-50%) scale(1.05);}
    25%{transform:translate(-50%,-50%) scale(1);}
    75%{opacity:1;}100%{opacity:0;}
  }
`

export default function App() {
  const [screen, setScreen]         = useState("auth")  // auth | game | admin
  const [authInfo, setAuthInfo]     = useState(null)
  const [gameState, setGameState]   = useState(null)
  const [saveToast, setSaveToast]   = useState(false)
  const [unlockToast, setUnlockToast] = useState(null)

  // 자동 저장 (30초마다)
  useEffect(()=>{
    if(screen!=="game"||!authInfo?.student||!gameState) return
    const t = setInterval(()=>doSave(true), 30000)
    return ()=>clearInterval(t)
  },[screen, authInfo, gameState])

  // 로그인
  function handleLogin(info){
    setAuthInfo(info)
    if(info.type==="admin"){ setScreen("admin"); return; }
    const restored = progressToGameState(info.progress)
    setGameState(restored)
    setScreen("game")
  }

  // 저장
  async function doSave(silent=false){
    if(!authInfo?.student||!gameState) return
    await saveProgress(authInfo.student.id, gameState)
    saveLocalBackup(authInfo.student.id, gameState)
    if(!silent){ setSaveToast(true); setTimeout(()=>setSaveToast(false), 2600); }
  }

  // 게임 상태 업데이트 (SchoolKoreanGame 에서 호출)
  const handleGameStateUpdate = useCallback((newState)=>{
    setGameState(prev=>{
      if(!prev) return newState
      const merged = { ...prev, ...newState }

      // 챕터 클리어 → 맵 잠금 해제
      const prevCompleted = prev.storyCompleted || []
      const nextCompleted = newState.storyCompleted || prevCompleted
      const prevMaps      = prev.unlockedMaps || ["school"]
      let nextMaps        = [...prevMaps]
      let newlyUnlocked   = []

      nextCompleted.forEach(id=>{
        if(!prevCompleted.includes(id)){
          Object.entries(CHAPTER_UNLOCK).forEach(([chId, info])=>{
            if(id===`${chId}-complete`){
              info.unlocks.forEach((mapId, i)=>{
                if(!nextMaps.includes(mapId)){
                  nextMaps.push(mapId)
                  newlyUnlocked.push(info.mapsUnlocked[i]||mapId)
                }
              })
            }
          })
        }
      })

      if(newlyUnlocked.length>0){
        merged.unlockedMaps = nextMaps
        setTimeout(()=>{ setUnlockToast(newlyUnlocked); setTimeout(()=>setUnlockToast(null),3300); },400)
      }

      // 미션 완료 활동 로그
      if(newState.missionJustCompleted&&authInfo?.student){
        updateActivityLog(authInfo.student.id,{
          missionsCompleted:1,
          xpEarned: newState.missionJustCompleted.xp||0,
          mapVisited: newState.mapMode,
        })
        // missionJustCompleted는 한 번만 처리
        merged.missionJustCompleted = null
      }

      return merged
    })
  },[authInfo])

  // 로그아웃
  async function handleLogout(){
    if(authInfo?.student&&gameState) await doSave(true)
    setScreen("auth"); setAuthInfo(null); setGameState(null)
  }

  return (
    <>
      <style>{APP_STYLE}</style>

      {saveToast&&<div className="save-toast">✓ 저장됨</div>}

      {unlockToast&&(
        <div className="unlock-toast">
          🔓 새로운 공간이 열렸어요!<br/>
          <span style={{color:"#fff",fontSize:15,fontWeight:400}}>{unlockToast.join(", ")}</span><br/>
          <span style={{color:"#aaaaff",fontSize:13,fontWeight:400}}>복도 포탈에서 이동하세요.</span>
        </div>
      )}

      {screen==="auth"&&<AuthScreen onLogin={handleLogin}/>}
      {screen==="admin"&&<AdminDashboard onLogout={handleLogout}/>}
      {screen==="game"&&authInfo?.student&&(
        <SchoolKoreanGame
          studentId={authInfo.student.id}
          playerName={authInfo.student.name}
          initialState={gameState}
          unlockedMaps={gameState?.unlockedMaps||["school"]}
          onStateChange={handleGameStateUpdate}
          onSave={doSave}
          onLogout={handleLogout}
        />
      )}
    </>
  )
}
