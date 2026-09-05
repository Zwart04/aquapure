// AquaPure localStorage-backed store with mounted-guard friendly hydration pattern
"use client";

import { useEffect, useState } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "operator" | "manager";
  createdAt: number;
}

export interface AlertEntry {
  id: string;
  ts: number;
  sensorId: string;
  parameter: string;
  value: number;
  severity: "marginal" | "critical";
  message: string;
}

export interface Consumable {
  id: string;
  name: string;
  sensorId: string;
  remaining: number;
  total: number;
  reorderAt: number;
  unit: string;
}

export interface FinanceEntry {
  id: string;
  ts: number;
  source: "auto-alert" | "auto-consumable" | "auto-export";
  description: string;
  amountIdr: number;
}

export interface ReportEntry {
  id: string;
  ts: number;
  sensorId: string;
  fromTs: number;
  toTs: number;
  fileName: string;
}

export interface ClassificationEntry {
  id: string;
  ts: number;
  input: { ph: number; tds: number; cl: number; turb: number; temp: number };
  score: number;
  status: "safe" | "marginal" | "critical";
}

export interface VisitSource {
  source: string;
  count: number;
}

interface Store {
  user: User | null;
  users: User[];
  alerts: AlertEntry[];
  consumables: Consumable[];
  finance: FinanceEntry[];
  reports: ReportEntry[];
  classifications: ClassificationEntry[];
  visits: VisitSource[];
}

const KEY_USERS = "aquapure_users";
const KEY_USER = "aquapure_user";
const KEY_ALERTS = "aquapure_alerts";
const KEY_CONSUMABLES = "aquapure_consumables";
const KEY_FINANCE = "aquapure_finance";
const KEY_REPORTS = "aquapure_reports";
const KEY_CLASSIF = "aquapure_classifications";
const KEY_VISITS = "aquapure_visits";
const KEY_SOURCE = "aquapure_source";
const KEY_LANG = "aquapure_lang";
const KEY_THEME = "aquapure_theme";

export const DEFAULT_USERS: User[] = [
  {
    id: "demo-operator",
    email: "demo@aquapure.id",
    name: "AquaPure Demo Operator",
    role: "operator",
    createdAt: 1700000000000,
  },
];

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

export function getStoredUsers(): User[] {
  return readJSON<User[]>(KEY_USERS, DEFAULT_USERS);
}

export function getStoredUser(): User | null {
  return readJSON<User | null>(KEY_USER, null);
}

// ---- Auth ----
export function registerUser(input: { email: string; password: string; name: string; role: User["role"] }): { ok: boolean; error?: string; user?: User } {
  const users = getStoredUsers();
  if (users.find((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    return { ok: false, error: "exists" };
  }
  const user: User = {
    id: crypto.randomUUID(),
    email: input.email,
    name: input.name,
    role: input.role,
    createdAt: Date.now(),
  };
  users.push(user);
  writeJSON(KEY_USERS, users);
  writeJSON(KEY_USER, user);
  return { ok: true, user };
}

export function signInUser(email: string, password: string): { ok: boolean; error?: string; user?: User } {
  if (!email.includes("@") || password.length < 6) return { ok: false, error: "invalid" };
  const users = getStoredUsers();
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!found) {
    // local-first: auto-bootstrap on first sign-in
    return registerUser({ email, password, name: email.split("@")[0], role: "operator" });
  }
  writeJSON(KEY_USER, found);
  return { ok: true, user: found };
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY_USER);
}

// ---- Alerts ----
export function getAlerts(): AlertEntry[] {
  return readJSON<AlertEntry[]>(KEY_ALERTS, []);
}

export function pushAlert(entry: AlertEntry) {
  const all = getAlerts();
  all.unshift(entry);
  // keep last 500
  writeJSON(KEY_ALERTS, all.slice(0, 500));
}

export function clearAlerts() {
  writeJSON(KEY_ALERTS, []);
}

