import { StaffLoginSuspense } from "@/components/staff-login-form";

export const metadata = { title: "Admin sign-in", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return <StaffLoginSuspense defaultNext="/admin" />;
}
