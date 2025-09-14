// ItineraryInput.tsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import ReplayIcon from "@mui/icons-material/Replay";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CloudIcon from "@mui/icons-material/Cloud";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import AirIcon from "@mui/icons-material/Air";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import LocationAutocomplete from "./LocationAutocomplete";
import { AppDispatch } from "../redux/store";
import { fetchForecast } from "../redux/itinerarySlice";
import { ForecastDayPart, Itinerary, ItineraryStop, WeatherCondition, WeatherConditionType } from "../types";
import { fmtTempF } from "../utilities";

// ---------------- Types ----------------

export type ItineraryInputProps = {
  value: Itinerary;
  onChange: (next: Itinerary) => void;
  onClear?: () => void;
};

// Utility to format ISO date (yyyy-mm-dd)
const toISODate = (d: Dayjs | null): string => (d ? d.format("YYYY-MM-DD") : "");

const newStop = (date: Dayjs): ItineraryStop => ({
  id: crypto.randomUUID(),
  location: "",
  date: toISODate(date),
});

// ---------- Display helpers (compact, single-line) ----------
const fmtPct = (n?: number) => (typeof n === "number" ? `${n}%` : "—");
const toMph = (kph?: number) =>
  typeof kph === "number" ? Math.round(kph * 0.621371) : undefined;

function valueFromKey(k: keyof typeof WeatherConditionType): WeatherConditionType {
  return WeatherConditionType[k]; // → the prose string
}

const VALUE_TO_LABEL: Partial<Record<WeatherConditionType, string>> = {
  [WeatherConditionType.PARTLY_CLOUDY]: "Partly Cloudy",
  [WeatherConditionType.CLEAR]: "Sunny",
  // …add others you care about
};

// Derive a condition label + icon from the forecast.
// Prefers a phrase/summary if present; otherwise uses precip/cloud cover heuristics.
function conditionFromForecast(stop: ItineraryStop): { label: string; IconComp: typeof WbSunnyIcon } {

  console.log('conditionFromForecast stop:', stop);

  const daytimeForecast = stop.forecast?.daytimeForecast as ForecastDayPart | undefined;
  if (!daytimeForecast) return { label: "—", IconComp: WbSunnyIcon };

  const weatherCondition: WeatherCondition | undefined = daytimeForecast?.weatherCondition;
  if (!weatherCondition) return { label: "—", IconComp: WbSunnyIcon };

  console.log(weatherCondition.type);

  // console.log('valueFromKey:', valueFromKey(weatherCondition.type as keyof typeof WeatherConditionType));

  console.log('flibbet', WeatherConditionType[weatherCondition.type as unknown as keyof typeof WeatherConditionType]);
  const wct = VALUE_TO_LABEL[weatherCondition.type];
  console.log('wct:', wct);

  type WeatherConditionKey = keyof typeof WeatherConditionType;
  type WeatherConditionValue = (typeof WeatherConditionType)[WeatherConditionKey];

  return { label: wct || "—", IconComp: WbSunnyIcon };

  // Prefer a phrase/summary if present
  // const phrase: string | undefined =
  //   daytimeForecast?.weatherCondition?.phrase || daytimeForecast?.summary || daytimeForecast?.shortDescription;

  // const precip = daytimeForecast?.precipitation?.probability as number | undefined;
  // const cloud = daytimeForecast?.cloudCover as number | undefined;

  // let label = "—";
  // let IconComp = WbSunnyIcon;

  // if (phrase && typeof phrase === "string") {
  //   label = phrase;
  //   const p = phrase.toLowerCase();
  //   if (p.includes("rain") || p.includes("shower") || p.includes("storm")) IconComp = ThunderstormIcon;
  //   else if (p.includes("cloud")) IconComp = p.includes("partly") ? CloudQueueIcon : CloudIcon;
  //   else if (p.includes("sun") || p.includes("clear")) IconComp = WbSunnyIcon;
  // } else {
  //   if (typeof precip === "number" && precip >= 50) {
  //     label = "Rain";
  //     IconComp = ThunderstormIcon;
  //   } else if (typeof cloud === "number") {
  //     if (cloud <= 20) {
  //       label = "Sunny";
  //       IconComp = WbSunnyIcon;
  //     } else if (cloud <= 60) {
  //       label = "Partly Cloudy";
  //       IconComp = CloudQueueIcon;
  //     } else {
  //       label = "Cloudy";
  //       IconComp = CloudIcon;
  //     }
  //   }
  // }
  // return { label, IconComp };
}

function WeatherInline({ stop }: { stop: ItineraryStop }) {
  const d = stop.forecast?.daytimeForecast;
  const precip = d?.precipitation?.probability;
  const windMph = toMph(d?.wind?.speed?.value);

  // Hi/Lo (display F, source values assumed °C)
  const hi = fmtTempF(stop.forecast?.maxTemperature?.degrees); // High first
  const lo = fmtTempF(stop.forecast?.minTemperature?.degrees); // then Low

  const { label, IconComp } = conditionFromForecast(stop);

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
        <IconComp fontSize="small" />
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
    </Stack>
  );
}

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

