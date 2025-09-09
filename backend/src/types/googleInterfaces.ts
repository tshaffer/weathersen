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
