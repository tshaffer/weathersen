import React from "react";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { DateValidationError } from '@mui/x-date-pickers/models';

const minDate = dayjs().startOf("day");
const maxDate = minDate.add(9, "day").endOf("day");

function clampDate(v: Dayjs, min: Dayjs, max: Dayjs) {
  if (v.isBefore(min, "day")) return min;
  if (v.isAfter(max, "day")) return max;
  return v;
}

type PickerValue = Dayjs | null;

export const StopDateField: React.FC<{
  idx: number;
  stop: { date?: string | null };
  updateStopDate: (idx: number, iso: string | null) => void;
  toISODate: (d: PickerValue) => string | null;
}> = ({ idx, stop, updateStopDate, toISODate }) => {
  const [error, setError] = React.useState<string | null>(null);
  const [lastValid, setLastValid] = React.useState<Dayjs | null>(
    stop?.date ? dayjs(stop.date) : null
  );

  const handleError = (reason: DateValidationError, _value: PickerValue) => {
    console.log('DatePicker error:', reason, _value);
    // Map MUI reasons to friendly messages
    const msg =
      reason === "invalidDate"
        ? "Enter a valid date."
        : reason === "minDate" || reason === "disablePast"
          ? `Date must be on/after ${minDate.format("MMM D, YYYY")}.`
          : reason === "maxDate" || reason === "disableFuture"
            ? `Date must be on/before ${maxDate.format("MMM D, YYYY")}.`
            : null;
    setError(msg);
  };

  const handleChange = (d: PickerValue) => {
    // Let the picker update; we only persist if valid
    if (d && d.isValid()) {
      const clamped = clampDate(d, minDate, maxDate);
      if (clamped.isSame(d, "day")) {
        setLastValid(d);
      }
    }
  };

  const commit = (d: PickerValue) => {
    // Called from onAccept (picker close / Enter) and onBlur (typing)
    if (!d || !d.isValid()) {
      // Revert to last valid (or null)
      updateStopDate(idx, toISODate(lastValid));
      return;
    }
    const clamped = clampDate(d, minDate, maxDate);
    setLastValid(clamped);
    setError(null);
    updateStopDate(idx, toISODate(clamped));
  };

  return (
    <DatePicker
      label="Date"
      value={stop.date ? dayjs(stop.date) : null}
      onChange={handleChange}
      onAccept={commit}
      onError={handleError}
      slotProps={{
        textField: {
          onBlur: (e: any) => {
            const v = (e.target as HTMLInputElement).value;
            const parsed = v ? dayjs(v) : null;
            commit(parsed && parsed.isValid() ? parsed : null);
          },
          sx: { minWidth: 180 },
          error: Boolean(error),
          helperText: error ?? " ",
        },
      }}
      disablePast
      minDate={minDate}
      maxDate={maxDate}
      format="YYYY-MM-DD"
      shouldDisableDate={(d) => d.isBefore(minDate, "day") || d.isAfter(maxDate, "day")}
      closeOnSelect
    />
  );
};
