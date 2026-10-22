import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth-demo";
import { AdminChrome } from "./admin-chrome";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getStaffSession();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/staff"); // role gate #1 (UI); actions enforce again server-side
  return <AdminChrome user={user}>{children}</AdminChrome>;
}
