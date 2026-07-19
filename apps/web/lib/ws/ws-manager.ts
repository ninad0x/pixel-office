
import { Op, ServerMessage } from "@/types/protocol";

class WSManager {
  private conn: WebSocket | null = null;
  private roomId: string | null = null;
  private listeners: Map<number, Set<(data: any) => void>> = new Map();
  private messageQueue: string[] = [];
  private reconnectAttempts = 0;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private shouldReconnect = true;

  private startHeartBeat = () => {
    this.heartbeatInterval = setInterval(() => {
      try {
        this.conn?.send(JSON.stringify({ op: Op.PING, data: {} }))
      } catch (error) {
        console.error("Heartbeat failed ", error)
      }
    }, 15 * 1000)
  }

  private stopHeartBeat = () => {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }


  private handleMessage = (message: ServerMessage) => {
    const callbacks = this.listeners.get(message.op);
    callbacks?.forEach((cb) => cb(message.data));
  };

  private reconnect = () => {
    if (!this.roomId) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
    setTimeout(() => this.connect(this.roomId!), delay);
  };

  connect = (roomId: string) => {
    this.roomId = roomId;
    this.shouldReconnect = true;

    const url = `${process.env.NEXT_PUBLIC_WS_URL}/ws?roomId=${roomId}`;
    this.conn = new WebSocket(url);

    this.conn.onopen = () => {
      // reset reconnectAttempts
      this.reconnectAttempts = 0
      // flush queued messages
      while (this.messageQueue.length > 0) {
        const msg = this.messageQueue.shift()
        if (msg) this.conn?.send(msg)
      }

      // start heartbeat
      this.startHeartBeat()
    };

    this.conn.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (e) {
        console.error("Failedto parse WS message, ", e)
      }
    };

    this.conn.onclose = () => {
      // this.stopHeartBeat()
      if (this.shouldReconnect) {
        this.reconnect()
      }
    };

    this.conn.onerror = (err) => {
      console.error("WS error", err);
    };
  };

  send = (op: number, data: any) => {
    const message = JSON.stringify({ op, data })

    if (this.conn?.readyState === WebSocket.OPEN) {
      this.conn.send(message)
    } else {
      this.messageQueue.push(message)
    }
  }

  disconnect = () => {
    this.shouldReconnect = false
    this.stopHeartBeat()
    this.conn?.close()
    this.conn = null
  }

  on = (op: number, callback: (data: any) => void) => {
    if (!this.listeners.has(op)) this.listeners.set(op, new Set());
    this.listeners.get(op)!.add(callback);
  };

  off = (op: number, callback: (data: any) => void) => {
    this.listeners.get(op)?.delete(callback);
  };

}


export const wsManager = new WSManager()