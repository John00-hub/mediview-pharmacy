"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Archive, Loader2 } from "lucide-react";
import { archiveProductAction } from "../../actions";

export function ArchiveButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        className="btn-quiet btn-sm"
        disabled={pending}
        aria-label={`Archive ${name}`}
        onClick={() => {
          if (!window.confirm(`Archive “${name}”? It will be hidden from the storefront.`)) return;
          setError(null);
          startTransition(async () => {
            const res = await archiveProductAction(id);
            if (!res.ok) setError(res.error ?? "Archive failed");
            router.refresh();
          });
        }}
      >
        {pending ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : <Archive size={13} aria-hidden="true" />}
      </button>
      {error && <span className="sr-only" role="alert">{error}</span>}
    </>
  );
}
