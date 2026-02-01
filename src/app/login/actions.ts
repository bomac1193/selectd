"use server";

import { signIn } from "@/lib/auth";

export async function handleGoogleSignIn() {
  await signIn("google", { redirectTo: "/selection" });
}

export async function handleDiscordSignIn() {
  await signIn("discord", { redirectTo: "/selection" });
}
