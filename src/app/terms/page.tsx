import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui";
import { BUSINESS } from "@/lib/brand";

export const metadata = buildMetadata({
  title: "Terms of use",
  description: "Terms governing use of the Mediview Pharmacy website and its enquiry service.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="container-page max-w-3xl py-8 lg:py-10">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Terms of use" }]} />
      <h1 className="text-[28px] font-bold text-brand-950 sm:text-[34px]">Terms of use</h1>
      <p className="mt-2 rounded-sm bg-enquiry-soft px-4 py-2.5 text-[13px] font-medium text-enquiry">
        Draft for demonstration — to be reviewed and adopted by Mediview Pharmacy with legal
        counsel before production use.
      </p>
      <div className="mt-8 space-y-7 text-[15px] leading-relaxed text-ink-soft">
        <section>
          <h2 className="font-display text-[18px] font-bold text-ink">1. This website</h2>
          <p className="mt-2">
            These terms govern use of the {BUSINESS.name} website and its enquiry service. By
            submitting an enquiry you agree to these terms and to our{" "}
            <Link href="/privacy" className="link-under">privacy notice</Link>.
          </p>
        </section>
        <section>
          <h2 className="font-display text-[18px] font-bold text-ink">2. Enquiries are not orders</h2>
          <p className="mt-2">
            Submitting an enquiry requests prices and availability. A contract of sale is formed
            only when the pharmacy confirms a quote and you accept it. No payment is collected on
            this website.
          </p>
        </section>
        <section>
          <h2 className="font-display text-[18px] font-bold text-ink">3. Medicines & prescriptions</h2>
          <p className="mt-2">
            Prescription-only medicines are supplied only against a valid prescription verified by
            the responsible pharmacist, in quantities the prescription authorizes. Controlled
            medicines are not available through this website. Product information on this site is
            not medical advice — always follow your prescriber’s and the pharmacist’s directions.
          </p>
        </section>
        <section>
          <h2 className="font-display text-[18px] font-bold text-ink">4. Accuracy</h2>
          <p className="mt-2">
            We work to keep listings accurate, but product availability and specification are
            confirmed at quote stage. If we cannot supply an item, we will tell you and, where
            appropriate, the pharmacist may propose an alternative for your prescriber’s approval.
          </p>
        </section>
        <section>
          <h2 className="font-display text-[18px] font-bold text-ink">5. Acceptable use</h2>
          <p className="mt-2">
            Do not misuse the service: no automated scraping, no false prescription claims, no
            submitting another person’s data without authority, and no attempting to obtain
            prohibited medicines. Rate limiting and monitoring protect all users.
          </p>
        </section>
        <section>
          <h2 className="font-display text-[18px] font-bold text-ink">6. Demonstration status</h2>
          <p className="mt-2">
            This build is a demonstration platform created by Midex Edits. Enquiries remain inside
            the demo environment; nothing is transmitted to the operating pharmacy. Real service
            terms will replace this page at production launch.
          </p>
        </section>
        <section>
          <h2 className="font-display text-[18px] font-bold text-ink">7. Contact</h2>
          <p className="mt-2">
            {BUSINESS.name}, {BUSINESS.address.line1}, {BUSINESS.address.line2} ·{" "}
            {BUSINESS.phone} · {BUSINESS.email}
          </p>
        </section>
      </div>
    </div>
  );
}
