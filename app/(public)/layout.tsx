import { Navbar } from "@/components/layout/navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
      <footer className="border-t bg-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Академия Риэлторов. Все права защищены.
        </div>
      </footer>
    </div>
  );
}
