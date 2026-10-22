import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui";
import { BUSINESS } from "@/lib/brand";

export const metadata = buildMetadata({
  title: "Privacy notice",
  description:
    "How Mediview Pharmacy collects, uses and protects your personal and health data, in line with the Nigeria Data Protection Act.",
  path: "/privacy",
});

/**
 * Privacy notice draft — aligned to the Nigeria Data Protection Act 2023.
 * Flagged for client legal review before production (report §12.2C, §15).
 */
export default function PrivacyPage() {
  return (
    <div className="container-page max-w-3xl py-8 lg:py-10">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Privacy notice" }]} />
      <h1 className="text-[28px] font-bold text-brand-950 sm:text-[34px]">Privacy notice</h1>
      <p className="mt-2 rounded-sm bg-enquiry-soft px-4 py-2.5 text-[13px] font-medium text-enquiry">
        Draft for demonstration — to be reviewed and adopted by Mediview Pharmacy with legal
        counsel before production use.
      </p>

      <div className="prose-legal mt-8 space-y-7 text-[15px] leading-relaxed text-ink-soft">
        <section>
          <h2 className="font-display text-[18px] font-bold text-ink">1. Who we are</h2>
          <p className="mt-2">
            {BUSINESS.name} (“the pharmacy”, “we”) operates from {BUSINESS.address.line1},{" "}
            {BUSINESS.address.line2}. Contact: {BUSINESS.phone} · {BUSINESS.email}. This notice
            explains how we handle personal data collected through this website, in line with the
            Nigeria Data Protection Act 2023 (NDPA) and the NDPR.
          </p>
        </section>
        <section>
          <h2 className="font-display text-[18px] font-bold text-ink">2. What we collect</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li><strong>Enquiry data:</strong> name, phone number, optional email, pickup/delivery preference and optional delivery address.</li>
            <li><strong>Health-related data:</strong> the medicines you enquire about and any prescription information you choose to share. Health data is <strong>sensitive personal data</strong> and receives the highest protection.</li>
            <li><strong>Technical data:</strong> minimal logs required for security and rate limiting (e.g. request timestamps, anonymized rate-limit keys).</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-[18px] font-bold text-ink">3. Why we process it (legal bases)</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li><strong>Your request:</strong> to prepare quotes, verify prescriptions and fulfil orders you initiate.</li>
            <li><strong>Legal & professional obligations:</strong> pharmacy regulations require prescription verification and dispensing records under pharmacist supervision.</li>
            <li><strong>Consent:</strong> for prescription document uploads and any marketing communication (only where you explicitly opt in).</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-[18px] font-bold text-ink">4. Prescription documents</h2>
          <p className="mt-2">
            Prescription files are stored in private, encrypted storage, accessible only to staff
            with the pharmacist role through short-lived signed links. Access is logged. Files are
            retained only as long as professional record-keeping obligations require (retention
            period to be confirmed by the pharmacy’s Superintendent Pharmacist). In this
            demonstration build, prescription files are <strong>never transmitted or stored</strong> —
            only a declared file name is recorded, and synthetic files only.
          </p>
        </section>
        <section>
          <h2 className="font-display text-[18px] font-bold text-ink">5. Who sees your data</h2>
          <p className="mt-2">
            Only authorized pharmacy staff, on a need-to-know basis: sales staff see enquiry
            contact details; prescription content is restricted to pharmacist roles. We do not sell
            personal data. Service providers (hosting, database, messaging) process data under
            contractual obligations consistent with the NDPA; production processors and their
            locations will be listed here after client confirmation.
          </p>
        </section>
        <section>
          <h2 className="font-display text-[18px] font-bold text-ink">6. Your rights</h2>
          <p className="mt-2">
            Under the NDPA you may request access to, correction of, or deletion of your personal
            data, object to or restrict processing, and withdraw consent (without affecting
            processing already lawfully done). Requests: {BUSINESS.email}. You may also complain to
            the Nigeria Data Protection Commission (NDPC).
          </p>
        </section>
        <section>
          <h2 className="font-display text-[18px] font-bold text-ink">7. Security</h2>
          <p className="mt-2">
            Transport encryption (HTTPS), role-based access control, database-level row security,
            rate limiting, audit logging and least-privilege principles apply across this platform.
            Security architecture is documented in the project’s production-readiness checklist.
          </p>
        </section>
        <section>
          <h2 className="font-display text-[18px] font-bold text-ink">8. Demonstration notice</h2>
          <p className="mt-2">
            This website is currently a demonstration build by Midex Edits. Enquiries submitted
            here remain inside the demo environment and are not transmitted to the real pharmacy.
            Do not submit real patient data or real prescriptions to this demo. See{" "}
            <Link href="/terms" className="link-under">terms of use</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
