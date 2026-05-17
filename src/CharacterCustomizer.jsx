// ═══════════════════════════════════════════════════════════════════════════
// CharacterCustomizer.jsx — 캐릭터 커스터마이징 화면
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useRef, useEffect } from "react"

const CC_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}

  .cc-overlay{
    position:fixed;inset:0;background:rgba(0,0,10,0.95);
    z-index:200;display:flex;align-items:center;justify-content:center;
    font-family:'Noto Sans KR',sans-serif;
  }
  .cc-box{
    background:#000080;border:4px solid #ffffff;
    width:700px;max-width:96vw;max-height:95vh;
    display:flex;flex-direction:column;
  }
  .cc-header{
    background:#000044;border-bottom:2px solid #00ffff;
    padding:10px 18px;display:flex;justify-content:space-between;align-items:center;
  }
  .cc-title{color:#ffff00;font-size:18px;font-weight:700;}
  .cc-body{display:flex;gap:0;flex:1;overflow:hidden;}

  /* 왼쪽: 미리보기 */
  .cc-preview{
    width:220px;min-width:220px;
    background:#000044;border-right:2px solid #00ffff;
    display:flex;flex-direction:column;align-items:center;
    padding:16px;gap:12px;
  }
  .cc-preview-canvas{border:2px solid #4488ff;background:#0a0a20;}
  .cc-preview-name{color:#ffff00;font-size:14px;font-weight:700;text-align:center;}
  .cc-preview-sub{color:#aaaaff;font-size:12px;text-align:center;}

  /* 오른쪽: 옵션 */
  .cc-options{flex:1;overflow-y:auto;padding:14px;}

  /* 섹션 */
  .cc-section{margin-bottom:16px;}
  .cc-section-title{
    color:#00ffff;font-size:13px;font-weight:700;
    border-bottom:1px solid #00004a;padding-bottom:4px;margin-bottom:10px;
  }

  /* 성별 선택 */
  .cc-gender-row{display:flex;gap:10px;}
  .cc-gender-btn{
    flex:1;padding:12px;text-align:center;cursor:pointer;
    border:2px solid #4488ff;background:#000050;color:#fff;font-size:13px;
    font-family:'Noto Sans KR',sans-serif;transition:all 0.15s;
  }
  .cc-gender-btn.sel{border-color:#ffff00;background:#000080;color:#ffff00;}
  .cc-gender-btn:hover{background:#000070;}

  /* 색상 팔레트 */
  .cc-palette{display:flex;flex-wrap:wrap;gap:8px;}
  .cc-color{
    width:36px;height:36px;border:3px solid transparent;
    cursor:pointer;transition:all 0.1s;border-radius:2px;
  }
  .cc-color.sel{border-color:#ffff00;transform:scale(1.15);}
  .cc-color:hover{transform:scale(1.1);}

  /* 옷 스타일 */
  .cc-outfit-row{display:flex;gap:8px;flex-wrap:wrap;}
  .cc-outfit-btn{
    padding:7px 14px;border:2px solid #4488ff;background:#000050;
    color:#aaaaff;font-size:12px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;
    transition:all 0.15s;
  }
  .cc-outfit-btn.sel{border-color:#ffff00;background:#000080;color:#ffff00;}
  .cc-outfit-btn:hover{background:#000070;}

  /* 완료 버튼 */
  .cc-footer{
    border-top:2px solid #00ffff;padding:12px 18px;
    display:flex;justify-content:flex-end;gap:10px;background:#000044;
  }
  .cc-btn{
    background:#1a3a1a;color:#44ff88;border:2px solid #44ff88;
    padding:10px 24px;font-size:15px;font-weight:700;
    cursor:pointer;font-family:'Noto Sans KR',sans-serif;
  }
  .cc-btn:hover{background:#2a5a2a;}
  .cc-btn-cancel{background:#1a0000;color:#ff6666;border-color:#ff4444;}
  .cc-btn-cancel:hover{background:#2a0000;}

  /* 랜덤 버튼 */
  .cc-random{
    background:#1a1a00;color:#ffcc44;border:2px solid #ffcc44;
    padding:6px 14px;font-size:12px;cursor:pointer;
    font-family:'Noto Sans KR',sans-serif;margin-left:auto;display:block;margin-bottom:8px;
  }
`

// 팔레트 데이터
const HAIR_COLORS = [
  { id:"black",   hex:"#1a1a1a", label:"검정" },
  { id:"brown",   hex:"#5a3010", label:"갈색" },
  { id:"darkbrown",hex:"#3a1a08",label:"진갈색" },
  { id:"blonde",  hex:"#d4a017", label:"금발" },
  { id:"red",     hex:"#cc2200", label:"빨강" },
  { id:"orange",  hex:"#dd6600", label:"주황" },
  { id:"pink",    hex:"#ff88aa", label:"분홍" },
  { id:"purple",  hex:"#8844cc", label:"보라" },
  { id:"blue",    hex:"#2244cc", label:"파랑" },
  { id:"green",   hex:"#228844", label:"초록" },
  { id:"white",   hex:"#eeeeee", label:"흰색" },
  { id:"gray",    hex:"#888888", label:"회색" },
]

const SKIN_COLORS = [
  { id:"light1",  hex:"#ffe0c0", label:"밝음1" },
  { id:"light2",  hex:"#ffcc99", label:"밝음2" },
  { id:"medium1", hex:"#ddaa77", label:"보통1" },
  { id:"medium2", hex:"#cc9966", label:"보통2" },
  { id:"dark1",   hex:"#aa7744", label:"어두움1" },
  { id:"dark2",   hex:"#885533", label:"어두움2" },
  { id:"dark3",   hex:"#663322", label:"어두움3" },
  { id:"pale",    hex:"#fff0e0", label:"창백" },
]

const OUTFIT_COLORS = [
  { id:"navy",    hex:"#1a2a5a", label:"남색" },
  { id:"white",   hex:"#eeeeee", label:"흰색" },
  { id:"gray",    hex:"#666666", label:"회색" },
  { id:"black",   hex:"#222222", label:"검정" },
  { id:"red",     hex:"#cc2222", label:"빨강" },
  { id:"blue",    hex:"#2244cc", label:"파랑" },
  { id:"green",   hex:"#228833", label:"초록" },
  { id:"purple",  hex:"#882299", label:"보라" },
  { id:"orange",  hex:"#cc6600", label:"주황" },
  { id:"pink",    hex:"#dd6688", label:"분홍" },
  { id:"yellow",  hex:"#ccaa00", label:"노랑" },
  { id:"brown",   hex:"#885533", label:"갈색" },
]

const OUTFIT_STYLES = [
  { id:"uniform",   label:"교복" },
  { id:"casual",    label:"캐주얼" },
  { id:"sporty",    label:"체육복" },
  { id:"formal",    label:"정장" },
]

const EYE_COLORS = [
  { id:"black",  hex:"#1a1a1a", label:"검정" },
  { id:"brown",  hex:"#663300", label:"갈색" },
  { id:"blue",   hex:"#2255cc", label:"파랑" },
  { id:"green",  hex:"#225522", label:"초록" },
  { id:"purple", hex:"#662299", label:"보라" },
  { id:"red",    hex:"#cc1111", label:"빨강" },
]

// 기본 캐릭터 설정
export const DEFAULT_CHARACTER = {
  gender:     "male",
  hairColor:  "black",
  skinColor:  "light2",
  outfitColor:"navy",
  outfitStyle:"uniform",
  eyeColor:   "black",
}

// ── Canvas 캐릭터 드로잉 (상세 버전) ────────────────────────────────────
export function drawCharacter(ctx, x, y, config, scale=1, fr=0) {
  const {
    gender="male",
    hairColor="black",
    skinColor="light2",
    outfitColor="navy",
    outfitStyle="uniform",
    eyeColor="black",
  } = config || {}

  const hair   = HAIR_COLORS.find(c=>c.id===hairColor)?.hex   || "#1a1a1a"
  const skin   = SKIN_COLORS.find(c=>c.id===skinColor)?.hex   || "#ffcc99"
  const outfit = OUTFIT_COLORS.find(c=>c.id===outfitColor)?.hex || "#1a2a5a"
  const eye    = EYE_COLORS.find(c=>c.id===eyeColor)?.hex     || "#1a1a1a"

  const s = scale
  const bob = Math.sin(fr*0.18)*1.5*s

  ctx.save()
  ctx.translate(x, y)

  // 그림자
  ctx.fillStyle = "rgba(0,0,0,0.3)"
  ctx.fillRect(-10*s, 14*s+bob, 20*s, 5*s)

  // 다리
  const legL = Math.sin(fr*0.22)*3*s
  ctx.fillStyle = outfit
  ctx.fillRect(-7*s, 2*s+bob, 5*s, 10*s+legL)
  ctx.fillRect(2*s,  2*s+bob, 5*s, 10*s-legL)

  // 신발
  ctx.fillStyle = "#222"
  ctx.fillRect(-8*s, 11*s+bob+legL, 7*s, 3*s)
  ctx.fillRect(1*s,  11*s+bob-legL, 7*s, 3*s)

  // 몸통
  ctx.fillStyle = outfit
  ctx.fillRect(-8*s, -8*s+bob, 16*s, 12*s)

  // 칼라/디테일
  if(outfitStyle==="uniform") {
    ctx.fillStyle = "rgba(255,255,255,0.3)"
    ctx.fillRect(-3*s, -8*s+bob, 6*s, 4*s)
  } else if(outfitStyle==="sporty") {
    ctx.fillStyle = "rgba(255,255,255,0.2)"
    ctx.fillRect(-8*s, -4*s+bob, 16*s, 2*s)
  } else if(outfitStyle==="formal") {
    ctx.fillStyle = "rgba(255,255,255,0.4)"
    ctx.fillRect(-2*s, -8*s+bob, 4*s, 12*s)
  }

  // 팔
  ctx.fillStyle = skin
  ctx.fillRect(-12*s, -7*s+bob, 4*s, 10*s)
  ctx.fillRect(8*s,   -7*s+bob, 4*s, 10*s)

  // 소매
  ctx.fillStyle = outfit
  ctx.fillRect(-12*s, -7*s+bob, 4*s, 5*s)
  ctx.fillRect(8*s,   -7*s+bob, 4*s, 5*s)

  // 목
  ctx.fillStyle = skin
  ctx.fillRect(-2*s, -12*s+bob, 4*s, 5*s)

  // 머리
  ctx.fillStyle = skin
  ctx.fillRect(-9*s, -24*s+bob, 18*s, 14*s)

  // 귀
  ctx.fillStyle = skin
  ctx.fillRect(-11*s, -20*s+bob, 3*s, 6*s)
  ctx.fillRect(8*s,   -20*s+bob, 3*s, 6*s)

  // 머리카락 (성별/스타일별)
  ctx.fillStyle = hair
  if(gender==="male") {
    ctx.fillRect(-9*s, -24*s+bob, 18*s, 6*s)  // 윗머리
    ctx.fillRect(-9*s, -24*s+bob, 3*s, 10*s)  // 옆머리 왼
    ctx.fillRect(6*s,  -24*s+bob, 3*s, 10*s)  // 옆머리 오
  } else {
    ctx.fillRect(-9*s, -24*s+bob, 18*s, 5*s)  // 윗머리
    ctx.fillRect(-9*s, -24*s+bob, 3*s, 18*s)  // 긴머리 왼
    ctx.fillRect(6*s,  -24*s+bob, 3*s, 18*s)  // 긴머리 오
    ctx.fillRect(-9*s, -7*s+bob,  18*s, 4*s)  // 긴머리 아래
  }

  // 눈
  ctx.fillStyle = eye
  ctx.fillRect(-5*s, -17*s+bob, 4*s, 4*s)
  ctx.fillRect(1*s,  -17*s+bob, 4*s, 4*s)

  // 눈 하이라이트
  ctx.fillStyle = "rgba(255,255,255,0.7)"
  ctx.fillRect(-4*s, -17*s+bob, 1*s, 1*s)
  ctx.fillRect(2*s,  -17*s+bob, 1*s, 1*s)

  // 입
  ctx.fillStyle = "rgba(0,0,0,0.4)"
  if(gender==="female") {
    ctx.fillStyle = "#cc4466"
  }
  ctx.fillRect(-2*s, -12*s+bob, 4*s, 2*s)

  // 볼터치 (여성)
  if(gender==="female") {
    ctx.fillStyle = "rgba(255,100,100,0.3)"
    ctx.fillRect(-7*s, -15*s+bob, 3*s, 2*s)
    ctx.fillRect(4*s,  -15*s+bob, 3*s, 2*s)
  }

  ctx.restore()
}

// ── 미리보기 캔버스 ────────────────────────────────────────────────────────
function PreviewCanvas({ config }) {
  const canvasRef = useRef(null)
  const frRef     = useRef(0)
  const rafRef    = useRef(null)

  useEffect(()=>{
    const canvas = canvasRef.current
    if(!canvas) return
    const ctx = canvas.getContext("2d")
    const loop = ()=>{
      frRef.current++
      ctx.fillStyle = "#0a0a20"
      ctx.fillRect(0,0,160,200)
      // 바닥
      ctx.fillStyle = "#1a1a40"
      ctx.fillRect(0,160,160,40)
      ctx.fillStyle = "#2a2a60"
      ctx.fillRect(0,160,160,3)
      // 캐릭터
      drawCharacter(ctx, 80, 155, config, 2.5, frRef.current)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return ()=>cancelAnimationFrame(rafRef.current)
  },[config])

  return <canvas ref={canvasRef} width={160} height={200} className="cc-preview-canvas" style={{width:160,height:200}}/>
}

// ── 메인 커스터마이저 ────────────────────────────────────────────────────────
export default function CharacterCustomizer({ initialConfig, playerName, onConfirm, onCancel }) {
  const [config, setConfig] = useState(initialConfig || DEFAULT_CHARACTER)

  function set(key, val) { setConfig(p=>({...p,[key]:val})) }

  function randomize() {
    setConfig({
      gender:      Math.random()>0.5?"male":"female",
      hairColor:   HAIR_COLORS[Math.floor(Math.random()*HAIR_COLORS.length)].id,
      skinColor:   SKIN_COLORS[Math.floor(Math.random()*SKIN_COLORS.length)].id,
      outfitColor: OUTFIT_COLORS[Math.floor(Math.random()*OUTFIT_COLORS.length)].id,
      outfitStyle: OUTFIT_STYLES[Math.floor(Math.random()*OUTFIT_STYLES.length)].id,
      eyeColor:    EYE_COLORS[Math.floor(Math.random()*EYE_COLORS.length)].id,
    })
  }

  return (
    <>
      <style>{CC_STYLE}</style>
      <div className="cc-overlay">
        <div className="cc-box">
          <div className="cc-header">
            <span className="cc-title">🎨 캐릭터 만들기</span>
            <span style={{color:"#aaaaff",fontSize:13}}>{playerName} 님의 캐릭터</span>
          </div>

          <div className="cc-body">
            {/* 미리보기 */}
            <div className="cc-preview">
              <PreviewCanvas config={config}/>
              <div className="cc-preview-name">{playerName}</div>
              <div className="cc-preview-sub">
                {config.gender==="male"?"남학생":"여학생"} ·{" "}
                {OUTFIT_STYLES.find(o=>o.id===config.outfitStyle)?.label}
              </div>
              <button className="cc-random" onClick={randomize}>🎲 랜덤</button>
            </div>

            {/* 옵션 */}
            <div className="cc-options">

              {/* 성별 */}
              <div className="cc-section">
                <div className="cc-section-title">👤 성별</div>
                <div className="cc-gender-row">
                  <button className={`cc-gender-btn${config.gender==="male"?" sel":""}`} onClick={()=>set("gender","male")}>
                    👦 남학생
                  </button>
                  <button className={`cc-gender-btn${config.gender==="female"?" sel":""}`} onClick={()=>set("gender","female")}>
                    👧 여학생
                  </button>
                </div>
              </div>

              {/* 머리색 */}
              <div className="cc-section">
                <div className="cc-section-title">💇 머리색</div>
                <div className="cc-palette">
                  {HAIR_COLORS.map(c=>(
                    <div key={c.id} className={`cc-color${config.hairColor===c.id?" sel":""}`}
                      style={{background:c.hex}} title={c.label}
                      onClick={()=>set("hairColor",c.id)}/>
                  ))}
                </div>
              </div>

              {/* 피부색 */}
              <div className="cc-section">
                <div className="cc-section-title">🖐 피부색</div>
                <div className="cc-palette">
                  {SKIN_COLORS.map(c=>(
                    <div key={c.id} className={`cc-color${config.skinColor===c.id?" sel":""}`}
                      style={{background:c.hex,border:c.id==="light1"?"3px solid #444":undefined}}
                      title={c.label} onClick={()=>set("skinColor",c.id)}/>
                  ))}
                </div>
              </div>

              {/* 눈 색 */}
              <div className="cc-section">
                <div className="cc-section-title">👁 눈 색</div>
                <div className="cc-palette">
                  {EYE_COLORS.map(c=>(
                    <div key={c.id} className={`cc-color${config.eyeColor===c.id?" sel":""}`}
                      style={{background:c.hex}} title={c.label}
                      onClick={()=>set("eyeColor",c.id)}/>
                  ))}
                </div>
              </div>

              {/* 옷 스타일 */}
              <div className="cc-section">
                <div className="cc-section-title">👕 옷 스타일</div>
                <div className="cc-outfit-row">
                  {OUTFIT_STYLES.map(o=>(
                    <button key={o.id} className={`cc-outfit-btn${config.outfitStyle===o.id?" sel":""}`}
                      onClick={()=>set("outfitStyle",o.id)}>{o.label}</button>
                  ))}
                </div>
              </div>

              {/* 옷 색 */}
              <div className="cc-section">
                <div className="cc-section-title">🎨 옷 색깔</div>
                <div className="cc-palette">
                  {OUTFIT_COLORS.map(c=>(
                    <div key={c.id} className={`cc-color${config.outfitColor===c.id?" sel":""}`}
                      style={{background:c.hex}} title={c.label}
                      onClick={()=>set("outfitColor",c.id)}/>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="cc-footer">
            {onCancel && <button className="cc-btn cc-btn-cancel" onClick={onCancel}>취소</button>}
            <button className="cc-btn" onClick={()=>onConfirm(config)}>
              ✓ 완료 — 게임 시작!
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
