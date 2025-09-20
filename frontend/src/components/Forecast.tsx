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

  const weatherCondition: WeatherCondition | undefined = stop.forecast?.daytimeForecast?.weatherCondition;
  const label = weatherCondition?.description?.text || "—";

  // Google returns a base URI; append .svg (add "_dark" if you want a dark theme variant)
  const iconUrl = weatherCondition?.iconBaseUri ? `${weatherCondition.iconBaseUri}.svg` : undefined;

  return { label, iconUrl, FallbackIcon: SunnyIcon };
}

export default function Forecast({
  stop, open, onToggle,
  columnWidths,
}: {
  stop: ItineraryStop,
  open: boolean,
  onToggle: () => void,
  columnWidths?: Partial<{ temps: number; condition: number; precip: number; wind: number; toggle: number }>
}) {

  const w = {
    temps: columnWidths?.temps ?? 72,
    condition: columnWidths?.condition ?? 160,
    precip: columnWidths?.precip ?? 64,
    wind: columnWidths?.wind ?? 88,
    toggle: columnWidths?.toggle ?? 36,
  };

  const daytimeForecast = stop.forecast?.daytimeForecast;
  const precip = daytimeForecast?.precipitation?.probability?.percent;
  const windMph = toMph(daytimeForecast?.wind?.speed?.value);

  // Hi/Lo (display F, source values assumed °C)
  const hi = fmtTempF(stop.forecast?.maxTemperature?.degrees); // High first
  const lo = fmtTempF(stop.forecast?.minTemperature?.degrees); // then Low

  const { label, iconUrl, FallbackIcon } = conditionFromForecast(stop);

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: "nowrap", ml: 1, whiteSpace: "nowrap" }}>
      {/* Hi/Lo */}
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ width: w.temps, minWidth: w.temps, flexShrink: 0 }}>
        <Typography variant="body2" fontWeight={700}>
          {hi}/{lo}
        </Typography>
      </Stack>

      {/* Condition */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{ width: w.condition, minWidth: w.condition, flexShrink: 0, overflow: "hidden" }}
      >
        {iconUrl ? (
          <Box component="img" src={iconUrl} alt={label} sx={{ width: 20, height: 20, display: "block", flexShrink: 0 }} />
        ) : (
          <FallbackIcon fontSize="small" />
        )}
        <Typography variant="body2" noWrap title={label}>
          {label}
        </Typography>
      </Stack>

      {/* Precip */}
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ width: w.precip, minWidth: w.precip, flexShrink: 0 }}>
        <WaterDropOutlinedIcon fontSize="small" />
        <Typography variant="body2">{fmtPct(precip)}</Typography>
      </Stack>

      {/* Wind */}
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ width: w.wind, minWidth: w.wind, flexShrink: 0 }}>
        <AirIcon fontSize="small" />
        <Typography variant="body2">
          {typeof windMph === "number" ? `${windMph} mph` : "—"}
        </Typography>
      </Stack>

      {/* Toggle */}
      <Box sx={{ width: w.toggle, minWidth: w.toggle, flexShrink: 0, display: "flex", justifyContent: "center" }}>
        <IconButton size="small" onClick={onToggle} aria-label={open ? "Collapse details" : "Expand details"}>
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Box>
    </Stack>
  );

}
