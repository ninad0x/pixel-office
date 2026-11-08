export type TicketResult =
  | { ok: true; ticket: string }
  | { ok: false; retry: boolean; unauthorized?: true };

export async function fetchTicket(roomId: string): Promise<TicketResult> {
  try {
    const res = await fetch(
      `/api/auth/ws-ticket?roomId=${encodeURIComponent(roomId)}`,
      { method: "POST" }
    );
    if (res.status === 401) return { ok: false, retry: false, unauthorized: true };
    if (!res.ok) return { ok: false, retry: true };
    const { ticket } = await res.json();
    if (!ticket) return { ok: false, retry: true };
    return { ok: true, ticket };
  } catch {
    return { ok: false, retry: true };
  }
}