import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <GraduationCap className="h-8 w-8 text-blue-700" />
        <span className="text-xl font-bold text-blue-900">
          Академия Риэлторов
        </span>
      </Link>
      {children}
    </div>
  );
}