// ---- Consumables ----
export function getConsumables(): Consumable[] {
  return readJSON<Consumable[]>(
    KEY_CONSUMABLES,
    [
      { id: "c1", name: "RO Cartridge 0.5u", sensorId: "S01", remaining: 78, total: 100, reorderAt: 20, unit: "%" },
      { id: "c2", name: "Chlorine Tablet", sensorId: "S01", remaining: 60, total: 100, reorderAt: 25, unit: "tab" },
      { id: "c3", name: "RO Cartridge 0.5u", sensorId: "S02", remaining: 42, total: 100, reorderAt: 20, unit: "%" },
      { id: "c4", name: "pH Buffer Solution", sensorId: "S04", remaining: 85, total: 100, reorderAt: 20, unit: "mL" },
      { id: "c5", name: "Aerator Filter", sensorId: "S05", remaining: 35, total: 100, reorderAt: 20, unit: "%" },
    ]
  );
}

export function saveConsumables(list: Consumable[]) {
  writeJSON(KEY_CONSUMABLES, list);
}

export function addConsumable(c: Omit<Consumable, "id">) {
  const list = getConsumables();
  list.push({ id: crypto.randomUUID(), ...c });
  saveConsumables(list);
}

export function decrementConsumable(sensorId: string) {
  const list = getConsumables();
  let changed = false;
  for (const c of list) {
    if (c.sensorId === sensorId && c.remaining > 0) {
      c.remaining = Math.max(0, c.remaining - 0.1);
      changed = true;
    }
  }
  if (changed) saveConsumables(list);
  return list;
}

// ---- Finance ----
export function getFinance(): FinanceEntry[] {
  return readJSON<FinanceEntry[]>(KEY_FINANCE, []);
}

export function pushFinance(entry: FinanceEntry) {
  const all = getFinance();
  all.unshift(entry);
  writeJSON(KEY_FINANCE, all.slice(0, 1000));
}

// ---- Reports ----
export function getReports(): ReportEntry[] {
  return readJSON<ReportEntry[]>(KEY_REPORTS, []);
}

export function pushReport(entry: ReportEntry) {
  const all = getReports();
  all.unshift(entry);
  writeJSON(KEY_REPORTS, all.slice(0, 50));
}

// ---- Classifications ----
export function getClassifications(): ClassificationEntry[] {
  return readJSON<ClassificationEntry[]>(KEY_CLASSIF, []);
}

export function pushClassification(entry: ClassificationEntry) {
  const all = getClassifications();
  all.unshift(entry);
  writeJSON(KEY_CLASSIF, all.slice(0, 50));
}

// ---- Visits (UTM / localStorage) ----
export function recordVisit(source: string) {
  const list = readJSON<VisitSource[]>(KEY_VISITS, []);
  const found = list.find((v) => v.source === source);
  if (found) found.count += 1;
  else list.push({ source, count: 1 });
  writeJSON(KEY_VISITS, list);
}

export function getVisits(): VisitSource[] {
  if (typeof window === "undefined") return [];
  let source = window.localStorage.getItem(KEY_SOURCE);
  if (!source) {
    const params = new URLSearchParams(window.location.search);
    source = params.get("utm_source") || params.get("source") || "direct";
    window.localStorage.setItem(KEY_SOURCE, source);
    recordVisit(source);
  }
  return readJSON<VisitSource[]>(KEY_VISITS, []);
}

// ---- Lang / theme ----
export function getLang(): "en" | "id" {
  if (typeof window === "undefined") return "en";
  const v = window.localStorage.getItem(KEY_LANG);
  return v === "id" ? "id" : "en";
}

export function setLang(lang: "en" | "id") {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_LANG, lang);
}

export function getTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const v = window.localStorage.getItem(KEY_THEME);
  return v === "dark" ? "dark" : "light";
}

export function setTheme(t: "light" | "dark") {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_THEME, t);
}

// ---- useMounted pattern (hydration #418 fix) ----
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
