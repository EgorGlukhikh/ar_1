"use client";

import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Неверный email или пароль");
      } else {
        toast.success("Добро пожаловать!");
        router.push(callbackUrl);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[288px] xs:max-w-[432px] md:max-w-[512px] lg:max-w-[410px] xl:max-w-[416px] 2xl:max-w-[528px]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-y-8 md:gap-y-10 lg:gap-y-12"
      >
        <h1 className="font-semibold text-gray-900 leading-tight text-2xl xs:text-[32px] xs:leading-[42px] lg:text-[40px] lg:leading-[52px] text-center xl:text-start">
          Вход в обучающую{" "}
          <br className="hidden xs:block" />
          платформу
        </h1>

        <div className="flex flex-col gap-y-5">
          {/* Email input */}
          <div className="flex flex-col gap-y-1">
            <div className="relative rounded-lg border border-gray-200 bg-gray-50 transition-all duration-200 focus-within:border-[#6E8AFA] focus-within:bg-white">
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full bg-transparent rounded-lg outline-none pt-6 pb-1.5 px-4 text-gray-900 text-sm peer"
                placeholder=" "
                {...register("email")}
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-4 text-sm text-gray-400 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-4 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-xs peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#6E8AFA]"
              >
                Email
              </label>
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 px-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-y-1">
            <div className="relative rounded-lg border border-gray-200 bg-gray-50 transition-all duration-200 focus-within:border-[#6E8AFA] focus-within:bg-white">
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="w-full bg-transparent rounded-lg outline-none pt-6 pb-1.5 px-4 text-gray-900 text-sm peer"
                placeholder=" "
                {...register("password")}
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-4 text-sm text-gray-400 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-4 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-xs peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#6E8AFA]"
              >
                Пароль
              </label>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 px-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-3 h-14 rounded-lg bg-[#6E8AFA] text-white text-lg font-normal px-8 w-full transition-all duration-300 hover:bg-[#5A78F0] active:bg-[#4A68E0] disabled:opacity-60 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Входим...
              </>
            ) : (
              <>
                <p>Войти</p>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>

          {/* Register link */}
          <div className="text-center text-sm text-gray-500">
            Нет аккаунта?{" "}
            <Link
              href="/register"
              className="font-medium text-[#6E8AFA] hover:underline"
            >
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-96 w-full max-w-md animate-pulse rounded-lg bg-gray-100" />
      }
    >
      <LoginForm />
    </Suspense>
  );
}
