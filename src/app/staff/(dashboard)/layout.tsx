import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth-demo";
import { StaffChrome } from "./staff-chrome";

export const dynamic = "force-dynamic";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await getStaffSession();
  if (!user) redirect("/staff/login");
  return <StaffChrome user={user}>{children}</StaffChrome>;
}
