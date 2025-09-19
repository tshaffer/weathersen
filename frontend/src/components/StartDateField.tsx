import React from "react";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { DateValidationError } from "@mui/x-date-pickers/models";
import { InputAdornment, Typography } from "@mui/material";

const minDate = dayjs().startOf("day");
type PickerValue = Dayjs | null;

function clampDate(v: Dayjs, min: Dayjs) {
  return v.isBefore(min, "day") ? min : v;
}

export const StartDateField: React.FC<{
  idx: number;
  stop: { date?: string | null };
  updateStopDate: (idx: number, iso: string | null) => void;
  toISODate: (d: PickerValue) => string | null;
}> = ({ idx, stop, updateStopDate, toISODate }) => {
  const [error, setError] = React.useState<string | null>(null);
  const [lastValid, setLastValid] = React.useState<Dayjs | null>(
    stop?.date ? dayjs(stop.date) : null
  );

  const handleError = (reason: DateValidationError) => {
    const msg =
      reason === "invalidDate"
        ? "Enter a valid date."
        : reason === "minDate" || reason === "disablePast"
          ? `Date must be on/after ${minDate.format("MMM D, YYYY")}.`
          : null;
    setError(msg);
  };

  const commit = (d: PickerValue) => {
    if (!d || !d.isValid()) {
      updateStopDate(idx, toISODate(lastValid));
      return;
    }
    const clamped = clampDate(d, minDate);
    setLastValid(clamped);
    setError(null);
    updateStopDate(idx, toISODate(clamped));
  };

  return (
    <DatePicker
      // no floating label — we use a startAdornment instead
      label={null as any}
      value={stop.date ? dayjs(stop.date) : null}
      onChange={() => { }}
      onAccept={commit}
      onError={handleError}
      disablePast
      minDate={minDate}
      format="YYYY-MM-DD"
      shouldDisableDate={(d) => d.isBefore(minDate, "day")}
      closeOnSelect
      slotProps={{
        textField: {
          size: "small",                         // compact height
          sx: {
            minWidth: 170,
            "& .MuiInputBase-input": { py: 0.75, lineHeight: 1.4 },
          },
          // Put "Start:" inside the input so it aligns perfectly
          InputProps: {
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: 0.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1 }}>
                  Start:
                </Typography>
              </InputAdornment>
            ),
          },
          // Only show helper text when there's an error (keeps height tight)
          error: Boolean(error),
          helperText: error ?? undefined,
          onBlur: (e: any) => {
            const v = (e.target as HTMLInputElement).value;
            const parsed = v ? dayjs(v) : null;
            commit(parsed && parsed.isValid() ? parsed : null);
          },
        },
      }}
    />
  );
};
