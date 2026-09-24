export type Student = {
  id: number;
  matric_number: string;
  status: "ACTIVE" | "DEFERRED" | "SUSPENDED" | "WITHDRAWN" | "EXPELLED" | "GRADUATED";
  graduated_at: string | null;
  user: { name: string; email: string; phone: string | null };
  programme: {
    id: number;
    name: string;
    department: { id: number; name: string; school: { id: number; name: string } | null } | null;
  } | null;
  current_level: { id: number; name: string } | null;
  admission_session: { id: number; name: string } | null;
  enrolments?: { id: number; academic_session: string | null; level: string | null; programme: string | null; status: string }[];
  programme_histories?: { id: number; from_programme: string | null; to_programme: string | null; reason: string | null; changed_at: string }[];
};
