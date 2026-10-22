import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui";
import { EnquiryForm } from "./enquiry-form";
import { EnquirySummaryAside } from "./summary-aside";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Submit your enquiry",
  description: "Share your contact details and pickup or delivery preference to request current prices and availability from Mediview Pharmacy.",
  path: "/enquiry",
  noIndex: true,
});

export default function EnquiryPage() {
  return (
    <div className="container-page py-8 lg:py-10">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Enquiry basket", href: "/basket" },
          { name: "Your details" },
        ]}
      />
      <h1 className="text-[28px] font-bold text-brand-950 sm:text-[34px]">Request prices & availability</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-ink-soft">
        One minute of details, and our team prepares your quote — current prices, availability and
        any prescription requirements confirmed before you commit to anything.
      </p>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <EnquiryForm />
        <EnquirySummaryAside />
      </div>
    </div>
  );
}
