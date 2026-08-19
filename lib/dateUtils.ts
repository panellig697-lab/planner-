export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isPast(iso: string | null): boolean {
  if (!iso) return false;
  return iso < todayISO();
}

export function isWithinDays(iso: string | null, days: number): boolean {
  if (!iso) return false;
  const today = todayISO();
  const end = addDaysISO(today, days);
  return iso >= today ? iso <= end : false;
}

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
const MONTH = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatDateShort(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return `${WEEKDAY[d.getDay()]} ${d.getDate()} ${MONTH[d.getMonth()].slice(0, 3)}`;
}

export function formatDateLong(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return `${MONTH[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function monthLabel(year: number, month: number): string {
  return `${MONTH[month]} ${year}`;
}

/** "Wednesday, 19 August" — for the Today command centre's date header. */
export function formatDateHeader(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${WEEKDAY_FULL[d.getDay()]}, ${d.getDate()} ${MONTH[d.getMonth()]}`;
}

export { WEEKDAY, MONTH };
