export type EducationRecord = {
  id?: number;
  exam_body: string;
  exam_number?: string | null;
  exam_year: number;
  school_attended?: string | null;
  subjects: { subject: string; grade: string }[];
};

export type ApplicationDocument = {
  id: number;
  document_type: string;
  original_filename: string;
  size_bytes: number | null;
};

export type Application = {
  id: number;
  application_number: string;
  status:
    | "DRAFT"
    | "PAYMENT_PENDING"
    | "PAYMENT_CONFIRMED"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "SHORTLISTED"
    | "ADMITTED"
    | "REJECTED"
    | "ON_HOLD"
    | "WITHDRAWN";
  fee_paid: boolean;
  submitted_at: string | null;
  programme: { id: number; name: string; department: { id: number; name: string } | null } | null;
  academic_session: { id: number; name: string } | null;
  applicant: {
    date_of_birth: string | null;
    gender: string | null;
    nationality: string | null;
    state_of_origin: string | null;
    lga: string | null;
    address: string | null;
    next_of_kin_name: string | null;
    next_of_kin_phone: string | null;
    next_of_kin_relationship: string | null;
    next_of_kin_address: string | null;
    user: { name: string; email: string; phone: string | null };
  };
  education_records: EducationRecord[];
  documents: ApplicationDocument[];
};
