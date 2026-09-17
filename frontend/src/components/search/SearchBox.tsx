"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function SearchBox({ initial }: { initial: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initial);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Matric number, name, application number, payment reference, course code…"
        className="w-full max-w-lg rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark"
      />
      <Button type="submit" variant="secondary">Search</Button>
    </form>
  );
}
