import * as React from "react";
import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import ReplayIcon from "@mui/icons-material/Replay";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import LocationAutocomplete from "./LocationAutocomplete";

// ---------------- Types ----------------
export type ItineraryStop = {
  id: string; // stable id for DnD
  location: string;
  date: string; // ISO yyyy-mm-dd
};

export type Itinerary = ItineraryStop[];

export type ItineraryInputProps = {
  value?: Itinerary; // optional controlled value
  onChange?: (next: Itinerary) => void; // fires whenever itinerary changes
  onClear?: () => void; // fires when user clears the trip
  defaultDate?: Dayjs; // default date for newly added stops
  locationSuggestions?: string[]; // optional static suggestions for Autocomplete
};

// Utility to format ISO date (yyyy-mm-dd)
const toISODate = (d: Dayjs | null): string => (d ? d.format("YYYY-MM-DD") : "");

const newStop = (date: Dayjs): ItineraryStop => ({
  id: crypto.randomUUID(),
  location: "",
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
  defaultDate,
  locationSuggestions,
}: ItineraryInputProps) {
  const [internal, setInternal] = useState<Itinerary>([
    // Start with a single empty stop dated today by default
    newStop(defaultDate ?? dayjs()),
  ]);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const itinerary = value ?? internal;
  const setItinerary = (next: Itinerary) => {
    if (onChange) onChange(next);
    if (!value) setInternal(next);
  };

  const suggestions = useMemo(
    () =>
      locationSuggestions ?? [
        "San Francisco, CA",
        "Portland, OR",
        "Seattle, WA",
        "Vancouver, BC",
        "Paris, France",
        "London, UK",
        "Tokyo, Japan",
        "Lisbon, Portugal",
      ],
    [locationSuggestions]
  );

  const handleSetMapLocation = (location: google.maps.LatLngLiteral): void => {
    console.log("Selected location:", location);
    // dispatch(setCurrentMapLocation(location));
  }


  const addStop = () => {
    const base = itinerary.length
      ? dayjs(itinerary[itinerary.length - 1].date || dayjs())
      : dayjs();
    const nextDate = base.add(1, "day");
    setItinerary([...itinerary, newStop(nextDate)]);
  };

  const updateStop = (idx: number, patch: Partial<ItineraryStop>) => {
    setItinerary(
      itinerary.map((s, i) => (i === idx ? { ...s, ...patch } : s))
    );
  };

  const deleteStop = (idx: number) => {
    const next = itinerary.filter((_, i) => i !== idx);
    setItinerary(next.length ? next : [newStop(dayjs())]);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const next = reorder(itinerary, result.source.index, result.destination.index);
    setItinerary(next);
  };

  const handleClear = () => {
    setShowClearDialog(false);
    const cleared = [newStop(dayjs())];
    if (onClear) onClear();
    setItinerary(cleared);
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
                          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={1}>
                            <Box {...drag.dragHandleProps} sx={{ display: "flex", alignItems: "center", px: 1 }}>
                              <DragIndicatorIcon fontSize="small" />
                            </Box>

                            <Typography sx={{ width: 72, minWidth: 72 }} color="text.secondary">
                              Day {idx + 1}
                            </Typography>

                            <LocationAutocomplete
                              value={stop.location}
                              onChangeText={(text) => updateStop(idx, { location: text })}
                              onSetMapLocation={handleSetMapLocation}
                            />
                            {/* <Autocomplete
                              freeSolo
                              options={suggestions}
                              value={stop.location}
                              onInputChange={(_, newValue) => updateStop(idx, { location: newValue })}
                              sx={{ flex: 1, minWidth: 240 }}
                              renderInput={(params) => (
                                <TextField {...params} label="Location" placeholder="City, place, or address" />
                              )}
                            /> */}

                            <DatePicker
                              label="Date"
                              value={stop.date ? dayjs(stop.date) : null}
                              onChange={(d) => updateStop(idx, { date: toISODate(d) })}
                              slotProps={{ textField: { sx: { minWidth: 180 } } }}
                            />

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

          {/* Helper: Derived JSON preview for integration/testing */}
          <Box mt={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Current Itinerary (JSON)
            </Typography>
            <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 12, overflow: "auto" }}>
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

// ---------------- Usage Notes ----------------
// 1) This component is self-contained and manages its own state unless you pass `value` + `onChange`.
// 2) For production, swap the Autocomplete `options` with a Places service (Google Places, Mapbox, or OpenStreetMap Nominatim).
//    You can still keep `freeSolo` so users can type arbitrary locations.
// 3) The `@hello-pangea/dnd` package handles drag-and-drop reordering; ensure it's installed.
// 4) MUI Date Picker requires @mui/x-date-pickers and dayjs.
// 5) The JSON preview at the bottom is for developer testing; you can remove it later.
