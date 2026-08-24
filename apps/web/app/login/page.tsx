"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    router.push("/join");
  };

  return (
    <div className={"flex flex-col justify-center items-center max-w-3xl mx-auto p-5"}>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="username" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="password" />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}