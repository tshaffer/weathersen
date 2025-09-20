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
  Collapse,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddIcon from "@mui/icons-material/Add";
import ReplayIcon from "@mui/icons-material/Replay";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import LocationAutocomplete from "./LocationAutocomplete";
import { AppDispatch } from "../redux/store";
import { fetchAllForecasts, fetchForecast } from "../redux/itinerarySlice";
import { Location, ItineraryStop } from "../types";
import Forecast from "./Forecast";
import ForecastDetails from "./ForecastDetails";
import { PickerValue } from "@mui/x-date-pickers/internals";
import { StartDateField } from "./StartDateField";
import { toISODate } from "../utilities";

// near the top of ItineraryInput.tsx
const COL = {
  drag: 24,
  day: 64,          // matches your Day {idx+1}
  date: 120,        // your preferred date label width
  temps: 72,
  condition: 180,
  precip: 64,
  wind: 88,
  toggle: 36,       // caret button
};

// ---------------- Types ----------------

export type ItineraryInputProps = {
  itineraryStart: string;
  itineraryStops: ItineraryStop[];
  onUpdateItineraryStartDate: (newDate: Dayjs) => void;
  onUpdateItineraryStops: (next: ItineraryStop[]) => void;
  onClear?: () => void;
};


const newStop = (): ItineraryStop => ({
  id: crypto.randomUUID(),
});

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

// --------------- Component ---------------
export default function ItineraryInput({
  itineraryStart,
  itineraryStops,
  onUpdateItineraryStartDate,
  onUpdateItineraryStops,
  onClear,
}: ItineraryInputProps) {

  const dispatch = useDispatch<AppDispatch>();

  const [showClearDialog, setShowClearDialog] = useState(false);

  // simple expand/collapse state per row
  const [openRows, setOpenRows] = useState<boolean[]>([]);
  const toggleRow = (i: number) =>
    setOpenRows((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });

  const handleChangeItineraryStartDate = (newDate: Dayjs) => {
    if (!newDate?.isValid()) return; // optional safety
    const date = toISODate(newDate);  // <- typed as string via overload
    dispatch(
      fetchAllForecasts({
        date,
        locations: itineraryStops.map(s => s.location!.geometry.location),
        numberOfDays: itineraryStops.length
      })
    );
    onUpdateItineraryStartDate(newDate);
  };

  const handleChangeGooglePlace = async (
    googlePlace: Location,
    placeName: string,
    date: string,
    index: number
  ) => {
    dispatch(fetchForecast({ location: googlePlace.geometry.location, date, index }));
    updateStop(index, { placeName, location: googlePlace });
  };

  const addStop = () => {
    onUpdateItineraryStops([...itineraryStops, newStop()]);
  };

  const updatePlaceName = (idx: number, placeName: string) => {
    const patch = { placeName };
    updateStop(idx, patch);
  };

  const updateStop = (idx: number, patch: Partial<ItineraryStop>) => {
    onUpdateItineraryStops(itineraryStops.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const deleteStop = (idx: number) => {
    const next = itineraryStops.filter((_, i) => i !== idx);
    onUpdateItineraryStops(next);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const next = reorder(itineraryStops, result.source.index, result.destination.index);
    onUpdateItineraryStops(next);
  };

  const handleClear = () => {
    setShowClearDialog(false);
    onClear?.(); // Redux resets to placeholder stop
    setOpenRows([]); // reset expanded rows
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card className="shadow-xl rounded-2xl">
        <CardContent sx={{ py: 1.5 /* tighter vertical padding */ }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={1}                       // less bottom margin
            spacing={1}
          >
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              Itinerary
            </Typography>

            <Stack direction="row" gap={0.75} alignItems="center">
              <StartDateField
                stop={{ date: itineraryStart }}
                updateStartDate={(iso: string | null) =>
                  handleChangeItineraryStartDate(iso ? dayjs(iso) : dayjs())
                }
                toISODate={toISODate}
              />

              <Tooltip title="Clear trip and start new">
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"                               // <-- smaller button
                  startIcon={<ReplayIcon fontSize="small" />} // small icon
                  onClick={() => setShowClearDialog(true)}
                  sx={{ px: 1.25, py: 0.5 }}                 // tighter padding
                >
                  Clear Trip
                </Button>
              </Tooltip>

              <Button
                variant="contained"
                size="small"                                  // <-- smaller button
                startIcon={<AddIcon fontSize="small" />}      // small icon
                onClick={addStop}
                sx={{ px: 1.25, py: 0.5 }}                   // tighter padding
              >
                Add Stop
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ mb: 1.25 }} />

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="stops">
              {(provided) => (
                <Stack ref={provided.innerRef} {...provided.droppableProps} gap={0.75}>
                  {itineraryStops.map((stop, idx) => (
                    <Draggable draggableId={stop.id} index={idx} key={stop.id}>
                      {(drag) => (
                        <Box
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          className="rounded-2xl border border-gray-200"
                          sx={{ p: 0.75 }}                   // tighter row padding
                        >
                          <Stack direction="row" alignItems="center" gap={0.75} sx={{ flexWrap: "nowrap" }}>
                            <Box
                              {...drag.dragHandleProps}
                              sx={{ width: COL.drag, minWidth: COL.drag, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <DragIndicatorIcon fontSize="small" />
                            </Box>

                            <Typography
                              sx={{ width: COL.day, minWidth: COL.day, lineHeight: 1.2, flexShrink: 0 }}
                              color="text.secondary"
                            >
                              Day {idx + 1}
                            </Typography>

                            <Box sx={{ flexGrow: 1, minWidth: 160, overflow: "hidden" }}>
                              <LocationAutocomplete
                                placeName={stop.placeName || ""}
                                onSetPlaceName={(name: string) => updatePlaceName(idx, name)}
                                onSetGoogleLocation={(googlePlace: Location, placeName: string) =>
                                  handleChangeGooglePlace(
                                    googlePlace,
                                    placeName,
                                    dayjs(itineraryStart).add(idx, "day").format("YYYY-MM-DD"),
                                    idx
                                  )
                                }
                              />
                            </Box>

                            <Typography
                              sx={{ width: COL.date, minWidth: COL.date, lineHeight: 1.2, flexShrink: 0, whiteSpace: "nowrap" }}
                              color="text.secondary"
                            >
                              {dayjs(itineraryStart).add(idx, "day").format("ddd MMM D")}
                            </Typography>

                            <Forecast
                              stop={stop}
                              open={!!openRows[idx]}
                              onToggle={() => toggleRow(idx)}
                              columnWidths={{
                                temps: COL.temps,
                                condition: COL.condition,
                                precip: COL.precip,
                                wind: COL.wind,
                                toggle: COL.toggle,
                              }}
                            />

                            <Box sx={{ width: 36, minWidth: 36, flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
                              <Tooltip title="Remove stop">
                                <IconButton color="error" onClick={() => deleteStop(idx)} size="small">
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>

                          </Stack>

                          <Collapse in={!!openRows[idx]} timeout="auto" unmountOnExit>
                            <ForecastDetails stop={stop} />
                          </Collapse>
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
              {JSON.stringify(itineraryStops, null, 2)}
            </pre>
          </Box>
        </CardContent>
      </Card>

      {/* Clear Trip dialog */}
      <Dialog open={showClearDialog} onClose={() => setShowClearDialog(false)}>
        <DialogTitle>Clear current trip?</DialogTitle>
        <DialogContent>
          <Typography>
            This will remove all current stops and start a new, empty itineraryStops (we’ll leave one blank stop to get you
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
