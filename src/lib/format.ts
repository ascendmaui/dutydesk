const TZ = "America/New_York";

function inZone(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function ageYears(dob: string, atIso?: string) {
  const birth = new Date(dob);
  const at = atIso ? new Date(atIso) : new Date();
  if (Number.isNaN(birth.getTime()) || Number.isNaN(at.getTime())) return "";
  let age = at.getFullYear() - birth.getFullYear();
  const m = at.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && at.getDate() < birth.getDate())) age -= 1;
  return String(age);
}

export function formatLastFirst(lastName: string, firstName: string) {
  return `${lastName.trim().toUpperCase()}, ${firstName.trim().toUpperCase()}`;
}

export function formatDob(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(isoDate: string) {
  if (!isoDate) return "";
  const d = isoDate.includes("T")
    ? new Date(isoDate)
    : new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", {
    timeZone: TZ,
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

export function formatLongDateTime(iso: string) {
  const d = inZone(iso);
  if (!d) return iso;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).format(d);
}

export function formatCareStamp(iso: string) {
  const d = inZone(iso);
  if (!d) return iso;
  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).format(d);
  return `${date}, ${time}`;
}

export function todayIsoDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDaysIso(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function nowIso() {
  return new Date().toISOString();
}

/** Wall-clock value for `<input type="datetime-local">` in Eastern time. */
export function toDateTimeLocal(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Interpret a datetime-local string as America/New_York. */
export function fromDateTimeLocal(value: string) {
  if (!value) return "";
  const [date, time] = value.split("T");
  if (!date || !time) return "";
  const [y, mo, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  if (![y, mo, d, hh, mm].every((n) => Number.isFinite(n))) return "";
  const utcGuess = Date.UTC(y, mo - 1, d, hh, mm, 0);
  const offset = tzOffsetMs(new Date(utcGuess), TZ);
  let result = new Date(utcGuess - offset);
  const offset2 = tzOffsetMs(result, TZ);
  if (offset2 !== offset) result = new Date(utcGuess - offset2);
  return result.toISOString();
}

function tzOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return asUTC - date.getTime();
}

/** EHR style: "Kelley PSR, Alicia" */
export function formatAuthor(author: string, title = "") {
  const cleaned = author.trim();
  if (!cleaned) return title.trim();
  const bits = cleaned.split(/\s+/);
  if (bits.length === 1) {
    return title.trim() ? `${cleaned} ${title.trim()}` : cleaned;
  }
  const last = bits[bits.length - 1]!;
  const first = bits.slice(0, -1).join(" ");
  return title.trim() ? `${last} ${title.trim()}, ${first}` : `${last}, ${first}`;
}