// --------------- Component ---------------
export default function ItineraryInput({
  value,
  onChange,
  onClear,
}: ItineraryInputProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [showClearDialog, setShowClearDialog] = useState(false);

  const itinerary = value;
  const setItinerary = onChange;

  const handleSetMapLocation = async (
    locationCoordinates: google.maps.LatLngLiteral,
    date: string,
    index: number
  ): Promise<void> => {
    dispatch(fetchForecast({ location: locationCoordinates, date, index }));
    updateStop(index, { locationCoordinates });
  };

  const addStop = () => {
    const base = itinerary.length
      ? dayjs(itinerary[itinerary.length - 1].date || dayjs())
      : dayjs();
    const nextDate = base.add(1, "day");
    setItinerary([...itinerary, newStop(nextDate)]);
  };

  const updateStopDate = (idx: number, date: string) => {
    const patch = { date };
    if (value[idx].locationCoordinates) {
      dispatch(fetchForecast({ location: value[idx].locationCoordinates, date, index: idx }));
    }
    updateStop(idx, patch);
  };

  const updateStop = (idx: number, patch: Partial<ItineraryStop>) => {
    setItinerary(itinerary.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const deleteStop = (idx: number) => {
    const next = itinerary.filter((_, i) => i !== idx);
    setItinerary(next);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const next = reorder(itinerary, result.source.index, result.destination.index);
    setItinerary(next);
  };

  const handleClear = () => {
    setShowClearDialog(false);
    onClear?.(); // Redux resets to placeholder stop
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card className="shadow-xl rounded-2xl">
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight={700}>
              Itinerary
            </Typography>
            <Stack direction="row" gap={1}>
              <Tooltip title="Clear trip and start new">
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<ReplayIcon />}
                  onClick={() => setShowClearDialog(true)}
                >
                  Clear Trip
                </Button>
              </Tooltip>
              <Button variant="contained" startIcon={<AddIcon />} onClick={addStop}>
                Add Stop
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="stops">
              {(provided) => (
                <Stack ref={provided.innerRef} {...provided.droppableProps} gap={1}>
                  {itinerary.map((stop, idx) => (
                    <Draggable draggableId={stop.id} index={idx} key={stop.id}>
                      {(drag) => (
                        <Box
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          className="rounded-2xl border border-gray-200"
                          sx={{ p: 1 }}
                        >
                          <Stack
                            direction="row"            // single-line layout
                            alignItems="center"
                            gap={1}
                            sx={{ flexWrap: "nowrap" }} // prevent wrapping
                          >
                            <Box
                              {...drag.dragHandleProps}
                              sx={{ display: "flex", alignItems: "center", px: 1 }}
                            >
                              <DragIndicatorIcon fontSize="small" />
                            </Box>

                            <Typography sx={{ width: 72, minWidth: 72 }} color="text.secondary">
                              Day {idx + 1}
                            </Typography>

                            <LocationAutocomplete
                              value={stop.location}
                              onChangeText={(text) => updateStop(idx, { location: text })}
                              onSetMapLocation={(locationCoordinates: google.maps.LatLngLiteral) =>
                                handleSetMapLocation(locationCoordinates, stop.date, idx)
                              }
                            />

                            <DatePicker
                              label="Date"
                              value={stop.date ? dayjs(stop.date) : null}
                              onChange={(d) => updateStopDate(idx, toISODate(d))}
                              slotProps={{ textField: { sx: { minWidth: 180 } } }}
                            />

                            {/* Weather.com-style inline strip */}
                            <WeatherInline stop={stop} />

                            <Tooltip title="Remove stop">
                              <IconButton color="error" onClick={() => deleteStop(idx)}>
                                <DeleteOutlineIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Stack>
              )}
            </Droppable>
          </DragDropContext>

          {/* Dev helper JSON */}
          <Box mt={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Current Itinerary (JSON)
            </Typography>
            <pre
              style={{
                background: "#f7f7f7",
                padding: 12,
                borderRadius: 12,
                overflow: "auto",
              }}
            >
              {JSON.stringify(itinerary, null, 2)}
            </pre>
          </Box>
        </CardContent>
      </Card>

      {/* Clear Trip dialog */}
      <Dialog open={showClearDialog} onClose={() => setShowClearDialog(false)}>
        <DialogTitle>Clear current trip?</DialogTitle>
        <DialogContent>
          <Typography>
            This will remove all current stops and start a new, empty itinerary (we’ll leave one blank stop to get you
            going).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearDialog(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleClear}>
            Clear Trip
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
