export interface ForecastDayPart {
  interval?: { startTime: string; endTime: string }; // *
  weatherCondition?: { description: string, type: string }; // *
  precipitation?: {
    probability?: number;
    qpf?: any;
    snowQpf?: any;
  };  // *
  wind?: { speed: { value: number; unit: string }; direction?: { degrees: number; localizedDescription?: string } }; // *
  relativeHumidity?: number; // *
  uvIndex?: number; // *
  thunderstormProbability?: number;  // *
  cloudCover?: number; // *
  iceThickness?: { thickness: number; unit: string }; // 1
}

export interface DailyForecastDay {
  daytimeForecast?: ForecastDayPart; // 0
  displayDate: { year: number; month: number; day: number }; // 1
  feelsLikeMaxTemperature?: { degrees: number; unit: string }; // 2
  feelsLikeMinTemperature?: { degrees: number; unit: string }; // 3
  iceThickness?: { thickness: number; unit: string }; // 1
  interval?: { startTime: string; endTime: string }; // 4
  maxHeatIndex?: { degrees: number; unit: string }; // 5
  maxTemperature?: { degrees: number; unit: string };
  minTemperature?: { degrees: number; unit: string };
  moonEvents?: {
    moonPhase?: string;
    moonriseTimes?: string[];
    moonsetTimes?: string[];
  };
  nighttimeForecast?: ForecastDayPart;
  sunEvents?: {
    sunrise?: string;
    sunset?: string;
  };
}

export interface ForecastDaysResponse {
  forecastDays: DailyForecastDay[];
  timeZone?: { id: string };
  nextPageToken?: string;
}
