import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MiniGame from "./MiniGame";
import { updateActivityLog } from "./saveManager";
import CharacterCustomizer, { DEFAULT_CHARACTER, drawCharacter } from "./CharacterCustomizer";
import {
  GATE_MAP, FLOOR1_MAP, FLOOR2_MAP, ROOFTOP_MAP,
  BIG_MAPS_META, BIG_PORTALS, BIG_NPCS, EXTRA_TILE_COLORS,
} from "./bigMap";
import {
  MAPS_META, MAP_NPCS, SCHOOL_NEW_PORTALS, EXIT_PORTAL,
  PLAYGROUND_MAP, CAFETERIA_MAP, GYM_MAP, RESTROOM_MAP,
  TEACHERROOM_MAP, AFTERSCHOOL_MAP, CHAPTER_UNLOCK
} from "./mapsData";

// ═══════════════════════════════════════════════════════════════════════════
// YS2 스타일 CSS
// ═══════════════════════════════════════════════════════════════════════════
const YS2_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; image-rendering: pixelated; }
  body { background: #000; font-family: 'Noto Sans KR', sans-serif; overflow: hidden; }

  /* ── YS2 배경색 ── */
  .ys2-bg { background: #000; min-height: 100vh; display: flex; align-items: center; justify-content: center; }

  /* ── 게임 프레임 (640×480) ── */
  .ys2-frame {
    position: relative;
    width: 640px; height: 480px;
    background: #000;
    border: 3px solid #888;
    box-shadow: 0 0 0 1px #444, 0 0 24px #000;
    overflow: hidden;
    flex-shrink: 0;
  }

  /* ── 우측 UI 패널 ── */
  .ys2-side {
    width: 340px;
    height: 480px;
    background: #000080;
    border: 3px solid #888;
    border-left: none;
    box-shadow: 0 0 0 1px #444;
    display: flex; flex-direction: column;
    overflow: hidden;
  }

  /* ── YS2 공통 창 스타일 ── */
  .ys2-win {
    border: 2px solid #00ffff;
    background: #000080;
    padding: 0;
  }
  .ys2-win-title {
    background: #00008b;
    border-bottom: 1px solid #00ffff;
    color: #ffff00;
    font-size: 13px; font-weight: 700;
    padding: 3px 8px;
    letter-spacing: 1px;
  }
  .ys2-win-body { padding: 6px 8px; }

  /* ── 상태창 ── */
  .ys2-status {
    border-bottom: 2px solid #00ffff;
    padding: 6px 10px;
    background: #000060;
  }
  .ys2-status-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
  .ys2-label { color: #00ffff; font-size: 13px; }
  .ys2-val   { color: #ffff00; font-size: 13px; font-weight: 700; }

  /* ── YS2 바 ── */
  .ys2-bar-wrap { margin: 3px 0; }
  .ys2-bar-label { color: #00ffff; font-size: 11px; margin-bottom: 2px; }
  .ys2-bar-bg { background: #001; border: 1px solid #006; height: 9px; }
  .ys2-bar-fill { height: 100%; transition: width 0.4s; }
  .ys2-bar-xp  { background: #ffff00; }
  .ys2-bar-day { background: #00ff88; }

  /* ── 하단 메시지 창 ── */
  .ys2-msgbox {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 108px;
    background: #000080;
    border-top: 3px solid #ffffff;
    z-index: 20;
  }
  .ys2-msgbox-inner {
    margin: 6px 10px 6px 10px;
    border: 2px solid #00ffff;
    height: 90px;
    padding: 8px 12px;
    position: relative;
    background: #00004a;
  }
  .ys2-msgbox-name {
    position: absolute; top: -12px; left: 10px;
    background: #000080; color: #ffff00;
    font-size: 13px; font-weight: 700;
    padding: 0 6px; border: 1px solid #00ffff;
  }
  .ys2-msgbox-text { color: #fff; font-size: 14px; line-height: 1.65; }
  .ys2-cursor { display: inline-block; width: 2px; height: 14px; background: #fff; animation: ys2blink .5s step-end infinite; vertical-align: middle; margin-left: 3px; }

  /* ── 메뉴 오버레이 ── */
  .ys2-menu-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 30;
  }
  .ys2-menu {
    background: #000080;
    border: 3px solid #ffffff;
    min-width: 200px;
  }
  .ys2-menu-title {
    background: #00008b; border-bottom: 2px solid #fff;
    color: #ffff00; font-size: 14px; font-weight: 700;
    padding: 5px 12px; text-align: center;
  }
  .ys2-menu-item {
    color: #ffffff; font-size: 14px;
    padding: 6px 16px; cursor: pointer;
    display: flex; align-items: center; gap: 10px;
    border-bottom: 1px solid #000060;
  }
  .ys2-menu-item:last-child { border-bottom: none; }
  .ys2-menu-item.sel { background: #0000cc; color: #ffff00; }
  .ys2-menu-item .cur { color: #ffff00; font-size: 12px; opacity: 0; }
  .ys2-menu-item.sel .cur { opacity: 1; }

  /* ── 미션 입력 창 ── */
  .ys2-mission-win {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex; align-items: flex-start; justify-content: center;
    padding-top: 30px;
    z-index: 35;
    overflow-y: auto;
  }
  .ys2-mission-box {
    background: #000080;
    border: 3px solid #ffffff;
    width: 580px;
  }
  .ys2-mission-header {
    background: #000044;
    border-bottom: 2px solid #00ffff;
    padding: 6px 14px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .ys2-mission-close {
    color: #ff8888; font-size: 13px; cursor: pointer;
    border: 1px solid #ff8888; padding: 2px 8px;
    background: transparent;
    font-family: 'Noto Sans KR', sans-serif;
  }
  .ys2-mission-close:hover { background: #330000; }
  .ys2-input {
    width: 100%;
    background: #00004a; color: #fff;
    border: 2px solid #00ffff;
    padding: 7px 10px;
    font-size: 14px;
    font-family: 'Noto Sans KR', sans-serif;
    outline: none;
  }
  .ys2-input:focus { border-color: #ffff00; }
  .ys2-input::placeholder { color: #4466aa; }
  .ys2-btn {
    background: #0000aa; color: #ffff00;
    border: 2px solid #00ffff;
    padding: 6px 16px;
    font-size: 14px; font-weight: 700;
    cursor: pointer;
    font-family: 'Noto Sans KR', sans-serif;
  }
  .ys2-btn:hover { background: #0000cc; }
  .ys2-btn:active { background: #00008a; }
  .ys2-btn-green { border-color: #00ff88; color: #00ff88; background: #004422; }
  .ys2-btn-green:hover { background: #005533; }
  .ys2-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── 채팅 로그 ── */
  .ys2-log { overflow-y: auto; flex: 1; padding: 4px 6px; }
  .ys2-log-msg { font-size: 13px; line-height: 1.5; padding: 3px 6px; margin-bottom: 2px; border-left: 3px solid; }
  .ys2-log-msg.system { border-color: #888; color: #aaa; background: #000050; }
  .ys2-log-msg.user   { border-color: #00ffff; color: #aaddff; background: #000060; }
  .ys2-log-msg.npc    { border-color: #ffff00; color: #ffffaa; background: #000050; }
  .ys2-log-msg.success{ border-color: #00ff88; color: #00ff88; background: #003300; }
  .ys2-log-msg.fail   { border-color: #ff4444; color: #ff8888; background: #330000; }

  /* ── 팝업 ── */
  .ys2-popup {
    position: absolute; top: 8px; right: 8px;
    background: #004400; border: 2px solid #00ff00;
    color: #00ff00; font-size: 14px; font-weight: 700;
    padding: 6px 12px; z-index: 40;
  }

  /* ── 데일리 테마 배너 ── */
  .ys2-theme-bar {
    border-bottom: 2px solid #00ffff;
    padding: 5px 10px;
    background: #000050;
    display: flex; align-items: center; gap: 8px;
  }
  .ys2-theme-name { color: #ffff00; font-size: 13px; font-weight: 700; }
  .ys2-theme-desc { color: #aaaaff; font-size: 12px; }

  /* ── 애니메이션 ── */
  @keyframes ys2blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes ys2pop { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(-30px);opacity:0} }
  .ys2-xppop { position:absolute; top:80px; left:50%; transform:translateX(-50%); background:#004400; border:2px solid #00ff00; color:#00ff00; font-weight:700; font-size:15px; padding:4px 14px; z-index:50; animation:ys2pop 1.5s ease-out forwards; pointer-events:none; }

  /* ── 미니맵 ── */
  .ys2-minimap-wrap {
    border: 2px solid #00ffff;
    background: #000020;
    margin-bottom: 6px;
    position: relative;
  }
  .ys2-minimap-label { color:#00ffff; font-size:11px; padding:2px 6px; background:#000040; border-bottom:1px solid #00ffff; }

  /* ── 단어장 ── */
  .ys2-vocab-win {
    position:absolute; inset:0;
    background:rgba(0,0,20,0.92);
    z-index:42; overflow-y:auto;
  }
  .ys2-vocab-box { background:#000080; border:3px solid #ffffff; margin:16px auto; width:560px; max-width:94%; }
  .ys2-vocab-item { display:flex; align-items:center; justify-content:space-between; padding:7px 12px; border-bottom:1px solid #000060; }
  .ys2-vocab-item:last-child { border-bottom:none; }
  .ys2-vocab-kr  { color:#ffff00; font-size:15px; font-weight:700; }
  .ys2-vocab-hint{ color:#aaaaff; font-size:12px; margin-top:2px; }
  .ys2-vocab-day { color:#00ffff; font-size:11px; }
  .ys2-star      { cursor:pointer; font-size:16px; user-select:none; }

  /* ── 스토리 로그 ── */
  .ys2-log-win {
    position:absolute; inset:0;
    background:rgba(0,0,20,0.92);
    z-index:42; display:flex; align-items:center; justify-content:center;
  }
  .ys2-log-box { background:#000080; border:3px solid #ffffff; width:560px; max-width:94%; max-height:85vh; display:flex; flex-direction:column; }
  .ys2-log-scroll { overflow-y:auto; flex:1; padding:8px 12px; }
  .ys2-log-entry { padding:8px 0; border-bottom:1px solid #00003a; }
  .ys2-log-entry:last-child { border-bottom:none; }
  .ys2-log-speaker { color:#ffff00; font-size:12px; font-weight:700; margin-bottom:3px; }
  .ys2-log-body    { color:#ddddff; font-size:13px; line-height:1.6; }
  .ys2-log-time    { color:#444488; font-size:11px; float:right; }

  /* ── 이름 입력창 ── */
  .ys2-name-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,0.92);
    z-index:100; display:flex; align-items:center; justify-content:center;
  }
  .ys2-name-box { background:#000080; border:4px solid #ffff00; padding:0; width:400px; text-align:center; }
  .ys2-name-title { background:#000044; border-bottom:2px solid #ffff00; padding:12px; color:#ffff00; font-size:16px; font-weight:700; }
  .ys2-name-body  { padding:20px 24px; }

  /* ── BGM 버튼 ── */
  .ys2-bgm-btn { font-family:'Noto Sans KR',sans-serif; font-size:12px; background:#000040; color:#00ffff; border:1px solid #00ffff; padding:3px 8px; cursor:pointer; }
  .ys2-bgm-btn:hover { background:#000060; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #000040; }
  ::-webkit-scrollbar-thumb { background: #0000cc; border: 1px solid #00ffff; }

  /* ── 지도 오버레이 ── */
  .ys2-mapname {
    position: absolute; top: 6px; left: 6px;
    background: #000080; border: 2px solid #00ffff;
    color: #fff; font-size: 13px; padding: 3px 10px; z-index: 10;
  }
  .ys2-mapname span { color: #ffff00; }

  /* ── 조이스틱 ── */
  .ys2-joy { position: absolute; bottom: 116px; right: 8px; display: flex; flex-direction: column; align-items: center; gap: 2px; z-index: 15; }
  .ys2-joy-row { display: flex; gap: 2px; }
  .ys2-jbtn {
    width: 34px; height: 34px;
    background: #000080; color: #ffff00;
    border: 2px solid #00ffff;
    font-size: 13px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; user-select: none; touch-action: none;
  }
  .ys2-jbtn:active { background: #0000cc; }
  .ys2-jact { background: #004400; border-color: #00ff88; color: #00ff88; font-size: 11px; }

  /* ── 미션 목록 ── */
  .ys2-mlist-item {
    border-bottom: 1px solid #00004a;
    padding: 7px 10px;
  }
  .ys2-mlist-item:last-child { border-bottom: none; }
  .ys2-mlist-title { color: #ffff00; font-size: 14px; font-weight: 700; margin-bottom: 3px; }
  .ys2-mlist-title.done { color: #00ff88; }
  .ys2-mlist-prompt { color: #ccccff; font-size: 13px; line-height: 1.5; margin-bottom: 5px; }
  .ys2-mlist-actions { display: flex; gap: 6px; }
`;

// ═══════════════════════════════════════════════════════════════════════════
// 타일 맵 상수
// ═══════════════════════════════════════════════════════════════════════════
const TS = 20; // 타일 사이즈
const CAM_W = 640;
const CAM_H = 372; // 480 - 108(메시지창)

// 학교 복도 타일맵 (0=복도바닥, 1=벽, 2=문, 3=기둥, 4=카펫, 5=체크바닥)
const SCHOOL_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,0,0,0,0,3,0,0,0,0,3,0,0,0,0,3,0,0,0,0,3,0,0,0,0,3,0,0,0,1,1],
  [1,1,0,4,4,0,3,0,4,4,0,3,0,4,4,0,3,0,4,4,0,3,0,4,4,0,3,0,4,0,1,1],
  [1,1,0,4,4,0,3,0,4,4,0,3,0,4,4,0,3,0,4,4,0,3,0,4,4,0,3,0,4,0,1,1],
  [1,1,0,0,0,0,3,0,0,0,0,3,0,0,0,0,3,0,0,0,0,3,0,0,0,0,3,0,0,0,1,1],
  [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
  [1,1,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,1,1],
  [1,1,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,1,1],
  [1,1,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,1,1],
  [1,1,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,1,1],
  [1,1,0,0,0,0,3,0,0,0,0,3,0,0,0,0,3,0,0,0,0,3,0,0,0,0,3,0,0,0,1,1],
  [1,1,1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// 교실 타일맵
const CLASS_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,4,4,4,4,4,4,4,4,4,4,4,4,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,1],
  [1,0,4,4,4,4,4,4,4,4,4,4,4,4,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,5,5,0,5,5,0,5,5,0,5,5,0,0,0,5,5,0,5,5,0,5,5,0,5,5,0,0,0,0,1],
  [1,0,5,5,0,5,5,0,5,5,0,5,5,0,0,0,5,5,0,5,5,0,5,5,0,5,5,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,5,5,0,5,5,0,5,5,0,5,5,0,0,0,5,5,0,5,5,0,5,5,0,5,5,0,0,0,0,1],
  [1,0,5,5,0,5,5,0,5,5,0,5,5,0,0,0,5,5,0,5,5,0,5,5,0,5,5,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,5,5,0,5,5,0,5,5,0,5,5,0,0,0,5,5,0,5,5,0,5,5,0,5,5,0,0,0,0,1],
  [1,0,5,5,0,5,5,0,5,5,0,5,5,0,0,0,5,5,0,5,5,0,5,5,0,5,5,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// NPC 위치 (타일 단위)
const SCHOOL_NPCS = [
  { id:"teacher",   name:"선생님",       color:"#4488ff", bodyColor:"#2255cc", tx:4,  ty:4, facing:"down",
    greeting:"어서 오세요! 오늘의 표현을 연습해 볼까요?",
    hint:["교무실 표현:","· 선생님, 질문 있어요.","· 화장실에 다녀와도 될까요?","(Примеры для учителя)"],
    missions:[
      { id:"t1", title:"질문하기",  prompt:"공책을 못 찾았다고 말하세요.", answer:"선생님, 공책을 못 찾았어요.", xp:10 },
      { id:"t2", title:"허락 받기", prompt:"화장실에 가도 되는지 물어보세요.", answer:"선생님, 화장실에 다녀와도 될까요?", xp:12 },
    ]},
  { id:"admin",     name:"행정실 선생님", color:"#44cc44", bodyColor:"#228822", tx:10, ty:4, facing:"down",
    greeting:"무엇이 필요하신가요? 도와드릴게요.",
    hint:["행정실 표현:","· 연필이 필요해요.","· 도와주세요.","(Выражения в канцелярии)"],
    missions:[
      { id:"a1", title:"물건 요청", prompt:"연필이 필요하다고 말하세요.", answer:"연필이 필요해요.", xp:10 },
    ]},
  { id:"librarian", name:"사서 선생님",  color:"#cc44cc", bodyColor:"#882288", tx:16, ty:4, facing:"down",
    greeting:"어떤 책을 찾으시나요? 안내해 드릴게요.",
    hint:["도서관 표현:","· 책을 찾고 싶어요.","· 이 책을 빌리고 싶어요.","(Выражения в библиотеке)"],
    missions:[
      { id:"l1", title:"책 찾기", prompt:"책을 찾고 싶다고 말하세요.", answer:"책을 찾고 싶어요.", xp:10 },
    ]},
  { id:"nurse",     name:"보건 선생님",  color:"#ff6688", bodyColor:"#cc2255", tx:22, ty:4, facing:"down",
    greeting:"어디가 불편하세요? 이야기해 보세요.",
    hint:["보건실 표현:","· 배가 아파요.","· 머리가 아파요.","(Выражения в медпункте)"],
    missions:[
      { id:"n1", title:"아픈 곳 말하기", prompt:"배가 아프다고 말하세요.", answer:"배가 아파요.", xp:10 },
    ]},
];

const CLASS_NPCS = [
  { id:"homeroom", name:"담임선생님", color:"#4488ff", bodyColor:"#2255cc", tx:14, ty:2, facing:"down",
    greeting:"오늘 수업 준비됐나요? 열심히 해봐요!",
    hint:["교실 표현:","· 선생님, 발표해도 될까요?","· 잘 모르겠어요.","(Выражения в классе)"],
    missions:[
      { id:"c1", title:"발표 준비", prompt:"발표해도 되는지 말하세요.", answer:"선생님, 발표해도 될까요?", xp:12 },
      { id:"c2", title:"모를 때",   prompt:"잘 모르겠다고 말하세요.",   answer:"잘 모르겠어요.",           xp:10 },
    ]},
  { id:"seatmate", name:"짝꿍",    color:"#ffcc44", bodyColor:"#cc9922", tx:5,  ty:8, facing:"right",
    greeting:"같이 공부할까? 뭐 도와줄까?",
    hint:["친구 표현:","· 지우개를 빌려줄 수 있어?","· 같이 해도 돼?"],
    missions:[
      { id:"c3", title:"준비물 빌리기", prompt:"지우개를 빌려달라고 말하세요.", answer:"지우개를 빌려줄 수 있어?", xp:8 },
    ]},
  { id:"monitor",  name:"반장",    color:"#44cc88", bodyColor:"#228855", tx:18, ty:8, facing:"left",
    greeting:"청소 당번 확인했어? 같이 하자!",
    hint:["학급 표현:","· 청소 같이 할래?","· 칠판을 닦을게."],
    missions:[
      { id:"c4", title:"함께 하기", prompt:"청소를 같이 하자고 말하세요.", answer:"청소 같이 할래?", xp:8 },
    ]},
  { id:"book-kid", name:"책 친구", color:"#ff8844", bodyColor:"#cc5522", tx:5,  ty:11, facing:"right",
    greeting:"이 책 진짜 재밌어! 읽어볼래?",
    hint:["학급문고 표현:","· 이 책 읽어도 돼?","· 이 책이 재미있어요."],
    missions:[
      { id:"c5", title:"책 읽기", prompt:"이 책을 읽어도 되는지 말하세요.", answer:"이 책 읽어도 돼?", xp:8 },
    ]},
];

// 포탈
const SCHOOL_PORTALS = [{ id:"to-class", tx:13, ty:12, toMap:"classroom", spawnTx:14, spawnTy:13, label:"교실 입장" }];
const CLASS_PORTALS  = [{ id:"to-school", tx:1, ty:14, toMap:"school", spawnTx:13, spawnTy:11, label:"복도로 나가기" }];

// ═══════════════════════════════════════════════════════════════════════════
// 날짜 시스템
// ═══════════════════════════════════════════════════════════════════════════
const DAILY_THEMES = [
  { day:"일요일", icon:"☀", themeColor:"#ffcc44", themeName:"자기소개의 날", desc:"자신을 소개하는 표현을 연습해요!",
    todayMissions:{
      teacher:   [{id:"sun-t1",title:"이름 말하기",  prompt:"선생님께 내 이름을 말해 보세요.",    answer:"선생님, 제 이름은 ___예요.",xp:12}],
      admin:     [{id:"sun-a1",title:"반 소개하기",  prompt:"몇 학년 몇 반인지 말해 보세요.",    answer:"저는 ___학년 ___반이에요.",xp:10}],
      librarian: [{id:"sun-l1",title:"좋아하는 것",  prompt:"좋아하는 것을 말해 보세요.",        answer:"저는 ___을 좋아해요.",xp:10}],
      nurse:     [{id:"sun-n1",title:"나라 소개",    prompt:"어느 나라에서 왔는지 말해 보세요.", answer:"저는 ___에서 왔어요.",xp:10}],
      homeroom:  [{id:"sun-c1",title:"친구에게 소개",prompt:"친구에게 자신을 소개해 보세요.",    answer:"안녕! 나는 ___야.",xp:10}],
      seatmate:  [{id:"sun-c2",title:"취미 말하기",  prompt:"친구에게 취미를 말해 보세요.",      answer:"나는 ___하는 걸 좋아해.",xp:8}],
      monitor:   [{id:"sun-c3",title:"나이 말하기",  prompt:"몇 살인지 말해 보세요.",            answer:"나는 ___살이야.",xp:8}],
      "book-kid":[{id:"sun-c4",title:"좋아하는 책",  prompt:"좋아하는 책을 말해 보세요.",        answer:"나는 ___을 좋아해.",xp:8}],
    }, hint:{school:"오늘의 표현: 저는 ___예요 / 저는 ___에서 왔어요", classroom:"오늘의 표현: 나는 ___야 / 나는 ___살이야"}},
  { day:"월요일", icon:"★", themeColor:"#4a9eff", themeName:"인사의 날", desc:"다양한 인사 표현을 연습해요!",
    todayMissions:{
      teacher:   [{id:"mon-t1",title:"아침 인사",prompt:"선생님께 아침 인사를 해 보세요.",   answer:"선생님, 안녕하세요!",xp:10},
                  {id:"mon-t2",title:"작별 인사",prompt:"먼저 가겠다고 말해 보세요.",        answer:"선생님, 먼저 가겠습니다.",xp:12}],
      admin:     [{id:"mon-a1",title:"감사 인사",prompt:"감사하다고 말해 보세요.",            answer:"감사합니다.",xp:10}],
      librarian: [{id:"mon-l1",title:"처음 만남",prompt:"처음 만났을 때 인사해 보세요.",     answer:"처음 뵙겠습니다.",xp:12}],
      nurse:     [{id:"mon-n1",title:"죄송 인사",prompt:"늦었을 때 사과해 보세요.",          answer:"죄송합니다, 늦었어요.",xp:10}],
      homeroom:  [{id:"mon-c1",title:"등교 인사",prompt:"담임선생님께 인사해 보세요.",        answer:"선생님, 안녕하세요!",xp:10}],
      seatmate:  [{id:"mon-c2",title:"친구 인사",prompt:"친구에게 반갑다고 말해 보세요.",    answer:"안녕! 반가워!",xp:8}],
      monitor:   [{id:"mon-c3",title:"오랜만",   prompt:"오랜만에 만난 친구에게 말해 보세요.",answer:"오랜만이야!",xp:8}],
      "book-kid":[{id:"mon-c4",title:"헤어질 때",prompt:"친구에게 잘 가라고 말해 보세요.",  answer:"잘 가! 내일 봐!",xp:8}],
    }, hint:{school:"오늘의 표현: 안녕하세요 / 감사합니다 / 죄송합니다", classroom:"오늘의 표현: 안녕! / 반가워! / 오랜만이야!"}},
  { day:"화요일", icon:"♦", themeColor:"#cc88ff", themeName:"수업의 날", desc:"수업 시간 표현을 연습해요!",
    todayMissions:{
      teacher:   [{id:"tue-t1",title:"질문하기",  prompt:"선생님께 질문이 있다고 말해 보세요.",  answer:"선생님, 질문 있어요.",xp:10},
                  {id:"tue-t2",title:"다시 설명", prompt:"다시 설명해 달라고 말해 보세요.",      answer:"선생님, 다시 설명해 주세요.",xp:12}],
      admin:     [{id:"tue-a1",title:"교과서 요청",prompt:"교과서가 없다고 말해 보세요.",        answer:"교과서가 없어요.",xp:10}],
      librarian: [{id:"tue-l1",title:"숙제 질문", prompt:"숙제가 무엇인지 물어보세요.",          answer:"숙제가 뭐예요?",xp:10}],
      nurse:     [{id:"tue-n1",title:"결석 설명", prompt:"아파서 결석했다고 말해 보세요.",       answer:"어제 아파서 결석했어요.",xp:12}],
      homeroom:  [{id:"tue-c1",title:"발표하기",  prompt:"발표해도 되는지 말해 보세요.",         answer:"선생님, 발표해도 될까요?",xp:12}],
      seatmate:  [{id:"tue-c2",title:"모를 때",   prompt:"잘 모르겠다고 말해 보세요.",           answer:"잘 모르겠어.",xp:8}],
      monitor:   [{id:"tue-c3",title:"답 확인",   prompt:"이 답이 맞는지 물어보세요.",           answer:"이거 맞아?",xp:8}],
      "book-kid":[{id:"tue-c4",title:"책 추천",   prompt:"재미있는 책을 추천해 달라고 말해 보세요.",answer:"재미있는 책 있어?",xp:8}],
    }, hint:{school:"오늘의 표현: 질문 있어요 / 다시 설명해 주세요", classroom:"오늘의 표현: 발표해도 될까요? / 잘 모르겠어."}},
  { day:"수요일", icon:"♣", themeColor:"#44ff88", themeName:"부탁·요청의 날", desc:"도움 요청 표현을 연습해요!",
    todayMissions:{
      teacher:   [{id:"wed-t1",title:"허락 받기",  prompt:"화장실에 가도 되는지 물어보세요.",  answer:"선생님, 화장실에 다녀와도 될까요?",xp:12},
                  {id:"wed-t2",title:"도움 요청",  prompt:"도와달라고 말해 보세요.",            answer:"선생님, 도와주세요.",xp:10}],
      admin:     [{id:"wed-a1",title:"물건 빌리기",prompt:"연필을 빌려달라고 말해 보세요.",    answer:"연필을 빌려주세요.",xp:10}],
      librarian: [{id:"wed-l1",title:"책 예약",    prompt:"책을 예약하고 싶다고 말해 보세요.", answer:"이 책을 예약하고 싶어요.",xp:12}],
      nurse:     [{id:"wed-n1",title:"약 요청",    prompt:"두통약을 달라고 말해 보세요.",       answer:"두통약을 주세요.",xp:10}],
      homeroom:  [{id:"wed-c1",title:"준비물 요청",prompt:"풀을 빌려달라고 말해 보세요.",       answer:"선생님, 풀을 빌려주세요.",xp:10}],
      seatmate:  [{id:"wed-c2",title:"지우개 빌리기",prompt:"지우개를 빌려달라고 말해 보세요.",answer:"지우개를 빌려줄 수 있어?",xp:8}],
      monitor:   [{id:"wed-c3",title:"같이 하기",  prompt:"같이 청소하자고 말해 보세요.",      answer:"청소 같이 할래?",xp:8}],
      "book-kid":[{id:"wed-c4",title:"책 빌리기",  prompt:"책을 읽어도 되는지 말해 보세요.",   answer:"이 책 읽어도 돼?",xp:8}],
    }, hint:{school:"오늘의 표현: ~해 주세요 / ~해도 될까요?", classroom:"오늘의 표현: ~해줄 수 있어? / 같이 ~할래?"}},
  { day:"목요일", icon:"♥", themeColor:"#ff88aa", themeName:"감정·상태의 날", desc:"기분과 몸 상태를 표현해요!",
    todayMissions:{
      teacher:   [{id:"thu-t1",title:"기쁠 때",  prompt:"기쁘다고 말해 보세요.",          answer:"선생님, 정말 기뻐요!",xp:10},
                  {id:"thu-t2",title:"걱정될 때",prompt:"걱정된다고 말해 보세요.",        answer:"선생님, 걱정돼요.",xp:10}],
      admin:     [{id:"thu-a1",title:"피곤할 때",prompt:"피곤하다고 말해 보세요.",        answer:"오늘 많이 피곤해요.",xp:10}],
      librarian: [{id:"thu-l1",title:"심심할 때",prompt:"심심하다고 말해 보세요.",        answer:"심심해요.",xp:10}],
      nurse:     [{id:"thu-n1",title:"배 아플 때",prompt:"배가 아프다고 말해 보세요.",   answer:"배가 아파요.",xp:10},
                  {id:"thu-n2",title:"머리 아플때",prompt:"머리가 아프다고 말해 보세요.",answer:"머리가 아파요.",xp:10}],
      homeroom:  [{id:"thu-c1",title:"행복할 때",prompt:"행복하다고 말해 보세요.",       answer:"오늘 너무 행복해!",xp:8}],
      seatmate:  [{id:"thu-c2",title:"슬플 때",  prompt:"슬프다고 말해 보세요.",         answer:"나 오늘 슬퍼.",xp:8}],
      monitor:   [{id:"thu-c3",title:"힘들 때",  prompt:"힘들다고 말해 보세요.",         answer:"오늘 너무 힘들어.",xp:8}],
      "book-kid":[{id:"thu-c4",title:"재미있을 때",prompt:"재미있다고 말해 보세요.",     answer:"이 책 너무 재미있어!",xp:8}],
    }, hint:{school:"오늘의 표현: ~아/어요 (감정·상태)", classroom:"오늘의 표현: 나 오늘 ~해 (친구 감정)"}},
  { day:"금요일", icon:"★", themeColor:"#ffd700", themeName:"주말·계획의 날", desc:"주말 계획 표현을 연습해요!",
    todayMissions:{
      teacher:   [{id:"fri-t1",title:"주말 계획",prompt:"주말에 뭐 할 건지 말해 보세요.",  answer:"주말에 ___을 할 거예요.",xp:10}],
      admin:     [{id:"fri-a1",title:"일찍 가기",prompt:"일찍 가도 되는지 물어보세요.",  answer:"오늘 일찍 가도 될까요?",xp:12}],
      librarian: [{id:"fri-l1",title:"책 반납",  prompt:"책을 반납하고 싶다고 말해 보세요.",answer:"이 책을 반납하고 싶어요.",xp:10}],
      nurse:     [{id:"fri-n1",title:"조퇴 요청",prompt:"집에 가고 싶다고 말해 보세요.", answer:"집에 가고 싶어요.",xp:10}],
      homeroom:  [{id:"fri-c1",title:"약속 잡기",prompt:"내일 같이 놀자고 말해 보세요.", answer:"내일 같이 놀래?",xp:10}],
      seatmate:  [{id:"fri-c2",title:"시간 있어?",prompt:"주말에 시간 있는지 물어보세요.",answer:"주말에 시간 있어?",xp:8}],
      monitor:   [{id:"fri-c3",title:"계획 공유",prompt:"주말 계획을 말해 보세요.",      answer:"나 주말에 ___할 거야.",xp:8}],
      "book-kid":[{id:"fri-c4",title:"영화 보기",prompt:"영화 보러 가자고 말해 보세요.", answer:"영화 보러 갈래?",xp:8}],
    }, hint:{school:"오늘의 표현: ~할 거예요 / ~해도 될까요?", classroom:"오늘의 표현: 같이 ~할래? / 시간 있어?"}},
  { day:"토요일", icon:"♠", themeColor:"#ff8844", themeName:"복습·칭찬의 날", desc:"이번 주 표현을 복습해요!",
    todayMissions:{
      teacher:   [{id:"sat-t1",title:"칭찬받기",  prompt:"잘 했다고 말해 보세요.",            answer:"선생님, 저 잘 했나요?",xp:10},
                  {id:"sat-t2",title:"복습 요청", prompt:"다시 배우고 싶다고 말해 보세요.",   answer:"선생님, 다시 배우고 싶어요.",xp:12}],
      admin:     [{id:"sat-a1",title:"감사 표현", prompt:"도와줘서 감사하다고 말해 보세요.",   answer:"도와주셔서 감사합니다.",xp:12}],
      librarian: [{id:"sat-l1",title:"책 추천 요청",prompt:"좋은 책을 추천해 달라고 말해 보세요.",answer:"좋은 책을 추천해 주세요.",xp:10}],
      nurse:     [{id:"sat-n1",title:"다 나았어요",prompt:"이제 다 나았다고 말해 보세요.",     answer:"이제 다 나았어요. 감사합니다.",xp:10}],
      homeroom:  [{id:"sat-c1",title:"친구 칭찬", prompt:"친구를 칭찬해 보세요.",              answer:"너 정말 잘했어!",xp:10}],
      seatmate:  [{id:"sat-c2",title:"응원하기",  prompt:"친구를 응원해 보세요.",              answer:"화이팅! 잘 할 수 있어!",xp:8}],
      monitor:   [{id:"sat-c3",title:"고마워",    prompt:"친구에게 고맙다고 말해 보세요.",    answer:"고마워, 덕분에 잘 됐어.",xp:8}],
      "book-kid":[{id:"sat-c4",title:"책 소감",   prompt:"책이 재미있었다고 말해 보세요.",    answer:"이 책 정말 재미있었어!",xp:8}],
    }, hint:{school:"오늘의 표현: 감사합니다 / 다시 배우고 싶어요", classroom:"오늘의 표현: 잘했어! / 화이팅!"}},
];

// ═══════════════════════════════════════════════════════════════════════════
// 유틸
// ═══════════════════════════════════════════════════════════════════════════
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const getTodayKey = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const getTodayTheme = () => DAILY_THEMES[new Date().getDay()];
const getTomorrowTheme = () => DAILY_THEMES[(new Date().getDay()+1)%7];
function buildDailyNpcs(baseNpcs, theme, mapMode) {
  return baseNpcs.map(npc => {
    const todayMs = theme.todayMissions[npc.id] || npc.missions;
    const hintLine = mapMode==="school" ? theme.hint.school : theme.hint.classroom;
    return { ...npc, missions:todayMs, hint:[`${theme.icon} [${theme.day}] ${theme.themeName}`, hintLine, ...npc.hint.slice(1)], greeting:`${theme.icon} ${npc.greeting}` };
  });
}
function normalize(t){ return (t||"").replace(/[\s?!.,。！？~\-]/g,"").toLowerCase(); }
function isCorrect(user,correct){ const u=normalize(user),c=normalize(correct); return u===c||u.includes(c)||c.includes(u); }
function getLevelInfo(xp){ return {level:Math.floor(xp/30)+1, progress:((xp%30)/30)*100}; }
function speak(text){ if(!window.speechSynthesis)return; const u=new SpeechSynthesisUtterance(text); u.lang="ko-KR"; u.rate=0.9; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); }
const LS_KEY = "school-rpg-completed-";
const LS_XP  = "school-rpg-xp";
function loadTodayCompleted(){ try{ const r=localStorage.getItem(LS_KEY+getTodayKey()); return r?JSON.parse(r):[]; }catch{return[];} }
function saveTodayCompleted(l){ try{ localStorage.setItem(LS_KEY+getTodayKey(),JSON.stringify(l)); }catch{} }
function loadTotalXp(){ try{ return parseInt(localStorage.getItem(LS_XP)||"0",10)||0; }catch{return 0;} }
function saveTotalXp(v){ try{ localStorage.setItem(LS_XP,String(v)); }catch{} }

// ═══════════════════════════════════════════════════════════════════════════
// Canvas 렌더러
// ═══════════════════════════════════════════════════════════════════════════
// 타일 색상
const TILE_COLORS = {
  0: { base:"#4a3c28", alt:"#3e3220", edge:"#2a1e10", top:"#5a4c38" },  // 복도바닥
  1: { base:"#1a1855", alt:"#14125a", edge:"#000044", top:"#2a28a0" },   // 벽
  2: { base:"#4a2810", alt:"#6b3818", edge:"#8b4513", knob:"#d4a017" }, // 문
  3: { base:"#2a2870", alt:"#1e1c68", edge:"#0a0880", top:"#3a38c0" },  // 기둥
  4: { base:"#5a1060", alt:"#6a2070", edge:"#3a0040", top:"#7a3090" },  // 카펫
  5: { base:"#3a3220", alt:"#2e2818", edge:"#1e1810", top:"#4a4030" },  // 체크바닥
};

function drawTile(ctx, tx, ty, type, camX, camY) {
  const sx = tx*TS - camX, sy = ty*TS - camY;
  if(sx < -TS || sx > CAM_W || sy < -TS || sy > CAM_H) return;
  const c = TILE_COLORS[type] || TILE_COLORS[0];
  if(type===1) {
    // 벽
    ctx.fillStyle = c.base; ctx.fillRect(sx,sy,TS,TS);
    ctx.fillStyle = c.alt;  ctx.fillRect(sx+1,sy+1,TS-2,TS-2);
    ctx.fillStyle = c.top;  ctx.fillRect(sx,sy,TS,4);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(sx,sy+10,TS,1);
    if(ty%2===0) ctx.fillRect(sx+10,sy+1,1,9); else ctx.fillRect(sx+5,sy+11,1,9);
  } else if(type===2) {
    // 문
    ctx.fillStyle = c.base; ctx.fillRect(sx,sy,TS,TS);
    ctx.fillStyle = c.alt;  ctx.fillRect(sx+2,sy+1,TS-4,TS-1);
    ctx.fillStyle = c.edge; ctx.fillRect(sx+2,sy+1,TS-4,2);
    ctx.fillStyle = c.edge; ctx.fillRect(sx+2,sy+1,2,TS-1);
    ctx.fillStyle = c.edge; ctx.fillRect(sx+TS-4,sy+1,2,TS-1);
    ctx.fillStyle = c.knob; ctx.fillRect(sx+TS-6,sy+TS/2-1,3,3);
    // 반짝임
    ctx.fillStyle="rgba(255,255,100,0.25)"; ctx.fillRect(sx+4,sy+3,TS-10,3);
  } else if(type===3) {
    // 기둥
    ctx.fillStyle = c.base; ctx.fillRect(sx,sy,TS,TS);
    ctx.fillStyle = c.alt;  ctx.fillRect(sx+4,sy,TS-8,TS);
    ctx.fillStyle = c.top;  ctx.fillRect(sx+4,sy,TS-8,4);
    ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.fillRect(sx+TS-5,sy,3,TS);
    ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.fillRect(sx+4,sy,2,TS);
  } else if(type===4) {
    // 카펫
    ctx.fillStyle = (tx+ty)%2===0 ? c.base : c.alt; ctx.fillRect(sx,sy,TS,TS);
    ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fillRect(sx+1,sy+1,TS-2,TS-2);
    ctx.strokeStyle = c.top; ctx.lineWidth=0.5;
    ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
  } else if(type===5) {
    // 체크바닥
    const dark = (tx+ty)%2===0;
    ctx.fillStyle = dark ? c.alt : c.base; ctx.fillRect(sx,sy,TS,TS);
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(sx,sy,TS,1); ctx.fillRect(sx,sy,1,TS);
  } else if(type===6) {
    // 잔디
    ctx.fillStyle = (tx+ty)%2===0 ? "#1a3a1a" : "#143014"; ctx.fillRect(sx,sy,TS,TS);
    ctx.fillStyle = "#0a2a0a"; ctx.fillRect(sx,sy,TS,1); ctx.fillRect(sx,sy,1,TS);
    // 잔디 점
    if((tx*3+ty*7)%5===0){ ctx.fillStyle="#2a5a2a"; ctx.fillRect(sx+4,sy+6,2,4); }
    if((tx*7+ty*3)%7===0){ ctx.fillStyle="#2a5a2a"; ctx.fillRect(sx+12,sy+4,2,5); }
  } else if(type===7) {
    // 나무
    ctx.fillStyle = "#1a3a1a"; ctx.fillRect(sx,sy,TS,TS);
    ctx.fillStyle = "#5a3010"; ctx.fillRect(sx+7,sy+10,6,10);
    ctx.fillStyle = "#1a5a1a"; ctx.fillRect(sx+2,sy+2,16,12);
    ctx.fillStyle = "#2a7a2a"; ctx.fillRect(sx+4,sy+4,12,8);
    ctx.fillStyle = "#44aa44"; ctx.fillRect(sx+7,sy+5,6,5);
  } else if(type===9) {
    // 계단
    ctx.fillStyle = "#3a2a1a"; ctx.fillRect(sx,sy,TS,TS);
    // 계단 단 표시
    for(let i=0;i<4;i++){
      ctx.fillStyle = i%2===0?"#5a4a3a":"#4a3a2a";
      ctx.fillRect(sx+i*4,sy+i*4,TS-i*4,TS-i*4);
    }
    ctx.fillStyle = "#8a6a4a"; ctx.fillRect(sx,sy,TS,2);
    // 화살표
    ctx.fillStyle = "#ffd700"; ctx.font=`${TS-4}px serif`; ctx.textAlign="center";
    ctx.fillText("↕", sx+TS/2, sy+TS-2);
    ctx.textAlign="left";
  } else {
    // 기본 바닥
    ctx.fillStyle = (tx+ty)%2===0 ? c.base : c.alt; ctx.fillRect(sx,sy,TS,TS);
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(sx,sy,TS,1); ctx.fillRect(sx,sy,1,TS);
  }
}

// 도트 캐릭터 (YS2 스타일 탑다운)
function drawDotChar(ctx, wx, wy, color, bodyColor, fr, facing, camX, camY, isPlayer=false) {
  const sx = wx - camX, sy = wy - camY;
  if(sx < -30 || sx > CAM_W+30 || sy < -40 || sy > CAM_H+40) return;
  const bob = isPlayer ? Math.sin(fr*0.18)*1.5 : Math.sin(fr*0.12)*1;
  const legL = Math.sin(fr*0.22)*2.5;

  // 그림자
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(sx-6, sy+12, 14, 4);

  // 다리
  ctx.fillStyle = bodyColor;
  ctx.fillRect(sx-4, sy+4+bob, 4, 6+legL);
  ctx.fillRect(sx+1, sy+4+bob, 4, 6-legL);

  // 몸통
  ctx.fillStyle = color;
  ctx.fillRect(sx-5, sy-6+bob, 12, 11);
  // 몸통 하이라이트
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(sx-5, sy-6+bob, 12, 3);

  // 머리
  ctx.fillStyle = "#ffcc99";
  ctx.fillRect(sx-4, sy-16+bob, 10, 10);
  // 머리 외곽
  ctx.fillStyle = "#cc9966";
  ctx.fillRect(sx-4, sy-16+bob, 10, 1);
  ctx.fillRect(sx-4, sy-16+bob, 1, 10);
  ctx.fillRect(sx+5, sy-16+bob, 1, 10);

  // 얼굴 (방향별)
  ctx.fillStyle = "#2a1a0a";
  if(facing==="down"||facing===undefined){
    ctx.fillRect(sx-2,sy-12+bob,3,3);
    ctx.fillRect(sx+2,sy-12+bob,3,3);
    ctx.fillRect(sx-1,sy-8+bob,4,1);
  } else if(facing==="up"){
    ctx.fillRect(sx-2,sy-14+bob,3,2);
    ctx.fillRect(sx+2,sy-14+bob,3,2);
  } else if(facing==="left"){
    ctx.fillRect(sx-3,sy-12+bob,3,3);
    ctx.fillRect(sx-2,sy-8+bob,3,1);
  } else {
    ctx.fillRect(sx+2,sy-12+bob,3,3);
    ctx.fillRect(sx+1,sy-8+bob,3,1);
  }

  // 발
  ctx.fillStyle = "#111";
  ctx.fillRect(sx-5, sy+10+bob+legL, 5, 3);
  ctx.fillRect(sx+1, sy+10+bob-legL, 5, 3);

  // 플레이어 표시
  if(isPlayer) {
    ctx.fillStyle = "rgba(255,255,0,0.6)";
    ctx.fillRect(sx-2, sy-20+bob, 6, 3);
  }
}

// NPC 그리기 (이름 + 말풍선 포함)
function drawNpc(ctx, npc, fr, isNear, isDone, camX, camY) {
  const wx = npc.tx*TS+TS/2, wy = npc.ty*TS+TS/2;
  drawDotChar(ctx, wx, wy, npc.color, npc.bodyColor, fr, npc.facing||"down", camX, camY);
  const sx=wx-camX, sy=wy-camY;
  if(sx<-30||sx>CAM_W+30||sy<-40||sy>CAM_H+40) return;

  // 이름표
  ctx.fillStyle = "rgba(0,0,100,0.88)";
  ctx.fillRect(sx-18, sy-28, 38, 12);
  ctx.strokeStyle = "#00ffff"; ctx.lineWidth=1;
  ctx.strokeRect(sx-18, sy-28, 38, 12);
  ctx.fillStyle = "#ffff00";
  ctx.font = "bold 9px 'Noto Sans KR',sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(npc.name.slice(0,4), sx+1, sy-20);

  // 완료 표시
  if(isDone) {
    ctx.fillStyle = "#00ff88"; ctx.font="bold 11px serif";
    ctx.fillText("✓", sx+1, sy-32);
  }

  // 느낌표 (근처)
  if(isNear && !isDone) {
    ctx.fillStyle = npc.color+"cc"; ctx.fillRect(sx-5,sy-44,12,14);
    ctx.strokeStyle=npc.color; ctx.lineWidth=1.5; ctx.strokeRect(sx-5,sy-44,12,14);
    ctx.fillStyle="#fff"; ctx.font="bold 11px sans-serif";
    ctx.fillText("!", sx+1, sy-34);
  }
  ctx.textAlign = "left";
}

// 포탈 그리기
function drawPortal(ctx, portal, fr, camX, camY) {
  const sx=portal.tx*TS-camX, sy=portal.ty*TS-camY;
  const pulse=Math.sin(fr*0.08)*0.4+0.6;
  ctx.fillStyle=`rgba(68,255,136,${pulse*0.2})`; ctx.fillRect(sx,sy,TS*2,TS);
  ctx.strokeStyle=`rgba(68,255,136,${pulse})`; ctx.lineWidth=2; ctx.strokeRect(sx,sy,TS*2,TS);
  ctx.fillStyle=`rgba(68,255,136,${pulse})`;
  ctx.font="bold 9px 'Noto Sans KR',sans-serif"; ctx.textAlign="center";
  ctx.fillText(portal.label, sx+TS, sy+TS/2+4);
  ctx.textAlign="left";
}

// 조명 효과
function drawLight(ctx, wx, wy, camX, camY) {
  const sx=wx-camX, sy=wy-camY;
  const g = ctx.createRadialGradient(sx,sy,10, sx,sy,180);
  g.addColorStop(0,"rgba(0,0,0,0)");
  g.addColorStop(1,"rgba(0,0,30,0.65)");
  ctx.fillStyle=g; ctx.fillRect(0,0,CAM_W,CAM_H);
}

// ═══════════════════════════════════════════════════════════════════════════
// Claude API
// ═══════════════════════════════════════════════════════════════════════════
async function callClaude(npc, mapMode, message) {
  const sys=`당신은 한국 학교의 ${npc.name}입니다. 한국어를 배우는 외국인 학생과 대화합니다. 1~2문장의 간결한 한국어로 응답하세요. 필요시 러시아어 힌트를 괄호에 넣으세요. 위치: ${mapMode==="school"?"복도":"교실"}`;
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:sys,messages:[{role:"user",content:message}]})});
  if(!res.ok) throw new Error();
  const d=await res.json();
  return d.content?.map(c=>c.text||"").join("")||"";
}
function localReply(npc,msg){
  if(msg.includes("선생님")) return "좋아요! 공손한 표현이 자연스러워요.";
  if(msg.includes("같이")||msg.includes("빌려")) return "완벽해요!";
  if(msg.includes("아파")||msg.includes("아프")) return "잘 말했어요. 보건실에 가봐요!";
  return "천천히 다시 말해볼까요?";
}

// ═══════════════════════════════════════════════════════════════════════════
// 스토리 데이터 (인라인 — storyData.js 와 동일)
// ═══════════════════════════════════════════════════════════════════════════
const MAIN_QUEST = {
  id:"main", title:"새로운 시작", icon:"★",
  chapters:[
    { id:"ch1", title:"첫날 — 첫 번째 아침", unlockCondition:null, nodes:[
      {id:"ch1-intro",speaker:"내레이터",portrait:"📖",bg:"러시아 블라디보스토크에서 한국 인천으로 이사한 지 이틀째. 오늘은 드디어 새 학교 첫날이다.",text:"가방을 메고 현관에 서있으니 심장이 두근거렸다. '한국어를 잘 못하는데... 괜찮을까?'",next:"ch1-mom"},
      {id:"ch1-mom",speaker:"엄마",portrait:"👩",text:"알렉스, 늦었어. 어서 가! 모르는 게 있으면 선생님한테 물어봐. (Алекс, иди уже! Если что непонятно — спроси учителя.)",next:"ch1-gate"},
      {id:"ch1-gate",speaker:"내레이터",portrait:"📖",bg:"한서중학교 정문. 학생들이 우르르 몰려들어간다.",text:"수십 명의 아이들이 재잘거리며 지나간다. 아무도 나를 모른다. 나도 아무것도 모른다.",next:"ch1-teacher-meet"},
      {id:"ch1-teacher-meet",speaker:"선생님",portrait:"👩‍🏫",text:"어, 너가 전학 온 학생이구나! 반가워. 나는 3학년 1반 담임 김선영 선생님이야. 한국어 할 줄 알아?",choices:[{label:"조금요... (고개를 숙인다)",next:"ch1-choice-little",addKarma:1},{label:"못 해요... (솔직하게)",next:"ch1-choice-none",addKarma:0},{label:"네! (자신있게 웃는다)",next:"ch1-choice-yes",addKarma:2}]},
      {id:"ch1-choice-little",speaker:"선생님",portrait:"👩‍🏫",text:"조금이라도 할 줄 알면 충분해! 천천히 배우면 돼. 용기 있게 말해줘서 고마워.",next:"ch1-mission"},
      {id:"ch1-choice-none",speaker:"선생님",portrait:"👩‍🏫",text:"괜찮아, 걱정하지 마. 우리가 같이 도와줄게. 솔직하게 말하는 게 오히려 용기 있는 거야.",next:"ch1-mission"},
      {id:"ch1-choice-yes",speaker:"선생님",portrait:"👩‍🏫",text:"오, 자신감이 넘치는구나! 좋아, 그럼 먼저 인사부터 해볼까?",next:"ch1-mission"},
      {id:"ch1-mission",speaker:"선생님",portrait:"👩‍🏫",text:"자, 선생님한테 인사해볼래? '선생님, 안녕하세요!'라고 해봐.",mission:"ch1-greeting",next:"ch1-after-mission"},
      {id:"ch1-after-mission",speaker:"선생님",portrait:"👩‍🏫",text:"잘했어! 이제 교실로 가자. 친구들한테도 소개해줄게.",next:"ch1-class-intro"},
      {id:"ch1-class-intro",speaker:"내레이터",portrait:"📖",bg:"교실 문이 열리자 30명의 눈이 일제히 나를 향했다.",text:"선생님이 칠판에 내 이름을 한글로 써주셨다: '알렉스'. 조금 어색한 한글 이름이었지만, 내 이름이었다.",next:"ch1-classmate"},
      {id:"ch1-classmate",speaker:"짝꿍 (민준)",portrait:"👦",text:"야, 나 옆자리야. 나는 민준이야. 러시아 어디서 왔어? 블라디보스토크? 거기 되게 춥다며?",choices:[{label:"응, 많이 추워. 한국은 따뜻하네!",next:"ch1-friend-warm",addKarma:2},{label:"(어떻게 대답할지 몰라 웃기만 한다)",next:"ch1-friend-shy",addKarma:1}]},
      {id:"ch1-friend-warm",speaker:"짝꿍 (민준)",portrait:"👦",text:"ㅋㅋㅋ 한국어 잘하네! 앞으로 모르는 거 있으면 나한테 물어봐. 내가 다 알려줄게!",next:"ch1-end",flag:"민준_친해짐"},
      {id:"ch1-friend-shy",speaker:"짝꿍 (민준)",portrait:"👦",text:"어... 괜찮아? 뭔가 물어보고 싶으면 천천히 말해도 돼. 나 기다릴 수 있어.",next:"ch1-end",flag:"민준_배려"},
      {id:"ch1-end",speaker:"내레이터",portrait:"📖",text:"첫날이 끝났다. 이름도 기억 못하는 사람들, 알아듣지 못한 수업들. 하지만 오늘 한 가지는 알았다—여기에도 좋은 사람들이 있다는 것.",next:null,effect:"ch1-complete"},
    ]},
    { id:"ch2", title:"사라진 교과서", unlockCondition:"ch1-complete", nodes:[
      {id:"ch2-intro",speaker:"내레이터",portrait:"📖",bg:"전학 온 지 사흘째. 수학 시간 직전이다.",text:"가방을 뒤졌는데—수학 교과서가 없다! 심장이 쿵 내려앉았다.",next:"ch2-panic"},
      {id:"ch2-panic",speaker:"알렉스 (내면의 소리)",portrait:"💭",text:"'어떻게 말하지? 교과서 없다고 선생님한테 말해야 하는데... 한국어로 어떻게 하지?'",choices:[{label:"선생님한테 직접 말한다",next:"ch2-tell-teacher",addKarma:2},{label:"민준이한테 먼저 물어본다",next:"ch2-ask-minjun",addKarma:1},{label:"그냥 모른 척한다",next:"ch2-ignore",addKarma:-1}]},
      {id:"ch2-tell-teacher",speaker:"내레이터",portrait:"📖",text:"용기를 내서 선생님 앞으로 걸어갔다.",next:"ch2-teacher-mission"},
      {id:"ch2-teacher-mission",speaker:"선생님",portrait:"👩‍🏫",text:"알렉스, 무슨 일이야? 말해봐.",mission:"ch2-no-book",next:"ch2-teacher-ok"},
      {id:"ch2-teacher-ok",speaker:"선생님",portrait:"👩‍🏫",text:"그렇구나. 괜찮아. 오늘은 민준이랑 같이 봐. 내일부터는 전날 밤에 꼭 확인해.",next:"ch2-relief",flag:"선생님_신뢰+1"},
      {id:"ch2-ask-minjun",speaker:"짝꿍 (민준)",portrait:"👦",text:"'교과서 없어'라고 해! '선생님, 교과서를 집에 두고 왔어요'라고 말하면 돼.",next:"ch2-teacher-mission"},
      {id:"ch2-ignore",speaker:"내레이터",portrait:"📖",text:"수업이 시작됐다. 선생님이 교과서를 펴라고 했다. 나는 빈 책상 위를 바라보며 얼어붙었다.",next:"ch2-caught"},
      {id:"ch2-caught",speaker:"선생님",portrait:"👩‍🏫",text:"알렉스, 교과서 왜 안 펼쳐? 없어? 왜 미리 말 안 했어? 모르면 꼭 말해줘야 해.",next:"ch2-relief",addKarma:-1},
      {id:"ch2-relief",speaker:"내레이터",portrait:"📖",text:"위기를 넘겼다. 모르는 게 있을 때 말하는 것—그게 첫 번째 한국어 실력이라는 걸 알았다.",next:"ch2-evening"},
      {id:"ch2-evening",speaker:"알렉스 (일기)",portrait:"✏️",bg:"그날 밤, 알렉스는 작은 노트에 한국어로 일기를 썼다.",text:"'오늘 교과서가 없었다. 선생님한테 말했다. 무서웠다. 하지만 괜찮았다.' — 틀린 맞춤법이 가득하지만, 알렉스의 첫 번째 한국어 일기였다.",next:null,effect:"ch2-complete"},
    ]},
    { id:"ch3", title:"도서관의 비밀", unlockCondition:"ch2-complete", nodes:[
      {id:"ch3-intro",speaker:"내레이터",portrait:"📖",bg:"점심시간. 알렉스는 혼자 도서관에 들어갔다.",text:"책장 사이로 낯익은 얼굴이 보였다—역시 혼자인 아이. 이름은 지아.",next:"ch3-jia-meet"},
      {id:"ch3-jia-meet",speaker:"지아 (책 친구)",portrait:"📚",text:"...혹시 러시아 책 좋아해? 여기 도스토옙스키 한국어판 있어. (작은 목소리로)",choices:[{label:"응! 좋아해. 어떤 책이야?",next:"ch3-bond-start",addKarma:2},{label:"(모르는 단어가 많아 그냥 웃는다)",next:"ch3-bond-shy",addKarma:1}]},
      {id:"ch3-bond-start",speaker:"지아 (책 친구)",portrait:"📚",text:"오, 진짜? 나도 러시아 문학 좋아해! '죄와 벌' 읽어봤어?",next:"ch3-library-mission",flag:"지아_친해짐"},
      {id:"ch3-bond-shy",speaker:"지아 (책 친구)",portrait:"📚",text:"...괜찮아. 같이 책 읽을래? 말 안 해도 돼.",next:"ch3-library-mission",flag:"지아_공감"},
      {id:"ch3-library-mission",speaker:"사서 선생님",portrait:"📖",text:"학생, 책 찾니? 원하는 책이 있으면 말해봐.",mission:"ch3-find-book",next:"ch3-after-mission"},
      {id:"ch3-after-mission",speaker:"사서 선생님",portrait:"📖",text:"잘 말했어! 도서관은 언제든지 와도 돼.",next:"ch3-jia-promise"},
      {id:"ch3-jia-promise",speaker:"지아 (책 친구)",portrait:"📚",text:"나 매일 여기 와. 혼자면... 같이 와도 돼.",choices:[{label:"고마워, 나도 매일 올게!",next:"ch3-end-good",addKarma:2,flag:"지아_약속"},{label:"응, 생각해볼게.",next:"ch3-end-normal",addKarma:1}]},
      {id:"ch3-end-good",speaker:"내레이터",portrait:"📖",text:"그날부터 알렉스에게 점심시간이 기다려지는 시간이 됐다. 말이 통하지 않아도 같은 책을 좋아한다면—친구가 될 수 있었다.",next:null,effect:"ch3-complete"},
      {id:"ch3-end-normal",speaker:"내레이터",portrait:"📖",text:"지아는 고개를 끄덕이고 다시 책으로 눈을 돌렸다. 알렉스는 그 조용한 배려가 마음에 들었다.",next:null,effect:"ch3-complete"},
    ]},
    { id:"ch4", title:"체육대회의 날", unlockCondition:"ch3-complete", nodes:[
      {id:"ch4-intro",speaker:"내레이터",portrait:"📖",bg:"전학 온 지 한 달. 오늘은 학교 체육대회 날이다.",text:"운동장에 온 학교가 모였다. 반마다 응원가를 외치고, 깃발을 흔들었다.",next:"ch4-team"},
      {id:"ch4-team",speaker:"반장 (수호)",portrait:"🧒",text:"알렉스! 우리 반 계주 멤버 한 명이 아파서 빠졌어. 네가 뛰어줄 수 있어?",choices:[{label:"응, 해볼게!",next:"ch4-yes-run",addKarma:2,flag:"체육대회_참가"},{label:"나 잘 못 달리는데...",next:"ch4-hesitate",addKarma:1},{label:"아니, 괜찮아.",next:"ch4-no-run",addKarma:0}]},
      {id:"ch4-yes-run",speaker:"반장 (수호)",portrait:"🧒",text:"오예!! 알렉스 최고! 같이 이겨보자!",next:"ch4-cheer-mission"},
      {id:"ch4-hesitate",speaker:"짝꿍 (민준)",portrait:"👦",text:"괜찮아! 잘 달리는 게 중요한 게 아니야. 같이 하는 게 중요한 거지!",next:"ch4-yes-run",addKarma:1},
      {id:"ch4-no-run",speaker:"내레이터",portrait:"📖",text:"수호는 아쉬운 표정을 지었다. 알렉스는 응원석에서 혼자 팀을 바라봤다.",next:"ch4-alone-cheer"},
      {id:"ch4-cheer-mission",speaker:"반장 (수호)",portrait:"🧒",text:"출발 전에 다같이 응원해! '우리 반 파이팅!'이라고 크게 외쳐봐!",mission:"ch4-cheering",next:"ch4-race"},
      {id:"ch4-race",speaker:"내레이터",portrait:"📖",bg:"계주가 시작됐다. 알렉스는 바통을 받아 힘껏 달렸다.",text:"결승선을 통과하자 반 친구들이 환호했다. 처음으로 내 이름이 운동장에 울려 퍼졌다. '알렉스! 알렉스!'",next:"ch4-after-race"},
      {id:"ch4-alone-cheer",speaker:"내레이터",portrait:"📖",text:"응원석에서 반 친구들을 보며 알렉스는 생각했다. '다음엔 같이 뛰어야지.'",next:"ch4-after-race"},
      {id:"ch4-after-race",speaker:"담임 선생님",portrait:"🧑‍🏫",text:"알렉스, 오늘 잘했어. 어때, 학교 생활 좀 익숙해져가?",choices:[{label:"네, 조금씩 좋아지고 있어요!",next:"ch4-good-answer",addKarma:2},{label:"아직 어려운 것도 많아요.",next:"ch4-honest-answer",addKarma:1},{label:"(고개만 끄덕인다)",next:"ch4-silent-answer",addKarma:0}]},
      {id:"ch4-good-answer",speaker:"담임 선생님",portrait:"🧑‍🏫",text:"그렇지! 그 마음가짐이 중요해. 모르는 게 있으면 언제든지 물어봐.",next:"ch4-end"},
      {id:"ch4-honest-answer",speaker:"담임 선생님",portrait:"🧑‍🏫",text:"솔직하게 말해줘서 고마워. 어려운 게 있으면 선생님한테 꼭 말해줘. 혼자 참으면 안 돼.",next:"ch4-end",flag:"선생님_신뢰+2"},
      {id:"ch4-silent-answer",speaker:"담임 선생님",portrait:"🧑‍🏫",text:"...그렇구나. 힘들면 말해. 항상 여기 있어.",next:"ch4-end"},
      {id:"ch4-end",speaker:"알렉스 (일기)",portrait:"✏️",bg:"그날 밤 일기.",text:"'오늘 내 이름이 운동장에서 들렸다. 한국 친구들이 외쳐줬다. 조금 울었다. 좋은 울음이었다.'",next:null,effect:"ch4-complete"},
    ]},
    { id:"ch5", title:"봄 소풍 그리고 편지", unlockCondition:"ch4-complete", nodes:[
      {id:"ch5-intro",speaker:"내레이터",portrait:"📖",bg:"3월이 끝나가는 금요일. 봄 소풍 마지막 날.",text:"러시아 엄마한테서 편지가 왔다. '어때? 잘 지내고 있어?' 알렉스는 답장을 쓰려다 멈췄다.",next:"ch5-friends-gather"},
      {id:"ch5-friends-gather",speaker:"짝꿍 (민준)",portrait:"👦",text:"알렉스, 뭐 해? 우리 다같이 사진 찍으러 가자! 빨리!",next:"ch5-photo"},
      {id:"ch5-photo",speaker:"내레이터",portrait:"📖",bg:"봄꽃이 가득 핀 학교 뒤편. 반 친구들이 모였다.",text:"누군가 알렉스의 팔을 잡아당겼다. '너도 가운데 서!' 처음으로 단체 사진 한가운데에 서게 됐다.",next:"ch5-final-mission"},
      {id:"ch5-final-mission",speaker:"담임 선생님",portrait:"🧑‍🏫",text:"알렉스, 마지막으로 한 마디 해볼래? 한국어로!",mission:"ch5-speech",next:"ch5-letter-write"},
      {id:"ch5-letter-write",speaker:"알렉스 (편지)",portrait:"✏️",bg:"그날 밤, 알렉스는 엄마한테 답장을 썼다.",text:"'엄마, 나 친구 생겼어. 한국어도 조금 늘었어. 아직 어렵지만—이 학교 좋아. 나 괜찮아.'",next:"ch5-ending"},
      {id:"ch5-ending",speaker:"내레이터",portrait:"📖",text:"새로운 시작은, 끝이 아니었다. 알렉스의 한국 이야기는 이제 막 시작됐다.",next:null,effect:"main-ending",ending:"good"},
    ]},
  ],
  missions:{
    "ch1-greeting": {prompt:"선생님께 인사해 보세요.",answer:"선생님, 안녕하세요!",xp:15},
    "ch2-no-book":  {prompt:"교과서를 집에 두고 왔다고 말하세요.",answer:"선생님, 교과서를 집에 두고 왔어요.",xp:15},
    "ch3-find-book":{prompt:"책을 찾고 싶다고 말하세요.",answer:"책을 찾고 싶어요.",xp:12},
    "ch4-cheering": {prompt:"'우리 반 파이팅!'이라고 외쳐보세요.",answer:"우리 반 파이팅!",xp:10},
    "ch5-speech":   {prompt:"친구들에게 고맙다고 말해보세요.",answer:"모두 고마워요!",xp:20},
  },
};

const SIDE_STORIES = {
  teacher:{npcId:"teacher",title:"선생님의 비밀 노트",icon:"👩‍🏫",episodes:[
    {id:"t-ep1",title:"러시아어를 아시나요?",unlockCondition:null,nodes:[
      {id:"t-ep1-1",speaker:"선생님",portrait:"👩‍🏫",text:"알렉스, 잠깐. 사실 선생님도 러시아어 조금 해. 대학교 때 배웠거든.",next:"t-ep1-2"},
      {id:"t-ep1-2",speaker:"알렉스 (내면의 소리)",portrait:"💭",text:"'선생님이 러시아어를?!' 갑자기 심장이 두근거렸다.",next:"t-ep1-3"},
      {id:"t-ep1-3",speaker:"선생님",portrait:"👩‍🏫",text:"Как дела? (잘 지내?) 이 정도밖에 못 하지만... 네가 힘들 때 조금이라도 도움이 되고 싶어서.",choices:[{label:"감사해요, 선생님! (한국어로)",next:"t-ep1-good",addKarma:2},{label:"Спасибо! (러시아어로)",next:"t-ep1-ru",addKarma:2}]},
      {id:"t-ep1-good",speaker:"선생님",portrait:"👩‍🏫",text:"어, 한국어로 감사하다고 했어? 잘 하네! 앞으로도 모르는 거 있으면 꼭 말해.",next:"t-ep1-end"},
      {id:"t-ep1-ru",speaker:"선생님",portrait:"👩‍🏫",text:"Пожалуйста! 오, 내 발음 맞지? ㅎㅎ. 앞으로 같이 공부하자.",next:"t-ep1-end"},
      {id:"t-ep1-end",speaker:"내레이터",portrait:"📖",text:"선생님도 외국어 때문에 힘들었던 적이 있었다. 그 사실이 알렉스에게 큰 위로가 됐다.",next:null,effect:"t-ep1-complete"},
    ],missions:{}},
    {id:"t-ep2",title:"방과 후 특별 수업",unlockCondition:"t-ep1-complete",nodes:[
      {id:"t-ep2-1",speaker:"선생님",portrait:"👩‍🏫",text:"알렉스, 방과 후에 시간 있어? 한국어 특별 수업 해줄게. 1:1로.",choices:[{label:"네, 감사합니다!",next:"t-ep2-yes"},{label:"오늘은 좀...",next:"t-ep2-no"}]},
      {id:"t-ep2-yes",speaker:"선생님",portrait:"👩‍🏫",text:"좋아! 오늘은 '허락 받기' 표현을 연습해보자.",next:"t-ep2-mission"},
      {id:"t-ep2-no",speaker:"선생님",portrait:"👩‍🏫",text:"그럼 내일이라도 와. 언제든지 괜찮아.",next:null,effect:"t-ep2-skip"},
      {id:"t-ep2-mission",speaker:"선생님",portrait:"👩‍🏫",text:"자, 화장실에 가도 되는지 물어봐. 해봐!",mission:"t-ep2-permission",next:"t-ep2-end"},
      {id:"t-ep2-end",speaker:"선생님",portrait:"👩‍🏫",text:"완벽해! 이 표현 하나만 알면 학교생활 절반은 해결돼. 내일도 열심히 하자.",next:null,effect:"t-ep2-complete"},
    ],missions:{"t-ep2-permission":{prompt:"화장실에 다녀와도 되는지 물어보세요.",answer:"선생님, 화장실에 다녀와도 될까요?",xp:15}}},
    {id:"t-ep3",title:"선생님의 과거",unlockCondition:"t-ep2-complete",nodes:[
      {id:"t-ep3-1",speaker:"선생님",portrait:"👩‍🏫",bg:"방과 후, 빈 교실.",text:"알렉스, 사실 선생님도 어렸을 때 낯선 곳으로 이사 간 적이 있어. 제주도에서 서울로. 처음엔 사투리 때문에 놀림도 받았어.",next:"t-ep3-2"},
      {id:"t-ep3-2",speaker:"선생님",portrait:"👩‍🏫",text:"낯선 곳에서 적응하는 사람이 나중에 훨씬 강해져. 알렉스도 그렇게 될 거야.",next:"t-ep3-3"},
      {id:"t-ep3-3",speaker:"알렉스",portrait:"🙂",text:"감사합니다, 선생님. 선생님 덕분에 용기가 생겼어요.",next:"t-ep3-end"},
      {id:"t-ep3-end",speaker:"내레이터",portrait:"📖",text:"선생님은 창문 너머 운동장을 바라봤다. 알렉스도 함께 바라봤다. 말이 없어도 충분한 순간이었다.",next:null,effect:"t-ep3-complete"},
    ],missions:{}},
  ]},
  seatmate:{npcId:"seatmate",title:"민준이의 숨겨진 꿈",icon:"👦",episodes:[
    {id:"m-ep1",title:"비밀 노트",unlockCondition:null,nodes:[
      {id:"m-ep1-1",speaker:"짝꿍 (민준)",portrait:"👦",bg:"쉬는 시간. 민준이가 뭔가를 열심히 적고 있다.",text:"야, 알렉스. 이거 봐봐. 러시아어 단어들이야. 혼자 공부하고 있어.",next:"m-ep1-2"},
      {id:"m-ep1-2",speaker:"알렉스 (내면의 소리)",portrait:"💭",text:"'민준이가 러시아어를 혼자 공부하고 있었다. 나 때문에?'",next:"m-ep1-3"},
      {id:"m-ep1-3",speaker:"짝꿍 (민준)",portrait:"👦",text:"나 나중에 세계여행 하고 싶거든. 러시아도 가고 싶어. 가르쳐줄 수 있어?",choices:[{label:"응! 내가 가르쳐줄게.",next:"m-ep1-yes",addKarma:2},{label:"나도 한국어 배우는 중인데...",next:"m-ep1-both",addKarma:1}]},
      {id:"m-ep1-yes",speaker:"짝꿍 (민준)",portrait:"👦",text:"진짜?! 그럼 우리 서로 가르쳐주자. 나는 한국어, 너는 러시아어!",next:"m-ep1-mission",flag:"민준_언어교환"},
      {id:"m-ep1-both",speaker:"짝꿍 (민준)",portrait:"👦",text:"그럼 같이 배우자! 내가 한국어 가르쳐주면, 너는 러시아어 알려줘.",next:"m-ep1-mission",flag:"민준_언어교환"},
      {id:"m-ep1-mission",speaker:"짝꿍 (민준)",portrait:"👦",text:"그럼 먼저 친구한테 물건 빌릴 때 뭐라고 해? 가르쳐줘!",mission:"m-ep1-borrow",next:"m-ep1-end"},
      {id:"m-ep1-end",speaker:"내레이터",portrait:"📖",text:"두 아이는 쉬는 시간 내내 서로의 언어를 주고받았다. 말이 통하지 않아도—웃음은 통했다.",next:null,effect:"m-ep1-complete"},
    ],missions:{"m-ep1-borrow":{prompt:"친구에게 지우개를 빌려달라고 말하세요.",answer:"지우개를 빌려줄 수 있어?",xp:10}}},
    {id:"m-ep2",title:"민준이의 고민",unlockCondition:"m-ep1-complete",nodes:[
      {id:"m-ep2-1",speaker:"짝꿍 (민준)",portrait:"👦",bg:"며칠 뒤, 민준이가 평소와 달리 조용하다.",text:"...알렉스, 너 외국에서 처음 왔을 때 무서웠어?",next:"m-ep2-2"},
      {id:"m-ep2-2",speaker:"알렉스",portrait:"🙂",choices:[{label:"응, 되게 무서웠어.",next:"m-ep2-honest"},{label:"조금. 왜? 민준이 무슨 일 있어?",next:"m-ep2-ask"}]},
      {id:"m-ep2-honest",speaker:"짝꿍 (민준)",portrait:"👦",text:"그렇구나... 나도 사실 내년에 전학 갈 수도 있거든. 아빠 일 때문에.",next:"m-ep2-comfort"},
      {id:"m-ep2-ask",speaker:"짝꿍 (민준)",portrait:"👦",text:"나도 내년에 전학 갈 수도 있어. 아빠 일 때문에... 무서워.",next:"m-ep2-comfort"},
      {id:"m-ep2-comfort",speaker:"알렉스",portrait:"🙂",text:"처음엔 무서운데—금방 친구 생겨. 나도 그랬잖아. 민준이처럼 먼저 말 걸어주는 사람이 있으면 괜찮아.",next:"m-ep2-end"},
      {id:"m-ep2-end",speaker:"짝꿍 (민준)",portrait:"👦",text:"...야, 내가 먼저 말 걸어줬더니 이제 나한테 위로해주네. ㅋㅋ. 고마워 알렉스.",next:null,effect:"m-ep2-complete"},
    ],missions:{}},
  ]},
  nurse:{npcId:"nurse",title:"보건실의 따뜻한 오후",icon:"👩‍⚕️",episodes:[
    {id:"n-ep1",title:"처음 아팠던 날",unlockCondition:null,nodes:[
      {id:"n-ep1-1",speaker:"내레이터",portrait:"📖",bg:"3교시가 끝날 무렵, 알렉스는 배가 아팠다.",text:"보건실 문 앞에 섰다. 어떻게 말하지? '배 아파요'가 맞나, '배가 아파요'가 맞나?",next:"n-ep1-mission"},
      {id:"n-ep1-mission",speaker:"보건 선생님",portrait:"👩‍⚕️",text:"어서 와. 어디 아파?",mission:"n-ep1-stomachache",next:"n-ep1-2"},
      {id:"n-ep1-2",speaker:"보건 선생님",portrait:"👩‍⚕️",text:"잘 말했어. 자, 여기 누워봐.",next:"n-ep1-3"},
      {id:"n-ep1-3",speaker:"보건 선생님",portrait:"👩‍⚕️",text:"전학 왔다고 들었어. 많이 힘들지? 몸이 아픈 건 마음이 힘들다는 신호일 때도 있어.",next:"n-ep1-end"},
      {id:"n-ep1-end",speaker:"보건 선생님",portrait:"👩‍⚕️",text:"좀 쉬어. 급한 거 없어. 여기 있어도 돼.",next:null,effect:"n-ep1-complete"},
    ],missions:{"n-ep1-stomachache":{prompt:"배가 아프다고 말하세요.",answer:"배가 아파요.",xp:10}}},
    {id:"n-ep2",title:"선생님의 약상자",unlockCondition:"n-ep1-complete",nodes:[
      {id:"n-ep2-1",speaker:"보건 선생님",portrait:"👩‍⚕️",bg:"다음 주. 알렉스는 보건실을 다시 찾았다.",text:"어, 알렉스! 오늘은 어디 아파?",next:"n-ep2-2"},
      {id:"n-ep2-2",speaker:"알렉스",portrait:"🙂",choices:[{label:"아니요, 그냥... 왔어요.",next:"n-ep2-just-visit"},{label:"머리가 조금 아파요.",next:"n-ep2-headache"}]},
      {id:"n-ep2-just-visit",speaker:"보건 선생님",portrait:"👩‍⚕️",text:"그냥 와도 돼. 여기는 누구나 올 수 있는 곳이야. 차 한 잔 마실래?",next:"n-ep2-tea"},
      {id:"n-ep2-headache",speaker:"보건 선생님",portrait:"👩‍⚕️",text:"머리가 아프구나. 약 줄까?",mission:"n-ep2-medicine",next:"n-ep2-tea"},
      {id:"n-ep2-tea",speaker:"보건 선생님",portrait:"👩‍⚕️",text:"(따뜻한 유자차를 내밀었다) 몸보다 마음이 아플 때 더 잘 들어.",next:"n-ep2-end"},
      {id:"n-ep2-end",speaker:"내레이터",portrait:"📖",text:"유자차는 달고 따뜻했다. 처음으로 학교에서 편안함을 느꼈다.",next:null,effect:"n-ep2-complete"},
    ],missions:{"n-ep2-medicine":{prompt:"두통약을 달라고 말하세요.",answer:"두통약을 주세요.",xp:10}}},
  ]},
  monitor:{npcId:"monitor",title:"반장의 두 얼굴",icon:"🧒",episodes:[
    {id:"su-ep1",title:"청소 대작전",unlockCondition:null,nodes:[
      {id:"su-ep1-1",speaker:"반장 (수호)",portrait:"🧒",bg:"청소 시간.",text:"알렉스, 너 청소 당번이야. 같이 해야 해.",choices:[{label:"응, 같이 하자!",next:"su-ep1-yes",addKarma:2},{label:"청소 어떻게 하는지 몰라...",next:"su-ep1-dunno",addKarma:1}]},
      {id:"su-ep1-yes",speaker:"반장 (수호)",portrait:"🧒",text:"오, 적극적인데? 그럼 칠판 지워줘.",next:"su-ep1-mission"},
      {id:"su-ep1-dunno",speaker:"반장 (수호)",portrait:"🧒",text:"그냥 따라 해. 내가 하는 거 보고.",next:"su-ep1-mission"},
      {id:"su-ep1-mission",speaker:"반장 (수호)",portrait:"🧒",text:"청소 같이 하자고 말할 때는 이렇게 해봐!",mission:"su-ep1-clean",next:"su-ep1-2"},
      {id:"su-ep1-2",speaker:"반장 (수호)",portrait:"🧒",text:"잘하네. 있지, 나 반장이라 딱딱하게 보일 수 있는데... 사실 그냥 다 같이 잘 지내고 싶어서 그래.",next:"su-ep1-end"},
      {id:"su-ep1-end",speaker:"내레이터",portrait:"📖",text:"딱딱하게만 보였던 반장 수호. 알고 보니 누구보다 반 친구들을 챙기는 아이였다.",next:null,effect:"su-ep1-complete"},
    ],missions:{"su-ep1-clean":{prompt:"청소를 같이 하자고 말하세요.",answer:"청소 같이 할래?",xp:10}}},
  ]},
  librarian:{npcId:"librarian",title:"도서관의 비밀 창고",icon:"📖",episodes:[
    {id:"lib-ep1",title:"금지된 책장",unlockCondition:null,nodes:[
      {id:"lib-ep1-1",speaker:"사서 선생님",portrait:"📖",bg:"도서관 한쪽 구석. 자물쇠가 달린 책장이 있다.",text:"어, 거기 들어가면 안 돼. 거기는... 특별한 책들이 있어.",next:"lib-ep1-2"},
      {id:"lib-ep1-2",speaker:"알렉스",portrait:"🙂",choices:[{label:"어떤 책이요? 궁금해요!",next:"lib-ep1-curious"},{label:"아, 죄송해요.",next:"lib-ep1-sorry"}]},
      {id:"lib-ep1-curious",speaker:"사서 선생님",portrait:"📖",text:"호기심이 많구나! 특별한 학생한테만 보여주는 곳이야. 책을 빌려본 학생한테.",next:"lib-ep1-mission"},
      {id:"lib-ep1-sorry",speaker:"사서 선생님",portrait:"📖",text:"괜찮아, 궁금하면 물어봐도 돼. 특별한 학생한테만 보여주는 곳이거든.",next:"lib-ep1-mission"},
      {id:"lib-ep1-mission",speaker:"사서 선생님",portrait:"📖",text:"책을 빌리고 싶다고 말해봐. 그럼 보여줄게.",mission:"lib-ep1-borrow",next:"lib-ep1-reveal"},
      {id:"lib-ep1-reveal",speaker:"사서 선생님",portrait:"📖",text:"(자물쇠를 풀며) 여기엔 세계 각국 언어로 된 책들이 있어. 한국에 온 외국 학생들을 위해 모은 거야.",next:"lib-ep1-3"},
      {id:"lib-ep1-3",speaker:"알렉스 (내면의 소리)",portrait:"💭",text:"'러시아어 책도 있었다. 낯선 한국에서, 낯익은 글자를 보니 눈물이 날 것 같았다.'",next:"lib-ep1-end"},
      {id:"lib-ep1-end",speaker:"사서 선생님",portrait:"📖",text:"가끔 여기 와도 돼. 읽고 싶은 거 있으면 말해.",next:null,effect:"lib-ep1-complete"},
    ],missions:{"lib-ep1-borrow":{prompt:"책을 빌리고 싶다고 말하세요.",answer:"이 책을 빌리고 싶어요.",xp:12}}},
  ]},
};

const ENDINGS = {
  good:{id:"good",title:"완전한 새 출발",icon:"🌟",reward:100,text:["봄이 왔다. 알렉스는 이제 더 이상 교실 문 앞에서 망설이지 않는다.","한국어가 완벽하지 않아도 괜찮다. 친구들은 이미 알렉스를 이해한다.","엄마한테 쓴 편지에는 이렇게 적혀 있었다: '여기가 이제 내 집 같아요.'","— 끝 · Конец —"]},
  normal:{id:"normal",title:"한 걸음씩",icon:"🌱",reward:60,text:["아직 모르는 단어가 더 많지만—알렉스는 포기하지 않는다.","매일 한 단어씩, 매일 한 명씩. 그게 알렉스의 방식이다.","언젠가 이 학교에서의 날들이 가장 소중한 기억이 될 것이다.","— 끝 · Конец —"]},
  bad:{id:"bad",title:"다시 도전",icon:"🔄",reward:30,text:["쉽지 않았다. 하지만 포기하지 않았다.","알렉스는 내일도 학교에 간다. 어제보다 조금 더 용기를 내서.","— 다시 시작 · Начать заново —"]},
};

// ═══════════════════════════════════════════════════════════════════════════
// 메인 컴포넌트
// ═══════════════════════════════════════════════════════════════════════════
export default function SchoolKoreanGameYS2({
  studentId,
  playerName: initPlayerName,
  initialState,
  unlockedMaps: initUnlockedMaps,
  onStateChange,
  onSave,
  onLogout,
}) {
  const todayTheme    = useMemo(()=>getTodayTheme(),[]);
  const tomorrowTheme = useMemo(()=>getTomorrowTheme(),[]);
  const todayKey      = useMemo(()=>getTodayKey(),[]);

  // ── 플레이어 이름 ──
  const [playerName, setPlayerName] = useState(initPlayerName || "");
  const [showNameInput, setShowNameInput] = useState(!initPlayerName);
  const [nameInputVal, setNameInputVal]   = useState("");

  // ── 잠금 해제된 맵 ──
  const [unlockedMaps, setUnlockedMaps] = useState(initUnlockedMaps || ["school"]);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [saveStatus, setSaveStatus]     = useState("");

  // ── 캐릭터 커스터마이징 ──
  const [charConfig, setCharConfig] = useState(()=>{
    try { return JSON.parse(localStorage.getItem("school-rpg-char")||"null") || initialState?.charConfig || DEFAULT_CHARACTER; }
    catch { return DEFAULT_CHARACTER; }
  });
  const [showCustomizer, setShowCustomizer] = useState(()=>{
    try { return !localStorage.getItem("school-rpg-char"); }
    catch { return true; }
  });

  // ── 확장 맵 지원 ──
  const BIG_MAP_IDS = ["gate","floor1","floor2","rooftop"];
  const isBigMap = BIG_MAP_IDS.includes(mapMode);

  const [mapMode, setMapMode] = useState(initialState?.mapMode || "floor1");
  const [px, setPx] = useState(initialState?.px || 13*TS+TS/2);
  const [py, setPy] = useState(initialState?.py || 8*TS+TS/2);
  const [facing, setFacing] = useState("down");

  const [keys, setKeys]         = useState({});
  const [touchDir, setTouchDir] = useState({});

  const [activeNpcId, setActiveNpcId]         = useState(null);
  const [activeMissionId, setActiveMissionId] = useState(null);
  const [showMissionWin, setShowMissionWin]   = useState(false);
  const [showMenu, setShowMenu]               = useState(false);
  const [menuIdx, setMenuIdx]                 = useState(0);

  const [textAnswer, setTextAnswer]   = useState("");
  const [freeChat, setFreeChat]       = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatLog, setChatLog] = useState([
    {type:"system", text:`SCHOOL LIFE RPG — 영웅전설 스타일`},
    {type:"system", text:`${todayTheme.icon} [${todayTheme.day}] ${todayTheme.themeName}: ${todayTheme.desc}`},
  ]);
  const [xp, setXp]               = useState(()=> initialState?.xp ?? loadTotalXp());
  const [completed, setCompleted] = useState(()=> initialState?.completed || loadTodayCompleted());
  const [msgNpc, setMsgNpc]       = useState("시스템");
  const [msgText, setMsgText]     = useState("방향키로 이동, SPACE/ENTER로 대화하세요.");
  const [speechOk, setSpeechOk]   = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText]     = useState("");
  const [xpPopup, setXpPopup]         = useState(null);
  const [showTomorrow, setShowTomorrow] = useState(false);

  // ── 스토리 엔진 ──
  const [storyMode, setStoryMode]           = useState(false);
  const [storyNodeId, setStoryNodeId]       = useState(null);
  const [storySource, setStorySource]       = useState(null);
  const [storyFlags, setStoryFlags]         = useState(()=> initialState?.storyFlags || {});
  const [karma, setKarma]                   = useState(()=> initialState?.karma ?? (()=>{ try{return parseInt(localStorage.getItem("school-rpg-karma")||"0",10);}catch{return 0;}})());
  const [storyCompleted, setStoryCompleted] = useState(()=> initialState?.storyCompleted || (()=>{ try{return JSON.parse(localStorage.getItem("school-rpg-story")||"[]");}catch{return[];}})());
  const [showStoryHub, setShowStoryHub]     = useState(false);
  const [storyMission, setStoryMission]     = useState(null);
  const [showEnding, setShowEnding]         = useState(null);

  // ── 스토리 로그 ──
  const [storyLog, setStoryLog]       = useState([]);   // {speaker, portrait, text}[]
  const [showStoryLog, setShowStoryLog] = useState(false);

  // ── 단어장 ──
  const [vocabulary, setVocabulary]   = useState(()=> initialState?.vocabulary || (()=>{ try{return JSON.parse(localStorage.getItem("school-rpg-vocab")||"[]");}catch{return[];} })());
  const [showVocab, setShowVocab]     = useState(false);
  const [vocabFilter, setVocabFilter] = useState("all"); // all | today | starred
  const [vocabStarred, setVocabStarred] = useState(()=>{ try{return JSON.parse(localStorage.getItem("school-rpg-starred")||"[]");}catch{return[];} });

  // ── BGM (Web Audio API) ──
  const audioCtxRef = useRef(null);
  const bgmRef      = useRef(null);
  const [bgmOn, setBgmOn] = useState(true);
  const bgmOnRef    = useRef(true);

  const canvasRef   = useRef(null);
  const minimapRef  = useRef(null);
  const rafRef      = useRef(null);
  const frameRef    = useRef(0);
  const pxRef       = useRef(px); const pyRef = useRef(py);
  const keysRef     = useRef(keys); const touchRef = useRef(touchDir);
  const stateRef    = useRef({mapMode,completed,activeNpcId,showMenu,showMissionWin});

  useEffect(()=>{ pxRef.current=px; },[px]);
  useEffect(()=>{ pyRef.current=py; },[py]);
  useEffect(()=>{ keysRef.current=keys; },[keys]);
  useEffect(()=>{ touchRef.current=touchDir; },[touchDir]);
  useEffect(()=>{ stateRef.current={mapMode,completed,activeNpcId,showMenu,showMissionWin,storyMode,showStoryHub,showEnding,charConfig}; },[mapMode,completed,activeNpcId,showMenu,showMissionWin,storyMode,showStoryHub,showEnding,charConfig]);
  useEffect(()=>{ saveTodayCompleted(completed); },[completed]);
  useEffect(()=>{ saveTotalXp(xp); },[xp]);
  useEffect(()=>{ try{localStorage.setItem("school-rpg-karma",String(karma));}catch{} },[karma]);
  useEffect(()=>{ try{localStorage.setItem("school-rpg-story",JSON.stringify(storyCompleted));}catch{} },[storyCompleted]);

  // ── App.jsx 에 상태 동기화 ──
  useEffect(()=>{
    if(!onStateChange) return;
    onStateChange({ xp, karma, mapMode, px, py, completed, storyCompleted, vocabulary, storyFlags, unlockedMaps });
  },[xp, karma, mapMode, completed, storyCompleted, vocabulary, unlockedMaps]);

  // 미션 완료 시 App.jsx 에 알리기
  const notifyMissionComplete = useCallback((missionXp)=>{
    if(onStateChange) onStateChange({ missionJustCompleted:{ xp: missionXp } });
  },[onStateChange]);
  useEffect(()=>{ try{localStorage.setItem("school-rpg-vocab",JSON.stringify(vocabulary));}catch{} },[vocabulary]);
  useEffect(()=>{ try{localStorage.setItem("school-rpg-starred",JSON.stringify(vocabStarred));}catch{} },[vocabStarred]);
  useEffect(()=>{ try{localStorage.setItem("school-rpg-unlocked",JSON.stringify(unlockedMaps));}catch{} },[unlockedMaps]);
  useEffect(()=>{ try{localStorage.setItem("school-rpg-char",JSON.stringify(charConfig));}catch{} },[charConfig]);
  useEffect(()=>{ if(playerName) try{localStorage.setItem("school-rpg-name",playerName);}catch{} },[playerName]);
  useEffect(()=>{ setSpeechOk(typeof window!=="undefined"&&!!(window.SpeechRecognition||window.webkitSpeechRecognition)); },[]);

  // 첫 방문시 이름 입력창
  useEffect(()=>{ if(!playerName) { setShowNameInput(true); setNameInputVal(""); } },[]);

  // ── 자동 저장은 App.jsx에서 처리 (30초마다) ──

  // ── 챕터 클리어 시 맵 해금 (App.jsx에서도 처리) ──
  useEffect(()=>{
    storyCompleted.forEach(effect => {
      const chapterId = effect.replace("-complete","");
      if (CHAPTER_UNLOCK[chapterId]) {
        const info = CHAPTER_UNLOCK[chapterId];
        setUnlockedMaps(prev => {
          const next = [...prev];
          let changed = false;
          info.unlocks.forEach(mapId => { if(!next.includes(mapId)){ next.push(mapId); changed=true; } });
          return changed ? next : prev;
        });
      }
    });
  },[storyCompleted]);

  // ── BGM: 8비트 복도 음악 ──
  useEffect(()=>{
    let ctx, stopped=false;
    const notes = [262,294,330,349,392,440,494,523]; // C D E F G A B C
    const melody = [392,440,392,349,330,349,392,0,330,349,330,294,262,294,330,0,
                    392,440,392,349,392,440,494,0,523,494,440,392,349,392,440,0];
    const bass   = [131,131,147,147,165,165,174,174,196,196,220,220,247,247,262,262,
                    131,131,147,147,165,165,174,174,196,196,220,220,247,247,262,262];
    let melIdx=0, bassIdx=0, bpm=120, beat=60/bpm;

    function playNote(frequency, duration, vol=0.12, type="square") {
      if(!ctx||stopped||!bgmOnRef.current) return;
      const osc=ctx.createOscillator(), gain=ctx.createGain();
      osc.type=type; osc.frequency.value=frequency;
      gain.gain.setValueAtTime(vol,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+duration*0.9);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime+duration);
    }

    function tick() {
      if(stopped) return;
      if(bgmOnRef.current) {
        const m=melody[melIdx%melody.length], b=bass[bassIdx%bass.length];
        if(m) playNote(m, beat*0.8, 0.09, "square");
        if(b) playNote(b, beat*1.6, 0.06, "triangle");
      }
      melIdx++; bassIdx++;
      bgmRef.current=setTimeout(tick, beat*1000);
    }

    try {
      ctx=new (window.AudioContext||window.webkitAudioContext)();
      audioCtxRef.current=ctx;
      bgmRef.current=setTimeout(tick, 300);
    } catch(e) {}

    return ()=>{
      stopped=true;
      if(bgmRef.current) clearTimeout(bgmRef.current);
      try{ ctx?.close(); }catch{}
    };
  },[]);

  function toggleBgm() {
    setBgmOn(v=>{ bgmOnRef.current=!v; return !v; });
  }

  // ── 단어 추가 (미션 정답 맞출 때 호출) ──
  function addVocab(korean, prompt) {
    const entry = {
      id: `${Date.now()}`,
      korean,
      prompt,
      date: getTodayKey(),
      day: getTodayTheme().day,
    };
    setVocabulary(prev=>{
      if(prev.find(v=>v.korean===korean)) return prev;
      return [...prev, entry];
    });
  }

  // ── 스토리 로그 추가 ──
  function addStoryLog(speaker, portrait, text) {
    setStoryLog(prev=>[...prev.slice(-80), {speaker, portrait, text, time:new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"})}]);
  }

  // 자정 체크
  useEffect(()=>{ const t=setInterval(()=>{ if(getTodayKey()!==todayKey) window.location.reload(); },60000); return()=>clearInterval(t); },[todayKey]);

  const curMap = useMemo(()=>{
    if(mapMode==="school")      return SCHOOL_MAP;
    if(mapMode==="classroom")   return CLASS_MAP;
    if(mapMode==="playground")  return PLAYGROUND_MAP;
    if(mapMode==="cafeteria")   return CAFETERIA_MAP;
    if(mapMode==="gym")         return GYM_MAP;
    if(mapMode==="restroom")    return RESTROOM_MAP;
    if(mapMode==="teacherroom") return TEACHERROOM_MAP;
    if(mapMode==="afterschool") return AFTERSCHOOL_MAP;
    // 확장 맵
    if(mapMode==="gate")        return GATE_MAP;
    if(mapMode==="floor1")      return FLOOR1_MAP;
    if(mapMode==="floor2")      return FLOOR2_MAP;
    if(mapMode==="rooftop")     return ROOFTOP_MAP;
    return SCHOOL_MAP;
  },[mapMode]);

  const curNpcs = useMemo(()=>{
    const baseNpcs = mapMode==="school" ? SCHOOL_NPCS
      : mapMode==="classroom" ? CLASS_NPCS
      : BIG_NPCS[mapMode]   // 확장 맵 NPC
      || MAP_NPCS[mapMode]   // 기존 추가 맵 NPC
      || [];
    return buildDailyNpcs(baseNpcs, todayTheme, mapMode);
  },[mapMode, todayTheme]);

  const curPortals = useMemo(()=>{
    if(mapMode==="school") return SCHOOL_NEW_PORTALS;
    // 확장 맵 포탈
    if(BIG_PORTALS[mapMode]) return BIG_PORTALS[mapMode];
    return [EXIT_PORTAL];
  },[mapMode]);

  const levelInfo  = useMemo(()=>getLevelInfo(xp),[xp]);
  const activeNpc  = useMemo(()=>activeNpcId?curNpcs.find(n=>n.id===activeNpcId):null,[activeNpcId,curNpcs]);
  const activeMission = useMemo(()=>activeNpc?.missions.find(m=>m.id===activeMissionId)||null,[activeNpc,activeMissionId]);

  // 카메라
  const camX = useMemo(()=>clamp(px-CAM_W/2, 0, (curMap[0].length)*TS-CAM_W),[px,curMap]);
  const camY = useMemo(()=>clamp(py-CAM_H/2, 0, (curMap.length)*TS-CAM_H),[py,curMap]);

  // 충돌 체크
  const canMove = useCallback((nx,ny,map)=>{
    const tx=Math.floor(nx/TS), ty=Math.floor(ny/TS);
    const offsets=[[0,0],[0,-1],[0,1],[-1,0],[1,0]];
    return offsets.every(([dx,dy])=>{
      const t=map[ty+dy]?.[tx+dx];
      return t===0||t===2||t===4||t===5||t===6;
    });
  },[]);

  // 가까운 NPC/포탈
  const nearbyNpc = useMemo(()=>{
    const tx=Math.floor(px/TS), ty=Math.floor(py/TS);
    return curNpcs.find(n=>Math.abs(n.tx-tx)<=2&&Math.abs(n.ty-ty)<=2)||null;
  },[px,py,curNpcs]);
  const nearbyPortal = useMemo(()=>{
    const tx=Math.floor(px/TS), ty=Math.floor(py/TS);
    return curPortals.find(p=>Math.abs(p.tx-tx)<=1&&Math.abs(p.ty-ty)<=1)||null;
  },[px,py,curPortals]);

  // 현재 존
  const currentZoneName = useMemo(()=>{
    const allMeta = { ...MAPS_META, ...BIG_MAPS_META };
    if(allMeta[mapMode]) return allMeta[mapMode].name;
    if(mapMode==="school") return "학교 복도";
    if(mapMode==="classroom") return "교실 내부";
    return mapMode;
  },[mapMode]);

  // ── 효과음 ──
  function playSfx(freqs, durs, type="square", vol=0.15) {
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext||window.webkitAudioContext)();
      if(!audioCtxRef.current) audioCtxRef.current=ctx;
      let t = ctx.currentTime;
      freqs.forEach((f,i)=>{
        const osc=ctx.createOscillator(), gain=ctx.createGain();
        osc.type=type; osc.frequency.value=f;
        gain.gain.setValueAtTime(vol,t);
        gain.gain.exponentialRampToValueAtTime(0.001,t+durs[i]);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t+durs[i]);
        t+=durs[i];
      });
    } catch(e){}
  }
  function playCorrectSfx()  { playSfx([523,659,784],[0.08,0.08,0.18],"square",0.13); }
  function playWrongSfx()    { playSfx([220,185],[0.12,0.2],"sawtooth",0.1); }
  function playStepSfx()     { playSfx([180],[0.04],"square",0.04); }
  function playOpenMenuSfx() { playSfx([330,440],[0.06,0.08],"triangle",0.1); }
  function playXpSfx()       { playSfx([523,587,659,784],[0.07,0.07,0.07,0.15],"square",0.12); }

  // ── 미니맵 렌더 ──
  function drawMinimap(canvas, map, pxPos, pyPos, npcs, portals) {
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    const W=canvas.width, H=canvas.height;
    const cols=map[0]?.length||0, rows=map.length;
    const tw=W/cols, th=H/rows;
    ctx.clearRect(0,0,W,H);
    // 배경
    ctx.fillStyle="#000020"; ctx.fillRect(0,0,W,H);
    // 타일
    for(let ty=0;ty<rows;ty++) for(let tx=0;tx<cols;tx++) {
      const t=map[ty][tx];
      if(t===1) { ctx.fillStyle="#1a1855"; }
      else if(t===4) { ctx.fillStyle="#3a1040"; }
      else if(t===5) { ctx.fillStyle="#2a2010"; }
      else if(t===2) { ctx.fillStyle="#885500"; }
      else { ctx.fillStyle="#1a1a30"; }
      ctx.fillRect(tx*tw, ty*th, tw, th);
    }
    // 포탈
    portals.forEach(p=>{ ctx.fillStyle="#00ff88"; ctx.fillRect(p.tx*tw,p.ty*th,tw*2,th); });
    // NPC
    npcs.forEach(n=>{ ctx.fillStyle=n.color; ctx.fillRect(n.tx*tw-1,n.ty*th-1,tw+2,th+2); });
    // 플레이어
    const mx=(pxPos/TS)*tw, my=(pyPos/TS)*th;
    ctx.fillStyle="#ff4444";
    ctx.fillRect(mx-2,my-2,5,5);
    // 테두리
    ctx.strokeStyle="#00ffff"; ctx.lineWidth=1; ctx.strokeRect(0,0,W,H);
  }
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext("2d");
    let last=performance.now();
    const MAP_W=(curMap[0]||[]).length;
    const MAP_H=curMap.length;

    const loop=(now)=>{
      const dt=Math.min(40,now-last)/1000; last=now;
      frameRef.current++;
      const fr=frameRef.current;
      const {showMenu:sm, showMissionWin:smw, storyMode:stor, showStoryHub:hub, showEnding:end} = stateRef.current;

      if(!sm && !smw && !stor && !hub && !end){
        const spd=100*dt;
        const k=keysRef.current, t=touchRef.current;
        let nx=pxRef.current, ny=pyRef.current, moved=false;
        if(k["arrowup"]||k["w"]||t.up){    ny-=spd; setFacing("up");    moved=true;}
        if(k["arrowdown"]||k["s"]||t.down){ ny+=spd; setFacing("down");  moved=true;}
        if(k["arrowleft"]||k["a"]||t.left){ nx-=spd; setFacing("left");  moved=true;}
        if(k["arrowright"]||k["d"]||t.right){nx+=spd; setFacing("right"); moved=true;}
        if(moved){
          const bnx=clamp(nx,TS,MAP_W*TS-TS), bny=clamp(ny,TS,MAP_H*TS-TS);
          if(canMove(bnx,bny,curMap)){
            setPx(bnx); setPy(bny);
            pxRef.current=bnx; pyRef.current=bny;
            // 발걸음 효과음 (8프레임마다)
            if(fr%8===0) playStepSfx();
          }
        }
      }

      // 미니맵 업데이트
      if(fr%6===0) drawMinimap(minimapRef.current, curMap, pxRef.current, pyRef.current, curNpcs, curPortals);

      // 렌더
      const cpx=pxRef.current, cpy=pyRef.current;
      const camX2=clamp(cpx-CAM_W/2, 0, MAP_W*TS-CAM_W);
      const camY2=clamp(cpy-CAM_H/2, 0, MAP_H*TS-CAM_H);
      const {completed:comp,activeNpcId:aNpcId} = stateRef.current;

      ctx.fillStyle="#000"; ctx.fillRect(0,0,CAM_W,CAM_H);

      // 타일
      for(let ty=0;ty<MAP_H;ty++){
        for(let tx=0;tx<MAP_W;tx++){
          const t=curMap[ty][tx];
          if(t!==-1) drawTile(ctx,tx,ty,t,camX2,camY2);
        }
      }

      // 포탈
      curPortals.forEach(p=>drawPortal(ctx,p,fr,camX2,camY2));

      // NPC
      stateRef.current.npcs = curNpcs; // pass to loop
      curNpcs.forEach(npc=>{
        const isNear=(Math.abs(npc.tx-Math.floor(cpx/TS))<=2&&Math.abs(npc.ty-Math.floor(cpy/TS))<=2);
        const isDone=npc.missions.every(m=>comp.includes(m.id));
        drawNpc(ctx,npc,fr,isNear,isDone,camX2,camY2);
      });

      // 플레이어 (커스터마이징 적용)
      const charCfg = stateRef.current.charConfig || DEFAULT_CHARACTER;
      drawCharacter(ctx, cpx, cpy, charCfg, 1, fr);

      // 조명
      drawLight(ctx,cpx,cpy,camX2,camY2);

      rafRef.current=requestAnimationFrame(loop);
    };
    rafRef.current=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(rafRef.current);
  },[mapMode, curMap, curNpcs, curPortals, canMove]);

  // 키보드
  useEffect(()=>{
    const dn=e=>{
      if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d"," ","Enter","Escape"].includes(e.key)) e.preventDefault();
      if(e.key==="Escape"){
        setShowMenu(false); setShowMissionWin(false);
        setStoryMode(false); setShowStoryHub(false); setStoryMission(null);
        return;
      }
      if((e.key===" "||e.key==="Enter")&&!showMenu&&!showMissionWin){ handleAction(); return; }
      if(showMenu){
        if(e.key==="ArrowUp") setMenuIdx(i=>(i-1+4)%4);
        if(e.key==="ArrowDown") setMenuIdx(i=>(i+1)%4);
        if(e.key===" "||e.key==="Enter") handleMenuSelect(menuIdx);
        return;
      }
      setKeys(p=>({...p,[e.key.toLowerCase()]:true,[e.key]:true}));
    };
    const up=e=>setKeys(p=>({...p,[e.key.toLowerCase()]:false,[e.key]:false}));
    window.addEventListener("keydown",dn); window.addEventListener("keyup",up);
    return()=>{ window.removeEventListener("keydown",dn); window.removeEventListener("keyup",up); };
  },[showMenu,showMissionWin,menuIdx,nearbyNpc,nearbyPortal]);

  function addChat(type,text){ setChatLog(p=>[...p.slice(-60),{type,text}]); }

  async function handleManualSave() {
    setSaveStatus("저장 중...");
    if(onSave) await onSave(false);
    setSaveStatus("✓ 저장됨");
    setTimeout(()=>setSaveStatus(""), 2500);
    if(studentId) await updateActivityLog(studentId, { mapVisited: mapMode });
  }

  function handleAction(){
    if(nearbyPortal){
      const meta = MAPS_META[nearbyPortal.toMap];
      if(meta && !unlockedMaps.includes(nearbyPortal.toMap)){
        setMsgNpc("시스템");
        setMsgText(`🔒 ${meta.name}은 아직 잠겨 있어요! 스토리를 진행해서 열어보세요.`);
        playWrongSfx(); return;
      }
      setMapMode(nearbyPortal.toMap);
      setPx(nearbyPortal.spawnTx*TS+TS/2); setPy(nearbyPortal.spawnTy*TS+TS/2);
      setActiveNpcId(null); setActiveMissionId(null);
      const mapName = MAPS_META[nearbyPortal.toMap]?.name || nearbyPortal.toMap;
      const mapIcon = MAPS_META[nearbyPortal.toMap]?.icon || "";
      const msg = `${mapIcon} ${mapName}에 입장했어요!`;
      setMsgNpc("시스템"); setMsgText(msg); addChat("system","▶ "+msg);
      updateActivityLog(0,0,[nearbyPortal.toMap]);
      return;
    }
    if(nearbyNpc){
      setActiveNpcId(nearbyNpc.id);
      setMenuIdx(0); setShowMenu(true); playOpenMenuSfx();
      setMsgNpc(nearbyNpc.name); setMsgText(nearbyNpc.greeting);
      addChat("npc",`[${nearbyNpc.name}] ${nearbyNpc.greeting}`);
    }
  }

  const menuItems = [
    { label:"스토리 대화" },
    { label:"미션 시작하기" },
    { label:"AI 자유 대화" },
    { label:"닫기" },
  ];

  function handleMenuSelect(idx){
    setShowMenu(false);
    if(idx===0){
      // 스토리 시작
      if(activeNpc) openNpcStory(activeNpc.id);
    } else if(idx===1){ setShowMissionWin(true); setActiveMissionId(null); }
    else if(idx===2){ setShowMissionWin(true); setActiveMissionId("free"); }
    else { setActiveNpcId(null); setMsgNpc("시스템"); setMsgText("방향키로 이동하세요."); }
  }

  // ── 스토리 엔진 함수 ──────────────────────────────────────────────────
  // 플레이어 이름 치환
  function injectName(text) {
    return (text||"").replace(/알렉스/g, playerName||"알렉스");
  }

  function getStoryNode(source, nodeId) {
    if(!source) return null;
    if(source.type==="main") {
      const ch = MAIN_QUEST.chapters.find(c=>c.id===source.chapterId);
      return ch?.nodes.find(n=>n.id===nodeId)||null;
    }
    if(source.type==="side") {
      const side = SIDE_STORIES[source.npcId];
      const ep = side?.episodes.find(e=>e.id===source.episodeId);
      return ep?.nodes.find(n=>n.id===nodeId)||null;
    }
    return null;
  }

  function openNpcStory(npcId) {
    // 메인 퀘스트 중 해당 NPC가 등장하는 챕터 체크 → 아니면 사이드 스토리
    const side = SIDE_STORIES[npcId];
    if(!side) { setShowMissionWin(true); setActiveMissionId(null); return; }
    // 열려있는 첫 에피소드 찾기
    const ep = side.episodes.find(e=>!e.unlockCondition||storyCompleted.includes(e.unlockCondition));
    if(!ep) { setMsgText("아직 열리지 않은 스토리예요."); return; }
    startStory({ type:"side", npcId, episodeId:ep.id }, ep.nodes[0].id);
  }

  function openMainStory() {
    const ch = MAIN_QUEST.chapters.find(c=>!c.unlockCondition||storyCompleted.includes(c.unlockCondition));
    if(!ch) { setMsgText("메인 스토리가 없어요."); return; }
    // 이미 완료된 챕터면 다음 챕터
    const nextCh = MAIN_QUEST.chapters.find(c=>(!c.unlockCondition||storyCompleted.includes(c.unlockCondition))&&!storyCompleted.includes(`${c.id}-complete`));
    if(!nextCh) { setMsgText("메인 스토리를 모두 완료했어요! 🎉"); return; }
    startStory({ type:"main", chapterId:nextCh.id }, nextCh.nodes[0].id);
  }

  function startStory(source, nodeId) {
    setStorySource(source);
    setStoryNodeId(nodeId);
    setStoryMode(true);
    setShowStoryHub(false);
  }

  function advanceStory(choiceNext, choiceFlag, choiceKarma) {
    const node = getStoryNode(storySource, storyNodeId);
    if(!node) return;
    // 스토리 로그에 현재 노드 기록
    addStoryLog(node.speaker, node.portrait, node.text);
    const nextId = choiceNext || node.next;

    // 플래그 추가
    if(choiceFlag) setStoryFlags(f=>({...f,[choiceFlag]:true}));
    // 카르마
    if(choiceKarma) setKarma(k=>k+choiceKarma);

    // 미션 처리
    if(node.mission) {
      const mDef = getMissionDef(storySource, node.mission);
      if(mDef) {
        setStoryMission({ def:mDef, missionId:node.mission, onComplete:()=>{
          setStoryMission(null);
          if(nextId) setStoryNodeId(nextId);
          else finishStory(node);
        }});
        return;
      }
    }

    // 효과 처리
    if(node.effect) {
      setStoryCompleted(prev=>[...prev.filter(x=>x!==node.effect), node.effect]);
      if(node.effect==="main-ending") { triggerEnding(); return; }
    }

    if(nextId) setStoryNodeId(nextId);
    else finishStory(node);
  }

  function getMissionDef(source, missionId) {
    if(source.type==="main") return MAIN_QUEST.missions[missionId]||null;
    if(source.type==="side") {
      const ep = SIDE_STORIES[source.npcId]?.episodes.find(e=>e.id===source.episodeId);
      return ep?.missions?.[missionId]||null;
    }
    return null;
  }

  function finishStory(node) {
    setStoryMode(false);
    setStoryNodeId(null);
    if(node?.ending) triggerEnding(node.ending);
    else setMsgText("스토리가 끝났어요. 계속 탐험해 보세요!");
  }

  function triggerEnding(type) {
    const endingType = type || (karma>=15&&storyCompleted.length>=5?"good":karma>=8?"normal":"bad");
    setShowEnding(ENDINGS[endingType]||ENDINGS.normal);
    setXp(v=>v+(ENDINGS[endingType]?.reward||30));
  }

  function openMission(id){
    setActiveMissionId(id); setTextAnswer(""); setVoiceText("");
    const m=activeNpc?.missions.find(m=>m.id===id);
    if(m){ addChat("npc",`[${activeNpc.name}] ${m.prompt}`); setMsgNpc(activeNpc.name); setMsgText(m.prompt); }
  }

  function submitMission(override){
    if(!activeMission||!activeNpc) return;
    const ans=(override||textAnswer||voiceText).trim();
    if(!ans){ setMsgText("답을 입력하거나 말해 보세요!"); return; }
    addChat("user",ans);
    const ok=isCorrect(ans,activeMission.answer);
    if(ok){
      addChat("success",`정답! [${activeNpc.name}] ${activeMission.title} 클리어!`);
      setMsgNpc(activeNpc.name); setMsgText("훌륭해요! 정확한 표현이에요!");
      speak(activeMission.answer);
      addVocab(activeMission.answer, activeMission.prompt || "");
      if(!completed.includes(activeMission.id)){
        const nc=[...completed,activeMission.id];
        setCompleted(nc); setXp(v=>v+activeMission.xp); notifyMissionComplete(activeMission.xp);
        setXpPopup(activeMission.xp); setTimeout(()=>setXpPopup(null),1500);
        playCorrectSfx();
        const rem=activeNpc.missions.filter(m=>!nc.includes(m.id)&&m.id!==activeMission.id);
        setTimeout(()=>{
          if(rem.length>0) addChat("npc",`[${activeNpc.name}] 다음: "${rem[0].title}"도 해봐요!`);
          else addChat("npc",`[${activeNpc.name}] 모든 미션 완료! 다른 NPC에게 가보세요!`);
        },600);
      }
    } else {
      addChat("fail",`오답. 예시: "${activeMission.answer}"`);
      playWrongSfx();
      setMsgText(`예시: ${activeMission.answer}`);
      speak(activeMission.answer);
    }
    setTextAnswer(""); setVoiceText("");
  }

  function startVoice(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR) return;
    const rec=new SR(); rec.lang="ko-KR"; rec.interimResults=false;
    setIsListening(true); rec.start();
    rec.onresult=e=>{ setVoiceText(e.results?.[0]?.[0]?.transcript||""); setIsListening(false); };
    rec.onerror=()=>setIsListening(false); rec.onend=()=>setIsListening(false);
  }

  async function submitFreeChat(){
    if(!activeNpc||!freeChat.trim()) return;
    const msg=freeChat.trim(); addChat("user",msg); setFreeChat(""); setChatLoading(true);
    try{ const r=await callClaude(activeNpc,mapMode,msg); addChat("npc",`[${activeNpc.name}] ${r||"다시 말해볼까요?"}`); }
    catch{ addChat("npc",`[${activeNpc.name}] ${localReply(activeNpc,msg)}`); }
    finally{ setChatLoading(false); }
  }

  const setTouch=useCallback((dir,val)=>setTouchDir(p=>({...p,[dir]:val})),[]);

  // 오늘 달성도
  const allTodayMs = useMemo(()=>Object.values(todayTheme.todayMissions).flat(),[todayTheme]);
  const doneTodayCount = useMemo(()=>allTodayMs.filter(m=>completed.includes(m.id)).length,[allTodayMs,completed]);
  const dayPct = allTodayMs.length>0 ? Math.round(doneTodayCount/allTodayMs.length*100) : 0;

  // 로그 ref (자동 스크롤)
  const logRef=useRef(null);
  useEffect(()=>{ if(logRef.current) logRef.current.scrollTop=logRef.current.scrollHeight; },[chatLog]);

  // ── 렌더 ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{YS2_STYLE}</style>

      {/* ── 캐릭터 커스터마이저 ── */}
      {showCustomizer&&(
        <CharacterCustomizer
          initialConfig={charConfig}
          playerName={playerName||"플레이어"}
          onConfirm={(cfg)=>{
            setCharConfig(cfg);
            setShowCustomizer(false);
            try{localStorage.setItem("school-rpg-char",JSON.stringify(cfg));}catch{}
          }}
          onCancel={charConfig!==DEFAULT_CHARACTER?()=>setShowCustomizer(false):null}
        />
      )}

      {/* ── 이름 입력 오버레이 (첫 방문) ── */}
      {showNameInput&&(
        <div className="ys2-name-overlay">
          <div className="ys2-name-box">
            <div className="ys2-name-title">⚔ SCHOOL LIFE RPG ⚔</div>
            <div className="ys2-name-body">
              <div style={{color:"#ffffff",fontSize:"15px",marginBottom:6}}>한국 학교에 오신 것을 환영합니다!</div>
              <div style={{color:"#aaaaff",fontSize:"13px",marginBottom:16,lineHeight:1.7}}>
                당신의 이름을 입력하세요.<br/>
                <span style={{color:"#888888",fontSize:"12px"}}>(한국어, 영어, 러시아어 모두 가능)</span>
              </div>
              <input className="ys2-input" style={{width:"100%",marginBottom:12,textAlign:"center",fontSize:"16px"}}
                value={nameInputVal} onChange={e=>setNameInputVal(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter"&&nameInputVal.trim()){ setPlayerName(nameInputVal.trim()); setShowNameInput(false); playCorrectSfx(); }}}
                placeholder="이름을 입력하세요..." autoFocus />
              <button className="ys2-btn ys2-btn-green" style={{width:"100%",fontSize:"15px",padding:"10px"}}
                onClick={()=>{ if(nameInputVal.trim()){ setPlayerName(nameInputVal.trim()); setShowNameInput(false); playCorrectSfx(); } else { setPlayerName("알렉스"); setShowNameInput(false); } }}>
                시작하기 ▶
              </button>
              <div style={{marginTop:8,color:"#555",fontSize:"12px",cursor:"pointer"}} onClick={()=>{ setPlayerName("알렉스"); setShowNameInput(false); }}>
                건너뛰기 (알렉스로 시작)
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="ys2-bg">
        <div style={{display:"flex"}}>

          {/* ── 게임 캔버스 프레임 ── */}
          <div className="ys2-frame">
            {/* 맵 이름 */}
            <div className="ys2-mapname">AREA: <span>{currentZoneName}</span></div>

            {/* 근처 NPC/포탈 힌트 */}
            {(nearbyNpc||nearbyPortal)&&!showMenu&&!showMissionWin&&(
              <div style={{position:"absolute",top:6,left:200,background:"#000080",border:"2px solid #ffff00",color:"#ffff00",fontSize:"13px",padding:"3px 10px",zIndex:11}}>
                {nearbyNpc ? `[SPACE] ${nearbyNpc.name}와 대화` : `[SPACE] ${nearbyPortal.label}`}
              </div>
            )}

            {/* Canvas */}
            <canvas ref={canvasRef} width={CAM_W} height={CAM_H} style={{display:"block"}} />

            {/* 조이스틱 */}
            <div className="ys2-joy">
              <div className="ys2-joy-row">
                <button className="ys2-jbtn" onPointerDown={()=>setTouch("up",true)} onPointerUp={()=>setTouch("up",false)} onPointerLeave={()=>setTouch("up",false)}>▲</button>
              </div>
              <div className="ys2-joy-row">
                <button className="ys2-jbtn" onPointerDown={()=>setTouch("left",true)} onPointerUp={()=>setTouch("left",false)} onPointerLeave={()=>setTouch("left",false)}>◀</button>
                <button className="ys2-jbtn ys2-jact" onClick={handleAction}>OK</button>
                <button className="ys2-jbtn" onPointerDown={()=>setTouch("right",true)} onPointerUp={()=>setTouch("right",false)} onPointerLeave={()=>setTouch("right",false)}>▶</button>
              </div>
              <div className="ys2-joy-row">
                <button className="ys2-jbtn" onPointerDown={()=>setTouch("down",true)} onPointerUp={()=>setTouch("down",false)} onPointerLeave={()=>setTouch("down",false)}>▼</button>
              </div>
            </div>

            {/* XP 팝업 */}
            {xpPopup&&<div className="ys2-xppop">+{xpPopup} XP !</div>}

            {/* ── 단어장 창 ── */}
            {showVocab&&(
              <div className="ys2-vocab-win" onClick={e=>e.target===e.currentTarget&&setShowVocab(false)}>
                <div className="ys2-vocab-box">
                  <div style={{background:"#000044",borderBottom:"2px solid #00ffff",padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{color:"#ffff00",fontSize:"15px",fontWeight:700}}>📖 러시아어↔한국어 단어장</span>
                    <button className="ys2-mission-close" onClick={()=>setShowVocab(false)}>✕</button>
                  </div>
                  {/* 필터 */}
                  <div style={{display:"flex",gap:6,padding:"8px 12px",background:"#000060",borderBottom:"1px solid #00004a"}}>
                    {["all","today","starred"].map(f=>{
                      const label = f==="all"?"전체":f==="today"?"오늘":"★ 즐겨찾기";
                      const count = f==="all"?vocabulary.length:f==="today"?vocabulary.filter(v=>v.date===getTodayKey()).length:vocabStarred.length;
                      return (
                        <button key={f} className="ys2-btn" style={{fontSize:"11px",padding:"3px 10px",borderColor:vocabFilter===f?"#ffff00":"#4488ff",color:vocabFilter===f?"#ffff00":"#aaaaff"}}
                          onClick={()=>setVocabFilter(f)}>
                          {label} ({count})
                        </button>
                      );
                    })}
                  </div>
                  {/* 단어 목록 */}
                  <div style={{maxHeight:"55vh",overflowY:"auto"}}>
                    {vocabulary
                      .filter(v=>{
                        if(vocabFilter==="today") return v.date===getTodayKey();
                        if(vocabFilter==="starred") return vocabStarred.includes(v.id);
                        return true;
                      })
                      .reverse()
                      .map(v=>(
                        <div key={v.id} className="ys2-vocab-item">
                          <div style={{flex:1}}>
                            <div className="ys2-vocab-kr">{v.korean}</div>
                            <div className="ys2-vocab-hint">{v.prompt}</div>
                            <div className="ys2-vocab-day">{v.day} · {v.date}</div>
                          </div>
                          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,marginLeft:10}}>
                            <span className="ys2-star" onClick={()=>setVocabStarred(p=>p.includes(v.id)?p.filter(x=>x!==v.id):[...p,v.id])}>
                              {vocabStarred.includes(v.id)?"★":"☆"}
                            </span>
                            <button className="ys2-bgm-btn" style={{fontSize:"11px",padding:"2px 6px"}}
                              onClick={()=>speak(v.korean)}>🔊</button>
                          </div>
                        </div>
                      ))
                    }
                    {vocabulary.length===0&&(
                      <div style={{color:"#555",fontSize:"13px",padding:"20px",textAlign:"center"}}>
                        미션을 완료하면 표현이 자동으로 저장돼요!
                      </div>
                    )}
                  </div>
                  {/* 전체 듣기 */}
                  {vocabulary.length>0&&(
                    <div style={{borderTop:"2px solid #00ffff",padding:"8px 12px",background:"#000040"}}>
                      <button className="ys2-btn ys2-btn-green" style={{width:"100%",fontSize:"12px"}}
                        onClick={()=>{
                          const list=vocabulary.filter(v=>vocabFilter==="today"?v.date===getTodayKey():vocabFilter==="starred"?vocabStarred.includes(v.id):true);
                          let i=0;
                          const next=()=>{ if(i<list.length){ speak(list[i++].korean); setTimeout(next,1800); } };
                          next();
                        }}>▶ 전체 발음 듣기</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── 스토리 로그 창 ── */}
            {showStoryLog&&(
              <div className="ys2-log-win" onClick={e=>e.target===e.currentTarget&&setShowStoryLog(false)}>
                <div className="ys2-log-box">
                  <div style={{background:"#000044",borderBottom:"2px solid #00ffff",padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{color:"#ffff00",fontSize:"15px",fontWeight:700}}>📜 스토리 로그</span>
                    <button className="ys2-mission-close" onClick={()=>setShowStoryLog(false)}>✕</button>
                  </div>
                  <div className="ys2-log-scroll">
                    {storyLog.length===0&&(
                      <div style={{color:"#555",fontSize:"13px",padding:"20px",textAlign:"center"}}>
                        스토리를 진행하면 대화 기록이 여기에 쌓여요.
                      </div>
                    )}
                    {storyLog.map((entry,i)=>(
                      <div key={i} className="ys2-log-entry">
                        <div className="ys2-log-speaker">
                          {entry.portrait} {entry.speaker}
                          <span className="ys2-log-time">{entry.time}</span>
                        </div>
                        <div className="ys2-log-body">{entry.text}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{borderTop:"2px solid #00ffff",padding:"8px 12px",background:"#000040",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{color:"#444488",fontSize:"12px"}}>총 {storyLog.length}개 대화</span>
                    <button className="ys2-btn" style={{fontSize:"11px",padding:"4px 10px",borderColor:"#ff4444",color:"#ff4444"}}
                      onClick={()=>setStoryLog([])}>
                      초기화
                    </button>
                  </div>
                </div>
              </div>
            )}
            {storyMode&&storyNodeId&&(()=>{
              const node = getStoryNode(storySource, storyNodeId);
              if(!node) return null;
              return (
                <div style={{position:"absolute",inset:0,background:"rgba(0,0,20,0.82)",zIndex:40,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
                  {/* 배경 설명 (있을 때만) */}
                  {node.bg&&(
                    <div style={{background:"rgba(0,0,60,0.92)",borderBottom:"1px solid #4444aa",padding:"8px 18px",fontSize:"13px",color:"#aaaaff",fontStyle:"italic",lineHeight:1.6}}>
                      {injectName(node.bg)}
                    </div>
                  )}
                  {/* 대화 박스 */}
                  <div style={{background:"#000070",borderTop:"3px solid #ffffff",padding:0}}>
                    <div style={{margin:"6px 10px",border:"2px solid #00ffff",background:"#00003a",padding:"10px 14px",position:"relative",minHeight:"90px"}}>
                      {/* 화자 이름 */}
                      <div style={{position:"absolute",top:-13,left:10,background:"#000070",color:"#ffff00",fontSize:"14px",fontWeight:700,padding:"0 8px",border:"1px solid #00ffff"}}>
                        {node.portrait} {node.speaker}
                      </div>
                      {/* 대사 */}
                      <div style={{color:"#ffffff",fontSize:"15px",lineHeight:1.7,marginTop:4,marginBottom:node.choices?10:0}}>
                        {injectName(node.text)}
                      </div>
                      {/* 선택지 */}
                      {node.choices ? (
                        <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:8}}>
                          {node.choices.map((ch,i)=>(
                            <button key={i}
                              onClick={()=>advanceStory(ch.next, ch.flag, ch.addKarma)}
                              style={{textAlign:"left",background:"#000050",color:"#ffff88",border:"1px solid #4488ff",padding:"6px 14px",fontSize:"13px",cursor:"pointer",fontFamily:"'Noto Sans KR',sans-serif",transition:"background 0.1s"}}
                              onMouseEnter={e=>e.target.style.background="#000088"}
                              onMouseLeave={e=>e.target.style.background="#000050"}>
                              ▶ {ch.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div style={{textAlign:"right",marginTop:6}}>
                          <button onClick={()=>advanceStory(null,null,null)}
                            style={{background:"transparent",color:"#00ffff",border:"none",fontSize:"13px",cursor:"pointer",fontFamily:"'Noto Sans KR',sans-serif"}}>
                            다음 ▶
                          </button>
                        </div>
                      )}
                    </div>
                    {/* 진행 표시 */}
                    <div style={{padding:"2px 12px 4px",display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#444488"}}>
                      <span>{storySource?.type==="main"?"메인 스토리":"사이드 스토리"}</span>
                      <span>ESC: 나가기</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── 스토리 내 미션 창 ── */}
            {storyMission&&(
              <div style={{position:"absolute",inset:0,background:"rgba(0,0,20,0.88)",zIndex:45,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{background:"#000080",border:"3px solid #ffff00",width:520,maxWidth:"90%"}}>
                  <div style={{background:"#000044",borderBottom:"2px solid #ffff00",padding:"6px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{color:"#ffff00",fontSize:"14px",fontWeight:700}}>★ 스토리 미션</span>
                    <span style={{color:"#00ffff",fontSize:"12px"}}>XP +{storyMission.def.xp}</span>
                  </div>
                  <div style={{padding:"14px"}}>
                    <div style={{background:"#000044",border:"2px solid #00ffff",padding:"10px",marginBottom:"12px"}}>
                      <div style={{color:"#ffffff",fontSize:"15px",lineHeight:1.7,marginBottom:6}}>{storyMission.def.prompt}</div>
                      <div style={{color:"#00ffff",fontSize:"13px"}}>예시: {storyMission.def.answer}</div>
                    </div>
                    {/* 텍스트 입력 */}
                    <div style={{marginBottom:8}}>
                      <div style={{color:"#aaaaff",fontSize:"13px",marginBottom:4}}>직접 입력</div>
                      <div style={{display:"flex",gap:6}}>
                        <input className="ys2-input" style={{flex:1}} value={textAnswer}
                          onChange={e=>setTextAnswer(e.target.value)}
                          onKeyDown={e=>{
                            if(e.key==="Enter"){
                              const ans=textAnswer.trim();
                              if(!ans) return;
                              addChat("user",ans);
                              if(isCorrect(ans,storyMission.def.answer)){
                                addChat("success",`정답! +${storyMission.def.xp} XP`);
                                setXp(v=>v+storyMission.def.xp); notifyMissionComplete(storyMission.def.xp);
                                setXpPopup(storyMission.def.xp);
                                setTimeout(()=>setXpPopup(null),1400);
                                speak(storyMission.def.answer);
                                setTextAnswer("");
                                storyMission.onComplete();
                              } else {
                                addChat("fail",`오답. 예시: "${storyMission.def.answer}"`);
                                speak(storyMission.def.answer);
                                setTextAnswer("");
                              }
                            }
                          }}
                          placeholder="한국어로 입력하세요..." />
                        <button className="ys2-btn ys2-btn-green"
                          onClick={()=>{
                            const ans=textAnswer.trim();
                            if(!ans) return;
                            addChat("user",ans);
                            if(isCorrect(ans,storyMission.def.answer)){
                              addChat("success",`정답! +${storyMission.def.xp} XP`);
                              setXp(v=>v+storyMission.def.xp);
                              setXpPopup(storyMission.def.xp);
                              setTimeout(()=>setXpPopup(null),1400);
                              speak(storyMission.def.answer);
                              setTextAnswer("");
                              storyMission.onComplete();
                            } else {
                              addChat("fail",`오답. 예시: "${storyMission.def.answer}"`);
                              speak(storyMission.def.answer);
                              setTextAnswer("");
                            }
                          }}>제출</button>
                      </div>
                    </div>
                    {/* 음성 */}
                    <div style={{background:"#001a00",border:"2px solid #00ff88",padding:"8px"}}>
                      <div style={{color:"#00ff88",fontSize:"13px",marginBottom:6}}>음성 입력</div>
                      <div style={{color:"#aaffaa",fontSize:"13px",marginBottom:6,minHeight:18}}>
                        {speechOk?(voiceText||"마이크 버튼을 누르세요"):"음성 미지원"}
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <button className="ys2-btn" onClick={startVoice} disabled={!speechOk||isListening}
                          style={{flex:1,borderColor:"#00ff88",color:"#00ff88"}}>
                          {isListening?"● 듣는중...":"● 말하기"}
                        </button>
                        {voiceText&&(
                          <button className="ys2-btn ys2-btn-green"
                            onClick={()=>{
                              addChat("user",voiceText);
                              if(isCorrect(voiceText,storyMission.def.answer)){
                                addChat("success",`정답! +${storyMission.def.xp} XP`);
                                setXp(v=>v+storyMission.def.xp); notifyMissionComplete(storyMission.def.xp);
                                setXpPopup(storyMission.def.xp);
                                setTimeout(()=>setXpPopup(null),1400);
                                speak(storyMission.def.answer);
                                setVoiceText("");
                                storyMission.onComplete();
                              } else {
                                addChat("fail",`오답. 예시: "${storyMission.def.answer}"`);
                                speak(storyMission.def.answer);
                                setVoiceText("");
                              }
                            }}>음성 제출</button>
                        )}
                      </div>
                    </div>
                    <button className="ys2-btn" style={{width:"100%",marginTop:8,borderColor:"#888",color:"#888",fontSize:"12px"}}
                      onClick={()=>{ setStoryMission(null); storyMission.onComplete(); }}>
                      건너뛰기 (XP 없음)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── 스토리 허브 창 ── */}
            {showStoryHub&&(
              <div style={{position:"absolute",inset:0,background:"rgba(0,0,20,0.88)",zIndex:42,overflowY:"auto"}}
                onClick={e=>e.target===e.currentTarget&&setShowStoryHub(false)}>
                <div style={{background:"#000080",border:"3px solid #ffffff",margin:"20px auto",width:560,maxWidth:"92%"}}>
                  <div style={{background:"#000044",borderBottom:"2px solid #00ffff",padding:"8px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{color:"#ffff00",fontSize:"16px",fontWeight:700}}>★ 스토리 선택</span>
                    <button className="ys2-mission-close" onClick={()=>setShowStoryHub(false)}>✕ 닫기</button>
                  </div>

                  {/* 메인 퀘스트 */}
                  <div style={{padding:"10px 14px",borderBottom:"2px solid #000060"}}>
                    <div style={{color:"#ffff00",fontSize:"14px",fontWeight:700,marginBottom:8}}>
                      ★ 메인 퀘스트 — {MAIN_QUEST.title}
                    </div>
                    {MAIN_QUEST.chapters.map(ch=>{
                      const done = storyCompleted.includes(`${ch.id}-complete`);
                      const locked = ch.unlockCondition && !storyCompleted.includes(ch.unlockCondition);
                      return (
                        <div key={ch.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 10px",marginBottom:4,background:done?"#002200":locked?"#111":"#000050",border:`1px solid ${done?"#00ff88":locked?"#333":"#4488ff"}`}}>
                          <div>
                            <div style={{color:done?"#00ff88":locked?"#555":"#ffffff",fontSize:"14px",fontWeight:700}}>
                              {done?"✓ ":locked?"🔒 ":""}{ch.title}
                            </div>
                          </div>
                          {!locked&&(
                            <button className="ys2-btn ys2-btn-green" style={{fontSize:"12px",padding:"4px 12px"}}
                              onClick={()=>{ setShowStoryHub(false); startStory({type:"main",chapterId:ch.id},ch.nodes[0].id); }}>
                              {done?"다시보기":"시작"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* 사이드 스토리 */}
                  <div style={{padding:"10px 14px"}}>
                    <div style={{color:"#00ffff",fontSize:"14px",fontWeight:700,marginBottom:8}}>◆ NPC 사이드 스토리</div>
                    {Object.values(SIDE_STORIES).map(side=>(
                      <div key={side.npcId} style={{marginBottom:10}}>
                        <div style={{color:"#ffcc44",fontSize:"13px",fontWeight:700,marginBottom:4}}>
                          {side.icon} {side.title}
                        </div>
                        {side.episodes.map(ep=>{
                          const done = storyCompleted.includes(`${ep.id}-complete`)||storyCompleted.includes(`${ep.id}-skip`);
                          const locked = ep.unlockCondition && !storyCompleted.includes(ep.unlockCondition);
                          return (
                            <div key={ep.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 10px",marginBottom:3,background:done?"#002200":locked?"#111":"#000050",border:`1px solid ${done?"#00ff88":locked?"#333":"#4488ff"}`}}>
                              <div style={{color:done?"#00ff88":locked?"#555":"#ccc",fontSize:"13px"}}>
                                {done?"✓ ":locked?"🔒 ":""}{ep.title}
                              </div>
                              {!locked&&(
                                <button className="ys2-btn" style={{fontSize:"11px",padding:"3px 10px",borderColor:"#00ffff",color:"#00ffff"}}
                                  onClick={()=>{ setShowStoryHub(false); startStory({type:"side",npcId:side.npcId,episodeId:ep.id},ep.nodes[0].id); }}>
                                  {done?"다시보기":"시작"}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* 카르마/진행도 */}
                  <div style={{background:"#000040",borderTop:"2px solid #00ffff",padding:"8px 14px",display:"flex",gap:20,fontSize:"13px"}}>
                    <span style={{color:"#00ffff"}}>카르마: <span style={{color:"#ffff00",fontWeight:700}}>{karma}</span></span>
                    <span style={{color:"#00ffff"}}>완료 스토리: <span style={{color:"#ffff00",fontWeight:700}}>{storyCompleted.length}</span></span>
                  </div>
                </div>
              </div>
            )}

            {/* ── 엔딩 창 ── */}
            {showEnding&&(
              <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.95)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{background:"#000080",border:"4px solid #ffffff",width:520,textAlign:"center",padding:0}}>
                  <div style={{background:"#000044",borderBottom:"2px solid #ffff00",padding:"12px",fontSize:"22px"}}>
                    {showEnding.icon} {showEnding.title}
                  </div>
                  <div style={{padding:"20px 24px"}}>
                    {showEnding.text.map((line,i)=>(
                      <div key={i} style={{color:i===showEnding.text.length-1?"#aaaaff":"#ffffff",fontSize:i===0?15:14,lineHeight:1.9,marginBottom:4,fontStyle:i===showEnding.text.length-1?"italic":"normal"}}>
                        {line}
                      </div>
                    ))}
                    <div style={{marginTop:16,padding:"8px",background:"#001a00",border:"2px solid #00ff88"}}>
                      <span style={{color:"#00ff88",fontSize:"15px",fontWeight:700}}>보상 XP +{showEnding.reward}</span>
                    </div>
                    <button className="ys2-btn ys2-btn-green" style={{marginTop:16,fontSize:"15px",padding:"10px 32px"}}
                      onClick={()=>setShowEnding(null)}>
                      계속하기
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* NPC 메뉴 */}
            {showMenu&&activeNpc&&(
              <div className="ys2-menu-overlay">
                <div className="ys2-menu">
                  <div className="ys2-menu-title">{activeNpc.name}</div>
                  {menuItems.map((item,i)=>(
                    <div key={i} className={`ys2-menu-item${menuIdx===i?" sel":""}`}
                      onClick={()=>{setMenuIdx(i);handleMenuSelect(i);}}>
                      <span className="cur">▶</span>{item.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 미션 창 */}
            {showMissionWin&&activeNpc&&(
              <div className="ys2-mission-win" onClick={e=>e.target===e.currentTarget&&setShowMissionWin(false)}>
                <div className="ys2-mission-box">
                  <div className="ys2-mission-header">
                    <span style={{color:"#ffff00",fontSize:"14px",fontWeight:700}}>{activeNpc.name} — {activeMissionId==="free"?"AI 자유 대화":"미션 선택"}</span>
                    <button className="ys2-mission-close" onClick={()=>setShowMissionWin(false)}>✕ 닫기</button>
                  </div>

                  {/* 힌트 */}
                  <div style={{padding:"8px 12px",background:"#000060",borderBottom:"1px solid #00004a"}}>
                    {activeNpc.hint.map((h,i)=>(
                      <div key={i} style={{color:i===0?"#ffff00":i===1?"#88ccff":"#aaaacc",fontSize:"13px",lineHeight:1.7}}>{h}</div>
                    ))}
                  </div>

                  {activeMissionId==="free" ? (
                    /* 자유 대화 */
                    <div style={{padding:"10px 12px"}}>
                      <div style={{color:"#00ffff",fontSize:"13px",marginBottom:"8px"}}>Claude AI와 자유롭게 한국어로 대화해 보세요.</div>
                      <div style={{display:"flex",gap:"6px",marginBottom:"8px"}}>
                        <input className="ys2-input" style={{flex:1}} value={freeChat}
                          onChange={e=>setFreeChat(e.target.value)}
                          onKeyDown={e=>e.key==="Enter"&&submitFreeChat()}
                          placeholder="자유롭게 한국어로..." />
                        <button className="ys2-btn ys2-btn-green" onClick={submitFreeChat} disabled={chatLoading}>
                          {chatLoading?"…":"전송"}
                        </button>
                      </div>
                      <div style={{background:"#000040",border:"1px solid #00004a",padding:"6px",maxHeight:"140px",overflowY:"auto"}}>
                        {chatLog.filter(m=>m.type==="user"||m.type==="npc").slice(-8).map((m,i)=>(
                          <div key={i} className={`ys2-log-msg ${m.type}`}>{m.text}</div>
                        ))}
                      </div>
                    </div>
                  ) : activeMission ? (
                    /* 미션 진행 중 */
                    <div style={{padding:"10px 12px"}}>
                      <div style={{background:"#000044",border:"2px solid #ffff00",padding:"10px",marginBottom:"10px"}}>
                        <div style={{color:"#ffff00",fontSize:"14px",fontWeight:700,marginBottom:"4px"}}>{activeMission.title}</div>
                        <div style={{color:"#ffffff",fontSize:"14px",lineHeight:1.7,marginBottom:"6px"}}>{activeMission.prompt}</div>
                        <div style={{color:"#00ffff",fontSize:"13px"}}>예시: {activeMission.answer}</div>
                      </div>
                      <div style={{marginBottom:"8px"}}>
                        <div style={{color:"#aaaaff",fontSize:"13px",marginBottom:"4px"}}>직접 입력</div>
                        <div style={{display:"flex",gap:"6px"}}>
                          <input className="ys2-input" style={{flex:1}} value={textAnswer}
                            onChange={e=>setTextAnswer(e.target.value)}
                            onKeyDown={e=>e.key==="Enter"&&submitMission()}
                            placeholder="한국어로 입력하세요..." />
                          <button className="ys2-btn ys2-btn-green" onClick={()=>submitMission()}>제출</button>
                        </div>
                      </div>
                      <div style={{background:"#001a00",border:"2px solid #00ff88",padding:"8px"}}>
                        <div style={{color:"#00ff88",fontSize:"13px",marginBottom:"6px"}}>음성 입력</div>
                        <div style={{color:"#aaffaa",fontSize:"13px",marginBottom:"6px",minHeight:"20px"}}>
                          {speechOk?(voiceText||"마이크 버튼을 누르세요"):"음성 미지원"}
                        </div>
                        <div style={{display:"flex",gap:"6px"}}>
                          <button className="ys2-btn" onClick={startVoice} disabled={!speechOk||isListening}
                            style={{flex:1,borderColor:"#00ff88",color:"#00ff88"}}>
                            {isListening?"● 듣는중...":"● 말하기"}
                          </button>
                          {voiceText&&<button className="ys2-btn ys2-btn-green" onClick={()=>submitMission(voiceText)}>음성 제출</button>}
                        </div>
                      </div>
                      <button className="ys2-btn" style={{width:"100%",marginTop:"8px",borderColor:"#888",color:"#aaa"}}
                        onClick={()=>setActiveMissionId(null)}>← 미션 목록으로</button>
                    </div>
                  ) : (
                    /* 미션 목록 */
                    <div style={{maxHeight:"260px",overflowY:"auto"}}>
                      {activeNpc.missions.map(m=>{
                        const done=completed.includes(m.id);
                        return (
                          <div key={m.id} className="ys2-mlist-item">
                            <div className={`ys2-mlist-title${done?" done":""}`}>
                              {done?"✓ ":""}{m.title}
                              <span style={{float:"right",color:done?"#00ff88":"#ffcc00",fontSize:"12px"}}>{done?"CLEAR":"XP "+m.xp}</span>
                            </div>
                            <div className="ys2-mlist-prompt">{m.prompt}</div>
                            <div className="ys2-mlist-actions">
                              <button className="ys2-btn ys2-btn-green" style={{fontSize:"13px",padding:"4px 12px"}}
                                onClick={()=>openMission(m.id)}>시작</button>
                              <button className="ys2-btn" style={{fontSize:"13px",padding:"4px 12px",borderColor:"#4488ff",color:"#4488ff"}}
                                onClick={()=>speak(m.answer)}>🔊 예시</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 하단 메시지 박스 */}
            <div className="ys2-msgbox">
              <div className="ys2-msgbox-inner">
                <span className="ys2-msgbox-name">{msgNpc}</span>
                <div className="ys2-msgbox-text">{msgText}<span className="ys2-cursor"/></div>
              </div>
            </div>
          </div>

          {/* ── 우측 UI 패널 ── */}
          <div className="ys2-side">

            {/* 미니맵 */}
            <div className="ys2-minimap-wrap">
              <div className="ys2-minimap-label">MINI MAP — {currentZoneName}</div>
              <canvas ref={minimapRef} width={296} height={80} style={{display:"block",width:"100%"}} />
            </div>
            <div className="ys2-theme-bar" style={{borderColor:todayTheme.themeColor}}>
              <span style={{color:todayTheme.themeColor,fontSize:"16px"}}>{todayTheme.icon}</span>
              <div>
                <div className="ys2-theme-name" style={{color:todayTheme.themeColor}}>{todayTheme.day} · {todayTheme.themeName}</div>
                <div className="ys2-theme-desc">{todayTheme.desc}</div>
              </div>
            </div>

            {/* 상태창 */}
            <div className="ys2-status">
              <div className="ys2-status-row">
                <span className="ys2-label">LV</span>
                <span className="ys2-val">{levelInfo.level}</span>
                <span className="ys2-label" style={{marginLeft:"auto"}}>XP</span>
                <span className="ys2-val">{xp}</span>
              </div>
              <div className="ys2-bar-wrap">
                <div className="ys2-bar-label">EXP</div>
                <div className="ys2-bar-bg"><div className="ys2-bar-fill ys2-bar-xp" style={{width:levelInfo.progress+"%"}}/></div>
              </div>
              <div className="ys2-status-row" style={{marginTop:4}}>
                <span className="ys2-label">CLEAR</span>
                <span className="ys2-val">{completed.length}</span>
                <span className="ys2-label" style={{marginLeft:"auto"}}>TODAY</span>
                <span className="ys2-val" style={{color:todayTheme.themeColor}}>{doneTodayCount}/{allTodayMs.length}</span>
              </div>
              <div className="ys2-bar-wrap">
                <div className="ys2-bar-label">오늘 달성도 {dayPct}%</div>
                <div className="ys2-bar-bg"><div className="ys2-bar-fill ys2-bar-day" style={{width:dayPct+"%",background:todayTheme.themeColor}}/></div>
              </div>
              {dayPct===100&&<div style={{color:"#ffd700",fontSize:"13px",textAlign:"center",marginTop:4}}>★ 오늘 미션 전부 완료! ★</div>}
              {/* 카르마 */}
              <div style={{marginTop:5,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:"#00ffff",fontSize:"12px"}}>카르마</span>
                <span style={{color:"#ff88ff",fontSize:"13px",fontWeight:700}}>{"♥".repeat(Math.min(karma,5))} {karma}</span>
              </div>
            </div>

            {/* 스토리 버튼 */}
            <div style={{padding:"8px 10px",borderBottom:"2px solid #00ffff",background:"#000044",display:"flex",gap:6}}>
              <button className="ys2-btn" style={{flex:1,fontSize:"12px",padding:"5px 8px",borderColor:"#ffff00",color:"#ffff00"}}
                onClick={()=>setShowStoryHub(true)}>
                ★ 스토리 목록
              </button>
              <button className="ys2-btn ys2-btn-green" style={{flex:1,fontSize:"12px",padding:"5px 8px"}}
                onClick={()=>openMainStory()}>
                ▶ 메인 퀘스트
              </button>
            </div>

            {/* NPC 정보 */}
            {activeNpc&&(
              <div style={{borderBottom:"2px solid #00ffff",padding:"6px 10px",background:"#000050"}}>
                <div style={{color:"#00ffff",fontSize:"12px",marginBottom:"4px"}}>대화 중</div>
                <div style={{color:activeNpc.color,fontSize:"14px",fontWeight:700}}>{activeNpc.name}</div>
                <div style={{color:"#aaaacc",fontSize:"12px",marginTop:"2px"}}>{activeNpc.hint[1]||""}</div>
              </div>
            )}

            {/* 대화 로그 */}
            <div className="ys2-log" ref={logRef}>
              <div style={{color:"#00ffff",fontSize:"12px",padding:"3px 6px",borderBottom:"1px solid #00004a",marginBottom:"4px"}}>BATTLE LOG</div>
              {chatLog.map((m,i)=>(
                <div key={i} className={`ys2-log-msg ${m.type}`}>{m.text}</div>
              ))}
            </div>

            {/* 내일 예고 */}
            <div style={{borderTop:"2px solid #00ffff",padding:"6px 10px",background:"#000040"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:"#888",fontSize:"12px"}}>내일 예고:</span>
                <button onClick={()=>setShowTomorrow(v=>!v)}
                  style={{background:"transparent",border:"1px solid #444",color:"#888",fontSize:"11px",padding:"2px 6px",cursor:"pointer",fontFamily:"'Noto Sans KR',sans-serif"}}>
                  {showTomorrow?"▲":"▼"}
                </button>
              </div>
              {showTomorrow&&(
                <div style={{marginTop:4}}>
                  <span style={{color:tomorrowTheme.themeColor,fontSize:"13px",fontWeight:700}}>{tomorrowTheme.icon} {tomorrowTheme.day} — {tomorrowTheme.themeName}</span>
                  <div style={{color:"#666",fontSize:"12px",marginTop:2}}>{tomorrowTheme.desc}</div>
                </div>
              )}

              {/* 추가 기능 버튼 */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginTop:6}}>
                <button className="ys2-btn" style={{fontSize:"11px",padding:"4px",borderColor:"#cc88ff",color:"#cc88ff"}}
                  onClick={()=>setShowVocab(true)}>📖 단어장({vocabulary.length})</button>
                <button className="ys2-btn" style={{fontSize:"11px",padding:"4px",borderColor:"#ffcc44",color:"#ffcc44"}}
                  onClick={()=>setShowStoryLog(true)}>📜 스토리 로그</button>
                <button className="ys2-bgm-btn" onClick={toggleBgm}>{bgmOn?"🔊 BGM ON":"🔇 BGM OFF"}</button>
                {MAPS_META[mapMode] && ["playground","cafeteria","gym","afterschool"].includes(mapMode) ? (
                  <button className="ys2-bgm-btn" style={{borderColor:"#ff88ff",color:"#ff88ff"}}
                    onClick={()=>setShowMiniGame(true)}>🎮 미니게임</button>
                ) : (
                  <button className="ys2-bgm-btn" style={{borderColor:"#ffaa44",color:"#ffaa44"}}
                    onClick={()=>{ setNameInputVal(playerName); setShowNameInput(true); }}>
                    👤 {playerName||"이름 설정"}
                  </button>
                )}
                {/* 캐릭터 꾸미기 버튼 */}
                <button className="ys2-bgm-btn" style={{borderColor:"#ff88cc",color:"#ff88cc"}}
                  onClick={()=>setShowCustomizer(true)}>🎨 캐릭터</button>
              </div>

              {/* 확장 맵 이동 버튼 */}
              <div style={{marginTop:6,borderTop:"1px solid #00004a",paddingTop:6}}>
                <div style={{color:"#00ffff",fontSize:"12px",marginBottom:4}}>🏢 확장 맵</div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {[
                      {id:"gate",   label:"🏫 정문"},
                      {id:"floor1", label:"🏢 1층"},
                      {id:"floor2", label:"🏢 2층", ch:"ch2"},
                      {id:"rooftop",label:"🌤 옥상", ch:"ch3"},
                    ].map(m=>{
                      const locked = m.ch && !unlockedMaps.includes(m.id);
                      return (
                        <button key={m.id} className="ys2-bgm-btn"
                          style={{
                            borderColor: locked?"#444":mapMode===m.id?"#ffff00":"#4488ff",
                            color: locked?"#444":mapMode===m.id?"#ffff00":"#4488ff",
                            opacity: locked?0.5:1,
                          }}
                          disabled={locked}
                          onClick={()=>{
                            if(locked) return;
                            setMapMode(m.id);
                            const spawnMap = {gate:{x:29*20+10,y:2*20+10}, floor1:{x:29*20+10,y:9*20+10}, floor2:{x:29*20+10,y:9*20+10}, rooftop:{x:29*20+10,y:8*20+10}};
                            const sp = spawnMap[m.id];
                            if(sp){ setPx(sp.x); setPy(sp.y); }
                          }}>
                          {locked?"🔒":""}{m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 저장 / 로그아웃 버튼 */}
              {studentId && (
                <div style={{display:"flex",gap:4,marginTop:4}}>
                  <button className="ys2-btn ys2-btn-green" style={{flex:1,fontSize:"11px",padding:"5px"}}
                    onClick={handleManualSave}>
                    {saveStatus || "💾 저장하기"}
                  </button>
                  {onLogout && (
                    <button className="ys2-btn" style={{fontSize:"11px",padding:"5px",borderColor:"#ff6666",color:"#ff6666"}}
                      onClick={onLogout}>← 로그아웃</button>
                  )}
                </div>
              )}

              {/* 조작법 */}
              <div style={{marginTop:"8px",fontSize:"11px",color:"#555",lineHeight:1.8}}>
                <div>WASD/방향키: 이동</div>
                <div>SPACE/ENTER: 대화·입장</div>
                <div>ESC: 창 닫기</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
