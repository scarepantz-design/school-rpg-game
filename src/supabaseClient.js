// ═══════════════════════════════════════════════════════════════════════════
// supabaseClient.js
// Supabase 연결 설정
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'

// ⚠️ 아래 두 값을 Supabase 프로젝트에서 복사해서 넣어주세요
// https://app.supabase.com → 프로젝트 선택 → Settings → API
const SUPABASE_URL = 'https://mxbnvaqvpboyouxccctc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14Ym52YXF2cGJveW91eGNjY3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNjE1MDUsImV4cCI6MjA5MzYzNzUwNX0.Bz3QlZFLz8HLntU-QG2isw4sd3T7iTrW9bhgmO2dgGg'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ═══════════════════════════════════════════════════════════════════════════
// Supabase에서 실행할 SQL (대시보드 → SQL Editor에 붙여넣기)
// ═══════════════════════════════════════════════════════════════════════════
/*

-- 학생 테이블
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 관리자 테이블
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  password TEXT NOT NULL
);

-- 기본 관리자 계정 (비밀번호: admin1234)
INSERT INTO admins (password) VALUES ('admin1234');

-- 학생 진행 데이터
CREATE TABLE student_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  karma INTEGER DEFAULT 0,
  map_mode TEXT DEFAULT 'school',
  player_x FLOAT DEFAULT 280,
  player_y FLOAT DEFAULT 160,
  completed_missions JSONB DEFAULT '[]',
  story_completed JSONB DEFAULT '[]',
  vocabulary JSONB DEFAULT '[]',
  story_flags JSONB DEFAULT '{}',
  unlocked_maps JSONB DEFAULT '["school","classroom"]',
  last_saved TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id)
);

-- 일별 활동 로그
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  missions_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  time_played INTEGER DEFAULT 0,
  maps_visited JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- RLS 비활성화 (간단 모드 - 프로덕션에서는 활성화 권장)
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

*/
