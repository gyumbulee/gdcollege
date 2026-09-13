export type RosterStudent = { id: number; matric_number: string; name: string };

export type Result = {
  id: number;
  status: "DRAFT" | "SUBMITTED" | "REVIEWED" | "VERIFIED" | "APPROVED" | "PUBLISHED";
  component_scores: Record<string, number> | null;
  total_score: number | null;
  grade: string | null;
  grade_point: number | null;
  submitted_at: string | null;
  published_at: string | null;
  student: { id: number; matric_number: string; name: string | null } | null;
  course_offering: { id: number; course: { code: string; title: string } | null } | null;
};

export type LecturerOffering = {
  id: number;
  course: { id: number; code: string; title: string; credit_units: number };
  level: { id: number; name: string };
  programme: { id: number; name: string };
  semester: { id: number; name: string };
  academic_session: { id: number; name: string };
};
