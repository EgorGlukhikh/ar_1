import { signOut } from "@/auth";

// Серверный экшн для выхода — работает даже без клиентского JS
export default function SignOutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button
          type="submit"
          className="rounded-xl bg-red-500 px-6 py-3 text-white font-semibold hover:bg-red-600"
        >
          Подтвердить выход
        </button>
      </form>
    </div>
  );
}
