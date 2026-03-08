/** ISO 8601 → "YYYY-MM-DD" in local timezone */
export function localDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** ISO 8601 → "HH:MM" in local timezone */
export function localTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Date → "YYYY-MM-DD" in local timezone */
export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Date → "HH:MM:SS.mmmZ" ISO at local midnight → suitable for backend "date" queries */
export function toIsoMidnight(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toISOString();
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatDateHeader(date: Date): string {
  return date.toLocaleDateString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatWeekRange(monday: Date): string {
  const sunday = addDays(monday, 6);
  return `${monday.getDate()} – ${sunday.getDate()} de ${sunday.toLocaleDateString("es-DO", { month: "long", year: "numeric" })}`;
}

export function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function isToday(dateStr: string): boolean {
  return dateStr === toDateString(new Date());
}

/** "hace N min/horas" relative label from ISO timestamp */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  return `hace ${days} día${days > 1 ? "s" : ""}`;
}
