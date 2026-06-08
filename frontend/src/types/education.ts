/**
 * Unified ChildProfile domain types — server shape from /api/children (v2 schema).
 * Single source of truth lives in FastAPI child_profile_service + analysis/plan generators.
 */

export interface OnboardingMeta {
  step: number;
  completed: boolean;
}

export interface AssessmentSnapshot {
  raw: Record<string, unknown>;
  analysis: Record<string, unknown> | null;
  assessment_id: string | null;
  captured_at: string;
}

export interface TestResultRecord {
  test_id: string;
  child_id: string;
  test_type: string;
  test_data: Record<string, unknown>;
  score: number;
  performance_level: string;
  timestamp: string;
}

export interface PlanHistoryEntry {
  plan_id: string;
  created_at: string;
}

export interface ChildProfile {
  child_id: string;
  schema_version?: number;
  name: string;
  age: number;
  gender: string;
  birth_date: string;
  parent_name: string;
  child_condition?: string | null;
  main_problems?: string[];
  created_at: string;
  updated_at?: string;
  assessment_snapshot: AssessmentSnapshot | null;
  test_results: TestResultRecord[];
  current_plan_id: string | null;
  plan_history: PlanHistoryEntry[];
  onboarding: OnboardingMeta;
}

export interface TrainingPlanSummary {
  plan_id: string;
  child_id: string;
  plan_type: string;
  duration_days?: number;
  focus_areas?: string[];
  goals?: string[];
  status?: string;
}
