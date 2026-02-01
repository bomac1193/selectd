"use server";

import { signIn } from "@/lib/auth";

export async function handleGoogleSignIn() {
  await signIn("google", { redirectTo: "/canon" });
}

export async function handleDiscordSignIn() {
  await signIn("discord", { redirectTo: "/canon" });
}
