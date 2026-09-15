import "server-only";
import { apiFetch } from "./client";
import type { Paginated } from "./hod";

export type TicketMessage = {
  id: number;
  message: string;
  is_staff_reply: boolean;
  attachment_name: string | null;
  created_at: string;
  user: { id: number; name: string } | null;
};

export type Ticket = {
  id: number;
  category: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  user?: { id: number; name: string; email: string } | null;
  assigned_to?: { id: number; name: string } | null;
  messages?: TicketMessage[];
};

export function getMyTickets(token: string, page = 1) {
  return apiFetch<Paginated<Ticket>>(`/tickets?page=${page}`, { token });
}

export function getTicket(token: string, id: number) {
  return apiFetch<Ticket>(`/tickets/${id}`, { token });
}

export function createTicket(token: string, data: { category: string; subject: string; description: string; priority?: string }) {
  return apiFetch<Ticket>("/tickets", { method: "POST", token, body: JSON.stringify(data) });
}

export function replyToTicket(token: string, id: number, message: string) {
  return apiFetch<Ticket>(`/tickets/${id}/reply`, { method: "POST", token, body: JSON.stringify({ message }) });
}

export function updateTicketStatus(token: string, id: number, status: string, assignedTo?: number) {
  return apiFetch<Ticket>(`/tickets/${id}/status`, {
    method: "POST",
    token,
    body: JSON.stringify({ status, assigned_to: assignedTo }),
  });
}
