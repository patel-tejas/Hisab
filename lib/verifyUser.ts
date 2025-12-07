import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export interface AuthUser {
  id: string;
  username: string;
}

export async function verifyUser(): Promise<AuthUser> {
    
  const cookieStore = await cookies();
  const token = cookieStore.get("Hisab_token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
    const { payload }: any = await jwtVerify(token, secret);

    return {
      id: payload.id,
      username: payload.username,
    };
  } catch (err) {
    throw new Error("Invalid token");
  }
}
