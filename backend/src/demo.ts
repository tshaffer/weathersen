// src/demo.ts
import { geocodeCity } from "./geocode";
import { getDailyForecast } from "./googleWeather";

async function run() {
  const cities = ["San Francisco, CA", "Boston, MA", "Portland, ME"];
  for (const city of cities) {
    const { lat, lng } = await geocodeCity(city);
    const days = await getDailyForecast(lat, lng, 10);
    console.log(`\n=== ${city} (lat=${lat}, lng=${lng}) ===`);
    for (const d of days) {
      const { year, month, day } = d.displayDate;
      const label = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const desc = d.daytimeForecast?.weatherCondition?.description?.text ?? d.daytimeForecast?.weatherCondition?.type ?? "—";
      const tMax = d.maxTemperature?.degrees ?? "—";
      const tMin = d.minTemperature?.degrees ?? "—";
      console.log(`${label}  ${desc}  (min ${tMin}°, max ${tMax}°)`);
    }
  }
}

run().catch(err => {
  console.error(err?.response?.data ?? err);
  process.exit(1);
});
