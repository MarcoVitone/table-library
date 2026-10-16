type DateFormat = string | Intl.DateTimeFormatOptions;

const formatters = new Map<string, Intl.DateTimeFormat>();

function getFormatter(locale: string, options: Intl.DateTimeFormatOptions) {
  const key = JSON.stringify([locale, options]);
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    // Reuse formatters across table rows, with a bounded cache for dynamic options.
    if (formatters.size >= 64) formatters.clear();
    formatters.set(key, formatter);
  }
  return formatter;
}

/** Format native Date inputs; string patterns support the documented common tokens. */
function formatDate(
  value: unknown,
  format: DateFormat = "dd/MM/yyyy",
  timeZone = "Europe/Rome",
  locale = "en-US",
): string {
  if (!(value instanceof Date) && typeof value !== "number" && typeof value !== "string") return "";
  if (typeof value === "string" && !value.trim()) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  if (typeof format !== "string") {
    return getFormatter(locale, { timeZone, ...format }).format(date);
  }
  if (!format) return "";

  const parts = getFormatter("en-US", {
    timeZone, calendar: "gregory", numberingSystem: "latn", hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)!.value;
  const numeric = (type: Intl.DateTimeFormatPartTypes) => String(Number(part(type)));
  const hour12 = String(Number(part("hour")) % 12 || 12);
  const text = (options: Intl.DateTimeFormatOptions) => getFormatter(locale, { timeZone, ...options }).format(date);

  return format.replace(/''|'(?:[^']|'')*'|([a-zA-Z])\1*|./g, token => {
    switch (token) {
      case "''": return "'";
      case "yyyy": return part("year").padStart(4, "0");
      case "yy": return part("year").padStart(2, "0").slice(-2);
      case "M": return numeric("month");
      case "MM": return part("month");
      case "MMM": return text({ month: "short" });
      case "MMMM": return text({ month: "long" });
      case "d": return numeric("day");
      case "dd": return part("day");
      case "E": case "EE": case "EEE": return text({ weekday: "short" });
      case "EEEE": return text({ weekday: "long" });
      case "H": return numeric("hour");
      case "HH": return part("hour");
      case "h": return hour12;
      case "hh": return hour12.padStart(2, "0");
      case "m": return numeric("minute");
      case "mm": return part("minute");
      case "s": return numeric("second");
      case "ss": return part("second");
      case "SSS": return String(date.getUTCMilliseconds()).padStart(3, "0");
      case "a": return Number(part("hour")) < 12 ? "AM" : "PM";
      default:
        if (token.startsWith("'") && token.endsWith("'") && token.length > 1) {
          return token.slice(1, -1).replace(/''/g, "'");
        }
        if (/[a-zA-Z']/.test(token)) {
          throw new RangeError(`Unsupported date format token: ${token}. Use Intl.DateTimeFormat options or quote literal text.`);
        }
        return token;
    }
  });
}

export { formatDate };
export type { DateFormat };
