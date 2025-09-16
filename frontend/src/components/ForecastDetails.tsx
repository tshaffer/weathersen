import {
  Stack,
  Typography,
} from "@mui/material";
import { ItineraryStop } from "../types";

const fmtPct = (n?: number) => (typeof n === "number" ? `${n}%` : "—");

export default function ForecastDetails({ stop }: { stop: ItineraryStop }) {

  console.log('ForecastDetails stop:', stop);
  console.log(stop.forecast);
  if (stop.forecast) {
    console.log(stop.forecast.daytimeForecast);
    if (stop.forecast.daytimeForecast) {
      console.log(stop.forecast.daytimeForecast.uvIndex);
      console.log(stop.forecast.daytimeForecast.cloudCover);
      console.log(stop.forecast.daytimeForecast.wind);
      if (stop.forecast.daytimeForecast.wind) {
        console.log(stop.forecast.daytimeForecast.wind.speed);
      }
    }
  }
  const d = stop.forecast?.daytimeForecast;
  const sunrise = stop.forecast?.sunEvents?.sunrise;
  const sunset = stop.forecast?.sunEvents?.sunset;

  // uv index
  // humidity
  // hourly details
  
  return (
    <>Placeholder details</>
  );
}

