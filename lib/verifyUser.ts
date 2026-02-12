import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export interface AuthUser {
  id: string;
  username: string;
}

export async function verifyUser(): Promise<AuthUser | null> {
    
  const cookieStore = await cookies();
  const token = cookieStore.get("Hisab_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
    const { payload }: any = await jwtVerify(token, secret);

    return {
      id: payload.id,
      username: payload.username,
    };
  } catch (err) {
    return null;
  }
}
