"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateRoomForm({ mapId }: { mapId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/rooms", {
      // CONFIRM
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), mapId, isPublic }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not create room. The name may already exist.");
      return;
    }
    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      <input value={name} onChange={(e) => setName(e.target.value)} required />
      <select
        value={String(isPublic)}
        onChange={(e) => setIsPublic(e.target.value === "true")}
      >
        <option value="true">Public</option>
        <option value="false">Private</option>
      </select>
      <button disabled={loading}>Create</button>
      {error && <p>{error}</p>}
    </form>
  );
}
