"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import type { SiteContent } from "@/lib/types";
import { saveContentAction } from "../../actions";

export function ContentForm({ content, featuredSlugs }: { content: SiteContent; featuredSlugs: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await saveContentAction({
        announcementText: String(fd.get("announcementText") ?? ""),
        announcementEnabled: fd.get("announcementEnabled") === "on",
        openingHours: String(fd.get("openingHours") ?? ""),
        openingHoursConfirmed: fd.get("openingHoursConfirmed") === "on",
        aboutHeadline: String(fd.get("aboutHeadline") ?? ""),
        aboutBody: String(fd.get("aboutBody") ?? ""),
        footerNote: String(fd.get("footerNote") ?? ""),
        featuredSlugs: String(fd.get("featuredSlugs") ?? ""),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setError(res.error ?? "Save failed.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-3xl divide-y divide-line">
      <div className="p-5 sm:p-6">
        <h2 className="font-display text-[15px] font-bold tracking-[0.14em] text-ink-faint uppercase">Announcement bar</h2>
        <label className="mt-3 block">
          <span className="field-label">Message (shown site-wide)</span>
          <input id="announcementText" name="announcementText" className="field" maxLength={200} defaultValue={content.announcement.text} />
        </label>
        <label className="mt-3 flex items-center gap-2 text-[14px] text-ink-soft">
          <input type="checkbox" name="announcementEnabled" className="h-4 w-4 accent-brand-700" defaultChecked={content.announcement.enabled} />
          Announcement visible
        </label>
      </div>

      <div className="p-5 sm:p-6">
        <h2 className="font-display text-[15px] font-bold tracking-[0.14em] text-ink-faint uppercase">Opening hours</h2>
        <label className="mt-3 block">
          <span className="field-label">Hours text</span>
          <input id="openingHours" name="openingHours" className="field" maxLength={200} defaultValue={content.openingHours.text} placeholder="e.g. Mon–Sat 8:00–20:00 · Sun 12:00–18:00" />
        </label>
        <label className="mt-3 flex items-start gap-2 text-[14px] text-ink-soft">
          <input type="checkbox" name="openingHoursConfirmed" className="mt-1 h-4 w-4 accent-brand-700" defaultChecked={content.openingHours.confirmed} />
          <span>
            These hours are <strong>confirmed by the pharmacy</strong> — until this box is checked the
            storefront honestly shows “pending confirmation” instead of publishing unverified hours.
          </span>
        </label>
      </div>

      <div className="p-5 sm:p-6">
        <h2 className="font-display text-[15px] font-bold tracking-[0.14em] text-ink-faint uppercase">About page</h2>
        <label className="mt-3 block">
          <span className="field-label">Headline</span>
          <input id="aboutHeadline" name="aboutHeadline" className="field" maxLength={120} defaultValue={content.about.headline} />
        </label>
        <label className="mt-3 block">
          <span className="field-label">Body (verified facts only)</span>
          <textarea id="aboutBody" name="aboutBody" rows={7} className="field" maxLength={4000} defaultValue={content.about.body} />
        </label>
      </div>

      <div className="p-5 sm:p-6">
        <h2 className="font-display text-[15px] font-bold tracking-[0.14em] text-ink-faint uppercase">Homepage featured products</h2>
        <label className="mt-3 block">
          <span className="field-label">Product slugs (comma-separated, up to 8)</span>
          <input id="featuredSlugs" name="featuredSlugs" className="field font-mono text-[13px]" defaultValue={featuredSlugs} placeholder="panadol-actifast-tablets-14-tablets, omron-m2-basic-blood-pressure-monitor" />
        </label>
        <p className="mt-1.5 text-[12px] text-ink-faint">
          Leave empty to use the built-in “featured” flags. Slugs are visible on each product’s edit page.
        </p>
      </div>

      <div className="p-5 sm:p-6">
        <h2 className="font-display text-[15px] font-bold tracking-[0.14em] text-ink-faint uppercase">Footer note</h2>
        <label className="mt-3 block">
          <span className="sr-only">Footer note</span>
          <textarea id="footerNote" name="footerNote" rows={2} className="field" maxLength={400} defaultValue={content.footerNote} />
        </label>
      </div>

      {error && <p role="alert" className="bg-rx-soft px-5 py-3 text-[13.5px] text-rx sm:px-6">{error}</p>}
      {saved && !error && (
        <p role="status" className="bg-ok-soft px-5 py-3 text-[13.5px] text-ok sm:px-6">Saved — the storefront now reflects these changes.</p>
      )}
      <div className="p-5 sm:p-6">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
          Save content
        </button>
      </div>
    </form>
  );
}
