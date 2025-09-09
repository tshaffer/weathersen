import axios from "axios";

export interface ForecastDayPart {
  humidity?: { percent: number; unit: string };
  dewPoint?: { value: number; unit: string };
  wetBulbTemperature?: { value: number; unit: string };
  windSpeed?: { speed: { value: number; unit: string }; direction?: { degrees: number; localizedDescription?: string } };
  windGust?: { value: number; unit: string };
  windChill?: { value: number; unit: string };
  uvIndex?: number;
  precipitation?: {
    probability?: number;
    amount?: { value: number; unit: string };
    type?: string;
  };
  thunderstormProbability?: number;
  visibility?: { value: number; unit: string };
  seaLevelPressure?: { value: number; unit: string };
  cloudCover?: { percent: number; unit: string };
  sunEvents?: {
    sunrise?: string;
    sunset?: string;
  };
  moonEvents?: {
    moonrise?: string;
    moonset?: string;
  };
}

export interface DailyForecastDay {
  displayDate: { year: number; month: number; day: number };
  maxTemperature?: { degrees: number; unit: string };
  minTemperature?: { degrees: number; unit: string };
  daytimeForecast?: ForecastDayPart;
  nighttimeForecast?: ForecastDayPart;
}

export interface ForecastDaysResponse {
  forecastDays: DailyForecastDay[];
  timeZone?: { id: string };
  nextPageToken?: string;
}

const BASE = "https://weather.googleapis.com/v1/forecast/days:lookup";

/**
 * Fetch up to `days` of daily forecasts (max 10).
 * Handles pagination via pageSize + nextPageToken.
 */
export async function getDailyForecast(
  lat: number,
  lng: number,
  days = 10,
  pageSize = 5
): Promise<DailyForecastDay[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_MAPS_API_KEY");

  let out: DailyForecastDay[] = [];
  let pageToken: string | undefined;

  do {
    const params: Record<string, string | number> = {
      key: apiKey,
      "location.latitude": lat,
      "location.longitude": lng,
      days,
      pageSize,
    };
    if (pageToken) params.pageToken = pageToken;

    const { data } = await axios.get<ForecastDaysResponse>(BASE, { params });
    out = out.concat(data.forecastDays ?? []);
    pageToken = data.nextPageToken;
  } while (pageToken && out.length < days);

  return out.slice(0, days);
}

