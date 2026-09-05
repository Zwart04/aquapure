"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { signInUser, registerUser } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { Droplets } from "lucide-react";

export default function LoginPage() {
  const { t, lang, setUser } = useApp();
  const { push } = useToast();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("demo@aquapure.id");
  const [password, setPassword] = useState("aquapure");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"operator" | "manager">("operator");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [mode]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signin") {
      const r = signInUser(email, password);
      if (!r.ok) { setError(r.error || "invalid"); return; }
      setUser(r.user || null);
      push(t.toast.signedIn, "success");
      router.push("/dashboard");
    } else {
      if (!name.trim()) { setError("invalid"); return; }
      const r = registerUser({ email, password, name, role });
      if (!r.ok) { setError(r.error || "invalid"); return; }
      setUser(r.user || null);
      push(t.auth.registered, "success");
      router.push("/dashboard");
    }
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-aqua-700 dark:text-aqua-300">
          <Droplets className="h-5 w-5" />
          <span className="font-semibold">{t.appName}</span>
        </div>
        <h1 className="text-xl font-semibold mb-1">{t.auth.title}</h1>
        <p className="text-sm text-[color:var(--color-muted)] mb-5">{t.auth.subtitle}</p>
        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <label className="block">
              <span className="text-xs font-medium">{t.auth.name}</span>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg)]" />
            </label>
          )}
          <label className="block">
            <span className="text-xs font-medium">{t.auth.email}</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg)]" />
          </label>
          <label className="block">
            <span className="text-xs font-medium">{t.auth.password}</span>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg)]" />
          </label>
          {mode === "signup" && (
            <label className="block">
              <span className="text-xs font-medium">{t.auth.role}</span>
              <select value={role} onChange={(e) => setRole(e.target.value as "operator" | "manager")} className="mt-1 w-full px-3 py-2 rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
                <option value="operator">{t.auth.roleOperator}</option>
                <option value="manager">{t.auth.roleManager}</option>
              </select>
            </label>
          )}
          {error && <div className="text-sm text-red-600">{error === "exists" ? t.auth.exists : t.auth.invalid}</div>}
          <button type="submit" className="w-full h-10 rounded bg-aqua-600 text-white font-medium hover:bg-aqua-700">
            {mode === "signin" ? t.auth.signIn : t.auth.signUp}
          </button>
          <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="w-full text-sm text-aqua-700 hover:underline">
            {mode === "signin" ? t.auth.switchToSignup : t.auth.switchToLogin}
          </button>
          <p className="text-xs text-[color:var(--color-muted)] text-center pt-2">{t.auth.demoHint}</p>
        </form>
      </div>
    </div>
  );
}
