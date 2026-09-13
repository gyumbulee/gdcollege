export type RegistrationItem = {
  id: number;
  is_carryover: boolean;
  course_offering_id: number;
  course: { code: string; title: string; credit_units: number } | null;
  level: string | null;
};

export type CourseRegistration = {
  id: number;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "CLOSED";
  rejection_reason: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  academic_session: { id: number; name: string } | null;
  semester: { id: number; name: string } | null;
  student: { id: number; matric_number: string; name: string | null } | null;
  items: RegistrationItem[];
  total_credit_units: number;
};

export type EligibleOffering = {
  id: number;
  capacity: number | null;
  course: { id: number; code: string; title: string; credit_units: number };
  level: { id: number; name: string };
  programme: { id: number; name: string };
  semester: { id: number; name: string };
  academic_session: { id: number; name: string };
};
