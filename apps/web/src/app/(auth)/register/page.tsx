"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: doRegister } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormData) => {
    setError(null);
    try {
      await doRegister(values.email, values.password);
      router.push("/boards");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Register failed";
      setError(message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm border rounded-xl p-6">
        <h1 className="text-xl font-semibold">Create account</h1>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label className="text-sm">Email</label>
            <input
              className="w-full border rounded-md p-2"
              {...register("email")}
            />
            {formState.errors.email && (
              <p className="text-sm text-red-600">
                {formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm">Password</label>
            <input
              type="password"
              className="w-full border rounded-md p-2"
              {...register("password")}
            />
            {formState.errors.password && (
              <p className="text-sm text-red-600">
                {formState.errors.password.message}
              </p>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            className="w-full bg-black text-white rounded-md p-2 disabled:opacity-50"
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting ? "Creating…" : "Create"}
          </button>

          <button
            type="button"
            className="w-full border rounded-md p-2"
            onClick={() => router.push("/login")}
          >
            Back to login
          </button>
        </form>
      </div>
    </main>
  );
}
