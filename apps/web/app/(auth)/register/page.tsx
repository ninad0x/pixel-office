"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) return

    const next = new URLSearchParams(window.location.search).get("next")

    const destination = 
      next?.startsWith("/") && !next.startsWith("//") 
        ? next 
        : "/dashboard"

    router.replace(destination)

  };

  return (
    <div className={"flex flex-col justify-center items-center max-w-3xl mx-auto p-5"}>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="username" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="password" />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}