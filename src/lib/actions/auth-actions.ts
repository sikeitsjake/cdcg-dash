// lib/actions/auth-actions.ts
"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function loginWithPin(inputPin: string) {
  const rawJson = process.env.STAFF_JSON;

  if (!rawJson) {
    return { success: false, error: "Server configuration error" };
  }

  const staffData = JSON.parse(rawJson);

  for (const [name, hash] of Object.entries(staffData)) {
    const isMatch = await bcrypt.compare(inputPin, hash as string);

    if (isMatch) {
      (await cookies()).set("session", name, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
      return { success: true };
    }
  }

  return { success: false };
}
