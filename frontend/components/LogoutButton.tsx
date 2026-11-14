"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/bff/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button className="btn btn-ghost btn-sm" onClick={logout} disabled={busy}>
      sign out
    </button>
  );
}
