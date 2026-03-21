"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Имя должно содержать не менее 2 символов"),
    email: z.string().email("Введите корректный email"),
    password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

function FloatingInput({
  id,
  label,
  type = "text",
  autoComplete,
  error,
  registration,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registration: any;
}) {
  return (
    <div className="flex flex-col gap-y-1">
      <div className="relative rounded-lg border border-gray-200 bg-gray-50 transition-all duration-200 focus-within:border-[#6E8AFA] focus-within:bg-white">
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          className="w-full bg-transparent rounded-lg outline-none pt-6 pb-1.5 px-4 text-gray-900 text-sm peer"
          placeholder=" "
          {...registration}
        />
        <label
          htmlFor={id}
          className="absolute left-4 top-4 text-sm text-gray-400 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-4 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-xs peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#6E8AFA]"
        >
          {label}
        </label>
      </div>
      {error && <p className="text-xs text-red-500 px-1">{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message ?? "Ошибка регистрации");
        return;
      }

      toast.success("Аккаунт создан! Войдите в систему.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[288px] xs:max-w-[432px] md:max-w-[512px] lg:max-w-[410px] xl:max-w-[416px] 2xl:max-w-[528px]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-y-8 md:gap-y-10"
      >
        <h1 className="font-semibold text-gray-900 leading-tight text-2xl xs:text-[32px] xs:leading-[42px] lg:text-[40px] lg:leading-[52px] text-center xl:text-start">
          Создать аккаунт
        </h1>

        <div className="flex flex-col gap-y-4">
          <FloatingInput
            id="name"
            label="Имя"
            autoComplete="name"
            error={errors.name?.message}
            registration={register("name")}
          />
          <FloatingInput
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            registration={register("email")}
          />
          <FloatingInput
            id="password"
            label="Пароль (минимум 6 символов)"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            registration={register("password")}
          />
          <FloatingInput
            id="confirmPassword"
            label="Повторите пароль"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            registration={register("confirmPassword")}
          />

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-3 h-14 rounded-lg bg-[#6E8AFA] text-white text-lg font-normal px-8 w-full transition-all duration-300 hover:bg-[#5A78F0] active:bg-[#4A68E0] disabled:opacity-60 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Создаём аккаунт...
              </>
            ) : (
              <>
                <p>Зарегистрироваться</p>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>

          <div className="text-center text-sm text-gray-500">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="font-medium text-[#6E8AFA] hover:underline">
              Войти
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
