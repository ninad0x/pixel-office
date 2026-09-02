import { AccessToken } from 'livekit-server-sdk';

export async function generateToken(userId: string, roomId: string) {
  console.log("userId", userId, "roomId", roomId);
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity: userId }
  );
  at.addGrant({ roomJoin: true, room: roomId, canPublish: true, canSubscribe: true });
  console.log("token generated at", new Date().toISOString());
  return await at.toJwt();
}