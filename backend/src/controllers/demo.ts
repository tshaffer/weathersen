// src/demo.ts
import { ForecastDayPart, DailyForecastDay } from "../types";
import { geocodeCity, getDailyForecast } from "../utilities";

// ---------- utils ----------
const pad2 = (n: number) => String(n).padStart(2, "0");
const fmtDate = (d: { year: number; month: number; day: number }) =>
  `${d.year}-${pad2(d.month)}-${pad2(d.day)}`;

function fmtTimeMaybeISO(s?: string): string {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(d.getTime())
    ? s
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtValUnit(value?: number | null, unit?: string): string {
  if (value == null) return "—";
  return unit ? `${value} ${unit}` : String(value);
}

function fmtPercent(n?: number | null): string {
  return n == null ? "—" : `${Math.round(n)}%`;
}

function qpfUnitSymbol(unit?: string): string {
  // Google returns enum-like strings for QPF units
  if (!unit) return "";
  if (unit === "MILLIMETERS") return "mm";
  if (unit === "INCHES") return "in";
  return unit; // fallback
}

// ---------- schema-tolerant accessors ----------
// Accepts either your ForecastDayPart shape or Google's official fields

function getHumidity(part?: ForecastDayPart | any): number | undefined {
  if (!part) return undefined;
  // Your shape: { humidity: { percent } }
  if (typeof part?.humidity?.percent === "number") return part.humidity.percent;
  // Google shape: relativeHumidity: number (0..100)
  if (typeof part?.relativeHumidity === "number") return part.relativeHumidity;
  return undefined;
}

function fmtWind(part?: ForecastDayPart | any): string {
  if (!part) return "—";

  // Your earlier guess shape (keep as fallback)
  if (part?.windSpeed?.speed?.value != null) {
    const v = part.windSpeed.speed.value;
    const u = part.windSpeed.speed.unit;
    const dir =
      part.windSpeed.direction?.localizedDescription ??
      (typeof part.windSpeed.direction?.degrees === "number"
        ? `${part.windSpeed.direction.degrees}°`
        : "");
    const gust =
      part?.windGust?.value != null
        ? ` (gust ${fmtValUnit(part.windGust.value, part.windGust.unit)})`
        : "";
    return `${fmtValUnit(v, u)}${dir ? " " + dir : ""}${gust}`;
  }

  // Google official: part.wind.{speed:{value,unit}, gust:{...}, direction:{cardinal|degrees}}
  if (part?.wind?.speed?.value != null) {
    const v = part.wind.speed.value;
    const u = part.wind.speed.unit; // 'KILOMETERS_PER_HOUR' | 'MILES_PER_HOUR'
    const uSym = u === "KILOMETERS_PER_HOUR" ? "km/h" : u === "MILES_PER_HOUR" ? "mph" : u ?? "";
    const dirCard = part.wind.direction?.cardinal;
    const dirDeg =
      typeof part.wind.direction?.degrees === "number"
        ? `${part.wind.direction.degrees}°`
        : undefined;
    const dir = dirCard ?? dirDeg ?? "";
    const gust =
      part.wind.gust?.value != null ? ` (gust ${part.wind.gust.value} ${uSym})` : "";
    return `${v} ${uSym}${dir ? " " + dir : ""}${gust}`;
  }

  return "—";
}

function fmtPrecip(part?: ForecastDayPart | any): string {
  if (!part?.precipitation) return "—";
  // Probability
  const prob =
    typeof part.precipitation.probability?.percent === "number"
      ? `${part.precipitation.probability.percent}%`
      : // fallback to your shape if ever present
      typeof part.precipitation?.probability === "number"
        ? `${Math.round(part.precipitation.probability)}%`
        : "—";

  // Amount (Google: qpf.quantity + qpf.unit)
  const qpf = part.precipitation.qpf;
  const amt =
    qpf?.quantity != null ? `${qpf.quantity} ${qpfUnitSymbol(qpf.unit)}` : undefined;

  const typ = part.precipitation.probability?.type; // RAIN | SNOW | etc.

  const bits = [`Prob ${prob}`];
  if (amt) bits.push(amt);
  if (typ && typ !== "PRECIPITATION_TYPE_UNSPECIFIED") bits.push(typ);
  return bits.join(", ");
}

// ---------- printers ----------
function printPart(label: string, part?: ForecastDayPart | any) {
  const lines: string[] = [];
  lines.push(`${label}:`);
  lines.push(`  Humidity: ${fmtPercent(getHumidity(part))}`);
  lines.push(`  Wind: ${fmtWind(part)}`);
  lines.push(`  UV Index: ${part?.uvIndex ?? "—"}`);
  lines.push(`  Precip: ${fmtPrecip(part)}`);
  lines.push(
    `  Thunderstorm Prob: ${typeof part?.thunderstormProbability === "number"
      ? fmtPercent(part.thunderstormProbability)
      : "—"
    }`
  );
  lines.push(
    `  Cloud Cover: ${typeof (part as any)?.cloudCover === "number"
      ? fmtPercent((part as any).cloudCover)
      : "—"
    }`
  );
  return lines.join("\n");
}

function printDay(day: DailyForecastDay | any) {
  const header = `\n${fmtDate(day.displayDate)}  (min ${fmtValUnit(
    day.minTemperature?.degrees,
    day.minTemperature?.unit
  )}, max ${fmtValUnit(day.maxTemperature?.degrees, day.maxTemperature?.unit)})`;

  const sunrise = fmtTimeMaybeISO(day?.sunEvents?.sunriseTime);
  const sunset = fmtTimeMaybeISO(day?.sunEvents?.sunsetTime);
  const moonrise = fmtTimeMaybeISO(day?.moonEvents?.moonriseTime);
  const moonset = fmtTimeMaybeISO(day?.moonEvents?.moonsetTime);

  const astro = `  Sunrise / Sunset: ${sunrise} / ${sunset}\n  Moonrise / Moonset: ${moonrise} / ${moonset}`;
  return `${header}\n${astro}\n${printPart("  Day", day.daytimeForecast)}\n${printPart(
    "  Night",
    day.nighttimeForecast
  )}`;
}

// ---------- main ----------
async function run() {
  const cities = ["San Francisco, CA", "Boston, MA", "Portland, ME"];
  for (const city of cities) {
    const { lat, lng } = await geocodeCity(city);
    const days = await getDailyForecast(lat, lng, 10);
    console.log(`\n================  ${city}  (lat=${lat}, lng=${lng})  ================`);
    for (const d of days) console.log(printDay(d));
  }
}

// run().catch((err) => {
//   const data = (err as any)?.response?.data;
//   console.error(data ?? err);
//   process.exit(1);
// });

export async function runDemo() {
  console.log("Demo runDemo() invoked");
  // await run();
  run().catch((err) => {
    const data = (err as any)?.response?.data;
    console.error(data ?? err);
    process.exit(1);
  });
}