import { auth } from "@/auth";
import { redirect } from "next/navigation";

// Root redirect — sends user to the right place based on auth/role
export default async function RootPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const role = session.user?.role;

  if (role === "ADMIN") redirect("/admin");
  if (role === "AUTHOR") redirect("/author/courses");
  if (role === "CURATOR") redirect("/curator/submissions");

  redirect("/dashboard");
}
