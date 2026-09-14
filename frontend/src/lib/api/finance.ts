import "server-only";
import { apiFetch } from "./client";
import type { Paginated } from "./hod";

export type InvoiceItem = {
  id: number;
  name: string;
  amount: number;
  discount_amount: number;
  waived_amount: number;
  net_amount: number;
};

export type PaymentSummary = {
  id: number;
  reference: string;
  gateway: string;
  amount: number;
  status: string;
  paid_at: string | null;
};

export type Invoice = {
  id: number;
  invoice_number: string;
  status: string;
  total_amount: number;
  amount_paid: number;
  balance: number;
  due_date: string | null;
  void_reason: string | null;
  created_at: string;
  student?: { id: number; matric_number: string | null; name: string | null } | null;
  academic_session?: { id: number; name: string } | null;
  fee_structure?: { id: number; name: string } | null;
  items?: InvoiceItem[];
  payments?: PaymentSummary[];
};

export type Payment = {
  id: number;
  reference: string;
  gateway: string;
  gateway_reference: string | null;
  amount: number;
  status: string;
  paid_at: string | null;
  verified_at: string | null;
  created_at: string;
  student?: { id: number; matric_number: string | null; name: string | null } | null;
  invoice?: { id: number; invoice_number: string } | null;
};

export type FeeItemInput = { name: string; code?: string; amount: number; is_mandatory?: boolean };

export type FeeStructure = {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  total_amount: number;
  academic_session: { id: number; name: string } | null;
  programme: { id: number; name: string } | null;
  level: { id: number; name: string } | null;
  items: { id: number; name: string; code: string | null; amount: number; is_mandatory: boolean; is_active: boolean }[];
};

export type FinancialReport = {
  total_invoiced: number;
  total_collected: number;
  total_outstanding: number;
  invoices_by_status: Record<string, number>;
  payments_by_status: Record<string, number>;
  payments_by_gateway: { gateway: string; count: number; amount: number }[];
};

/* ------------------------------- Student ------------------------------- */

export function getMyInvoices(token: string) {
  return apiFetch<{ invoices: Invoice[]; total_outstanding: number }>("/student/invoices", { token });
}

export function initiatePayment(token: string, invoiceId: number, gateway?: string) {
  return apiFetch<{ payment: Payment; authorization_url: string | null }>(
    `/student/invoices/${invoiceId}/pay`,
    { method: "POST", token, body: JSON.stringify(gateway ? { gateway } : {}) }
  );
}

export function checkPaymentStatus(token: string, paymentId: number) {
  return apiFetch<Payment>(`/student/payments/${paymentId}/status`, { token });
}

/* -------------------------------- Bursary -------------------------------- */

export function getFeeStructures(token: string) {
  return apiFetch<FeeStructure[]>("/fee-structures", { token });
}

export function createFeeStructure(
  token: string,
  data: {
    name: string;
    academic_session_id: number;
    programme_id?: number | null;
    level_id?: number | null;
    items: FeeItemInput[];
  }
) {
  return apiFetch<FeeStructure>("/fee-structures", { method: "POST", token, body: JSON.stringify(data) });
}

export function getInvoices(token: string, page = 1, status?: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  return apiFetch<Paginated<Invoice>>(`/invoices?${params}`, { token });
}

export function generateInvoice(token: string, studentId: number, feeStructureId: number, semesterId?: number) {
  return apiFetch<Invoice>("/invoices", {
    method: "POST",
    token,
    body: JSON.stringify({ student_id: studentId, fee_structure_id: feeStructureId, semester_id: semesterId }),
  });
}

export function voidInvoice(token: string, invoiceId: number, reason: string) {
  return apiFetch<Invoice>(`/invoices/${invoiceId}/void`, {
    method: "POST",
    token,
    body: JSON.stringify({ reason }),
  });
}

export function getStaffPayments(token: string, page = 1, status?: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  return apiFetch<Paginated<Payment>>(`/staff/payments?${params}`, { token });
}

export function verifyPayment(token: string, paymentId: number) {
  return apiFetch<Payment>(`/staff/payments/${paymentId}/verify`, { method: "POST", token });
}

export function refundPayment(token: string, paymentId: number, amount: number, reason: string) {
  return apiFetch<Payment>(`/staff/payments/${paymentId}/refund`, {
    method: "POST",
    token,
    body: JSON.stringify({ amount, reason }),
  });
}

export function getFinancialReport(token: string) {
  return apiFetch<FinancialReport>("/finance/reports", { token });
}

/** Minimal lookups for building the fee-structure create form. */
export function getAcademicSessionOptions(token: string) {
  return apiFetch<{ id: number; name: string }[]>("/academic-sessions", { token });
}

export function getLevelOptions(token: string) {
  return apiFetch<{ id: number; name: string }[]>("/levels", { token });
}
