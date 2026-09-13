"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export function StudentSearchForm({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(q.trim() ? `/staff/students?q=${encodeURIComponent(q.trim())}` : "/staff/students");
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md gap-2">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Name, matric number, email, or phone"
        className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark"
      />
      <button type="submit" className="rounded-md border border-border bg-white px-4 py-2 text-sm text-ink hover:border-sky-dark">
        Search
      </button>
    </form>
  );
}
