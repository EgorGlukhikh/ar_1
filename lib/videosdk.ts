import jwt from "jsonwebtoken";

const API_KEY = process.env.VIDEOSDK_API_KEY ?? "";
const SECRET = process.env.VIDEOSDK_SECRET ?? "";
const BASE_URL = "https://api.videosdk.live";

/** Generate a short-lived JWT for VideoSDK participants */
export function generateVideoSdkToken(permissions: string[] = ["allow_join"]): string {
  const payload = {
    apikey: API_KEY,
    permissions,
    version: 2,
  };
  return jwt.sign(payload, SECRET, { expiresIn: "24h", algorithm: "HS256" });
}

/** Create a new meeting room via VideoSDK REST API */
export async function createVideoSdkRoom(): Promise<{ roomId: string }> {
  const token = generateVideoSdkToken(["allow_join", "allow_mod"]);

  const res = await fetch(`${BASE_URL}/v2/rooms`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`VideoSDK create room failed: ${res.status}`);
  }

  const data = await res.json();
  return { roomId: data.roomId as string };
}

/** Validate that a room exists */
export async function validateRoom(roomId: string): Promise<boolean> {
  const token = generateVideoSdkToken();
  const res = await fetch(`${BASE_URL}/v2/rooms/validate/${roomId}`, {
    headers: { Authorization: token },
  });
  return res.ok;
}
