import { apiFetch } from "./client";

export type PublicDocumentVerification = {
  valid: boolean;
  status: string;
  type: string;
  document_number: string;
  issued_at: string;
  student_name: string | null;
  programme: string | null;
  revoked_reason: string | null;
};

/** Fails soft, same convention as academics.ts — a lookup miss and an outage should both read as "couldn't verify", not crash the page. */
export async function verifyDocument(code: string): Promise<{ ok: boolean; found: boolean; document: PublicDocumentVerification | null; message: string | null }> {
  try {
    const { body } = await apiFetch<PublicDocumentVerification>(`/documents/verify/${encodeURIComponent(code)}`);
    if (body.success) {
      return { ok: true, found: true, document: body.data, message: null };
    }
    return { ok: true, found: false, document: null, message: body.message };
  } catch {
    return { ok: false, found: false, document: null, message: null };
  }
}
