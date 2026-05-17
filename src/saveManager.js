// ═══════════════════════════════════════════════════════════════════════════
// saveManager.js — Supabase 저장/불러오기 관리
// ═══════════════════════════════════════════════════════════════════════════
import { supabase } from "./supabaseClient"

// ─── 진행 데이터 저장 ────────────────────────────────────────────────────
export async function saveProgress(studentId, gameState) {
  try {
    const { error } = await supabase
      .from("student_progress")
      .upsert({
        student_id:          studentId,
        xp:                  gameState.xp,
        level:               gameState.level,
        karma:               gameState.karma,
        map_mode:            gameState.mapMode,
        player_x:            gameState.px,
        player_y:            gameState.py,
        completed_missions:  gameState.completed,
        story_completed:     gameState.storyCompleted,
        vocabulary:          gameState.vocabulary,
        story_flags:         gameState.storyFlags,
        unlocked_maps:       gameState.unlockedMaps,
        char_config:         gameState.charConfig || null,
        last_saved:          new Date().toISOString(),
      }, { onConflict: "student_id" })
    if (error) throw error
    return { ok: true }
  } catch (e) {
    console.error("저장 실패:", e)
    return { ok: false, error: e }
  }
}

// ─── 진행 데이터 불러오기 ────────────────────────────────────────────────
export async function loadProgress(studentId) {
  try {
    const { data, error } = await supabase
      .from("student_progress")
      .select("*")
      .eq("student_id", studentId)
      .single()
    if (error) throw error
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: e }
  }
}

// ─── 활동 로그 업데이트 ──────────────────────────────────────────────────
export async function updateActivityLog(studentId, { missionsCompleted=0, xpEarned=0, mapVisited=null }) {
  try {
    const today = new Date().toISOString().split("T")[0]

    // 오늘 로그 가져오기
    const { data: existing } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("student_id", studentId)
      .eq("date", today)
      .single()

    const mapsVisited = existing?.maps_visited || []
    if (mapVisited && !mapsVisited.includes(mapVisited)) mapsVisited.push(mapVisited)

    await supabase.from("activity_logs").upsert({
      student_id:          studentId,
      date:                today,
      missions_completed:  (existing?.missions_completed || 0) + missionsCompleted,
      xp_earned:           (existing?.xp_earned || 0) + xpEarned,
      maps_visited:        mapsVisited,
    }, { onConflict: "student_id,date" })
    return { ok: true }
  } catch (e) {
    return { ok: false }
  }
}

// ─── localStorage 백업 (오프라인 대비) ──────────────────────────────────
export function saveLocalBackup(studentId, gameState) {
  try {
    localStorage.setItem(
      `school-rpg-backup-${studentId}`,
      JSON.stringify({ ...gameState, savedAt: Date.now() })
    )
  } catch (e) {}
}

export function loadLocalBackup(studentId) {
  try {
    const raw = localStorage.getItem(`school-rpg-backup-${studentId}`)
    return raw ? JSON.parse(raw) : null
  } catch (e) { return null }
}

// ─── 진행 데이터 → 게임 상태 변환 ─────────────────────────────────────
export function progressToGameState(prog) {
  if (!prog) return null
  return {
    xp:             prog.xp || 0,
    level:          prog.level || 1,
    karma:          prog.karma || 0,
    mapMode:        prog.map_mode || "school",
    px:             prog.player_x || 280,
    py:             prog.player_y || 160,
    completed:      prog.completed_missions || [],
    storyCompleted: prog.story_completed || [],
    vocabulary:     prog.vocabulary || [],
    storyFlags:     prog.story_flags || {},
    unlockedMaps:   prog.unlocked_maps || ["school", "classroom"],
    charConfig:     prog.char_config || null,
  }
}
