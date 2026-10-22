import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui";
import { TrackWidget } from "./track-widget";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Track your enquiry",
  description:
    "Track your Mediview Pharmacy enquiry with your reference number and phone number — see live status and next steps.",
  path: "/track",
});

export default function TrackPage() {
  return (
    <div className="container-page py-8 lg:py-10">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Track enquiry" }]} />
      <h1 className="text-[28px] font-bold text-brand-950 sm:text-[34px]">Track your enquiry</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-ink-soft">
        Submitted an enquiry? Follow its journey from receipt through pharmacist review to your
        quote — the same statuses our staff dashboard uses.
      </p>
      <div className="mt-8">
        <TrackWidget />
      </div>
    </div>
  );
}
