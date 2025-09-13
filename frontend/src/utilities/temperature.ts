// src/utils/temperature.ts
export const toFahrenheit = (c?: number) =>
  typeof c === "number" ? (c * 9) / 5 + 32 : undefined;

export const fmtTempF = (c?: number) =>
  typeof c === "number" ? `${toFahrenheit(c)!.toFixed(0)}°F` : "—";
