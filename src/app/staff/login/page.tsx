import { StaffLoginSuspense } from "@/components/staff-login-form";

export const metadata = { title: "Staff sign-in", robots: { index: false, follow: false } };

export default function StaffLoginPage() {
  return <StaffLoginSuspense defaultNext="/staff" />;
}
