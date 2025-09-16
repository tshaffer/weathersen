import {
  Box,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import AirIcon from "@mui/icons-material/Air";
import { ItineraryStop, WeatherCondition } from "../types";
import { fmtTempF } from "../utilities";
import { WbSunny as SunnyIcon } from "@mui/icons-material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

// Derive a condition label + icon from the forecast.
type ConditionView = {
  label: string;
  iconUrl?: string;                 // from Google
  FallbackIcon: typeof SunnyIcon;   // MUI fallback
};

// ---------- Display helpers (compact, single-line) ----------
const fmtPct = (n?: number) => (typeof n === "number" ? `${n}%` : "—");
const toMph = (kph?: number) =>
  typeof kph === "number" ? Math.round(kph * 0.621371) : undefined;

function conditionFromForecast(stop: ItineraryStop): ConditionView {

  // console.log('conditionFromForecast stop:', stop);

  const wc: WeatherCondition | undefined = stop.forecast?.daytimeForecast?.weatherCondition;
  const label =
    wc?.description?.text || "—";

  // Google returns a base URI; append .svg (add "_dark" if you want a dark theme variant)
  const iconUrl = wc?.iconBaseUri ? `${wc.iconBaseUri}.svg` : undefined;

  return { label, iconUrl, FallbackIcon: SunnyIcon };
}

export default function Forecast({
   stop, open, onToggle
   }: { 
    stop: ItineraryStop,
    open: boolean,
    onToggle: () => void
   }) {
  const d = stop.forecast?.daytimeForecast;
  const precip = d?.precipitation?.probability;
  const windMph = toMph(d?.wind?.speed?.value);

  // Hi/Lo (display F, source values assumed °C)
  const hi = fmtTempF(stop.forecast?.maxTemperature?.degrees); // High first
  const lo = fmtTempF(stop.forecast?.minTemperature?.degrees); // then Low

  const { label, iconUrl, FallbackIcon } = conditionFromForecast(stop);

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.25}
      sx={{ flexWrap: "nowrap", ml: 1, whiteSpace: "nowrap" }}
    >
      {/* Hi/Lo */}
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 72 }}>
        <Typography variant="body2" fontWeight={700}>
          {hi}/{lo}
        </Typography>
      </Stack>

      {/* Condition icon + text */}
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 160 }}>
        {iconUrl ? (
          <Box component="img" src={iconUrl} alt={label} sx={{ width: 20, height: 20, display: "block" }} />
        ) : (
          <FallbackIcon fontSize="small" />
        )}
        <Typography variant="body2">{label}</Typography>
      </Stack>

      {/* Precipitation */}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <WaterDropOutlinedIcon fontSize="small" />
        <Typography variant="body2">{fmtPct(precip)}</Typography>
      </Stack>

      {/* Wind (mph) */}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <AirIcon fontSize="small" />
        <Typography variant="body2">
          {typeof windMph === "number" ? `${windMph} mph` : "—"}
        </Typography>
      </Stack>

      <IconButton
        size="small"
        onClick={onToggle}
        aria-label={open ? "Collapse details" : "Expand details"}
      >
        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </IconButton>

    </Stack>
  );
}
