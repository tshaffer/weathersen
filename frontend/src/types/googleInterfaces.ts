export interface ForecastDayPart {
  interval?: { startTime: string; endTime: string }; // *
  weatherCondition?: WeatherCondition; // *
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

export interface LocalizedText {
  text: string;
  languageCode: string;
}

export interface WeatherCondition {
  iconBaseUri: string;
  description: LocalizedText;
  type: WeatherConditionType;
}

export enum WeatherConditionType {
  TYPE_UNSPECIFIED = "The weather condition is unspecified.",
  CLEAR = "No clouds.",
  MOSTLY_CLEAR = "Periodic clouds.",
  PARTLY_CLOUDY = "Partly cloudy (some clouds).",
  MOSTLY_CLOUDY = "Mostly cloudy (more clouds than sun).",
  CLOUDY = "Cloudy (all clouds, no sun).",
  WINDY = "High wind.",
  WIND_AND_RAIN = "High wind with precipitation.",
  LIGHT_RAIN_SHOWERS = "Light intermittent rain.",
  CHANCE_OF_SHOWERS = "Chance of intermittent rain.",
  SCATTERED_SHOWERS = "Intermittent rain.",
  RAIN_SHOWERS = "Showers are considered to be rainfall that has a shorter duration than rain, and is characterized by suddenness in terms of start and stop times, and rapid changes in intensity.",
  HEAVY_RAIN_SHOWERS = "Intense showers.",
  LIGHT_TO_MODERATE_RAIN = "Rain (light to moderate in quantity).",
  MODERATE_TO_HEAVY_RAIN = "Rain (moderate to heavy in quantity).",
  RAIN = "Moderate rain.",
  LIGHT_RAIN = "Light rain.",
  HEAVY_RAIN = "Heavy rain.",
  RAIN_PERIODICALLY_HEAVY = "Rain periodically heavy.",
  LIGHT_SNOW_SHOWERS = "Light snow that is falling at varying intensities for brief periods of time.",
  CHANCE_OF_SNOW_SHOWERS = "Chance of snow showers.",
  SCATTERED_SNOW_SHOWERS = "Snow that is falling at varying intensities for brief periods of time.",
  SNOW_SHOWERS = "Snow showers.",
  HEAVY_SNOW_SHOWERS = "Heavy snow showers.",
  LIGHT_TO_MODERATE_SNOW = "Light to moderate snow.",
  MODERATE_TO_HEAVY_SNOW = "Moderate to heavy snow.",
  SNOW = "Moderate snow.",
  LIGHT_SNOW = "Light snow.",
  HEAVY_SNOW = "Heavy snow.",
  SNOWSTORM = "Snow with possible thunder and lightning.",
  SNOW_PERIODICALLY_HEAVY = "Snow, at times heavy.",
  HEAVY_SNOW_STORM = "Heavy snow with possible thunder and lightning.",
  BLOWING_SNOW = "Snow with intense wind.",
  RAIN_AND_SNOW = "Rain and snow mix.",
  HAIL = "Hail.",
  HAIL_SHOWERS = "Hail that is falling at varying intensities for brief periods of time.",
  THUNDERSTORM = "Thunderstorm.",
  THUNDERSHOWER = "A shower of rain accompanied by thunder and lightning.",
  LIGHT_THUNDERSTORM_RAIN = "Light thunderstorm rain.",
  SCATTERED_THUNDERSTORMS = "Thunderstorms that has rain in various intensities for brief periods of time.",
  HEAVY_THUNDERSTORM = "Heavy thunderstorm.",
}