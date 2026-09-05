"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { dict, type Dict, type Lang } from "./i18n";
import { getLang, setLang, getTheme, setTheme, getStoredUser, getStoredUsers, type User, useMounted } from "./store";

interface AppCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  t: Dict;
  user: User | null;
  setUser: (u: User | null) => void;
  mounted: boolean;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  const [lang, setLangState] = useState<Lang>("en");
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    if (!mounted) return;
    setLangState(getLang());
    setThemeState(getTheme());
    const stored = getStoredUser();
    setUserState(stored ?? getStoredUsers()[0] ?? null);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, mounted]);

  const value: AppCtx = {
    lang,
    setLang: (l) => {
      setLangState(l);
      setLang(l);
    },
    theme,
    setTheme: (t) => {
      setThemeState(t);
      setTheme(t);
    },
    t: dict[lang] as unknown as Dict,
    user,
    setUser: (u) => {
      setUserState(u);
      if (u) window.localStorage.setItem("aquapure_user", JSON.stringify(u));
      else window.localStorage.removeItem("aquapure_user");
    },
    mounted,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
