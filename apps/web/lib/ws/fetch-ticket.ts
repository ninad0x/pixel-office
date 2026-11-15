export type TicketResult =
  | { ok: true; ticket: string }
  | { ok: false; retry: boolean; unauthorized?: true };

export async function fetchTicket(roomId: string): Promise<TicketResult> {
  try {
    const res = await fetch(
      `/api/auth/ws-ticket?roomId=${encodeURIComponent(roomId)}`,
      { method: "POST" }
    );

    // Unauthorized - no session
    if (res.status === 401)  {
      return { ok: false, retry: false, unauthorized: true }
    }

    // no access to room or room does not exist
    if (res.status === 403 || res.status === 404) {
      return { ok: false, retry: false }
    }

    if (!res.ok) {
      return { ok: false, retry: true }
    }
    
    const { ticket } = await res.json();

    if (!ticket) return { ok: false, retry: true }
    return { ok: true, ticket };

  } catch {
    return { ok: false, retry: true };
  }
}