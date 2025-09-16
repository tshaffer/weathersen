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
import AddIcon from "@mui/icons-material/Add";
import ReplayIcon from "@mui/icons-material/Replay";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import LocationAutocomplete from "./LocationAutocomplete";
import { AppDispatch } from "../redux/store";
import { fetchForecast } from "../redux/itinerarySlice";
import { Location, Itinerary, ItineraryStop } from "../types";
import React from "react";
import { StopDateField } from "./StopDateField";
import Forecast from "./Forecast";
import ForecastDetails from "./ForecastDetails";

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
  date: toISODate(date),
});

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

  // simple expand/collapse state per row
  const [openRows, setOpenRows] = useState<boolean[]>([]);
  const toggleRow = (i: number) =>
    setOpenRows((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });

  const itinerary = value;
  const setItinerary = onChange;

  const handleChangeGooglePlace = async (
    googlePlace: Location,
    date: string,
    index: number
  ) => {
    dispatch(fetchForecast({ location: googlePlace.geometry.location, date, index }));
    updateStop(index, { placeName: googlePlace.name, location: googlePlace });
  };

  const addStop = () => {
    const base = itinerary.length
      ? dayjs(itinerary[itinerary.length - 1].date || dayjs())
      : dayjs();
    const nextDate = base.add(1, "day");
    setItinerary([...itinerary, newStop(nextDate)]);
  };

  const updatePlaceName = (idx: number, placeName: string) => {
    const patch = { placeName };
    updateStop(idx, patch);
  };

  const updateStopDate = (idx: number, date: string) => {
    const patch = { date };
    if (value[idx].location) {
      dispatch(fetchForecast({ location: value[idx].location.geometry.location, date, index: idx }));
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
    setOpenRows([]); // reset expanded rows
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
                              placeName={stop.placeName || ''}
                              onSetPlaceName={(name: string) => updatePlaceName(idx, name)}
                              onSetGoogleLocation={(googlePlace: Location) => handleChangeGooglePlace(googlePlace, stop.date, idx)}
                            />

                            <StopDateField
                              idx={idx}
                              stop={{ date: stop.date }}
                              updateStopDate={(idx: number, iso: string | null) => updateStopDate(idx, iso!)}
                              toISODate={toISODate}>

                            </StopDateField>

                            {/* Weather.com-style inline strip */}
                            <Forecast
                              stop={stop}
                              open={!!openRows[idx]}
                              onToggle={() => toggleRow(idx)}
                            />

                            <Tooltip title="Remove stop">
                              <IconButton color="error" onClick={() => deleteStop(idx)}>
                                <DeleteOutlineIcon />
                              </IconButton>
                            </Tooltip>

                          </Stack>
                          
                          {/* Collapsible details under the row */}
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
