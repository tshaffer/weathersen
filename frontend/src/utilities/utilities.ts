import dayjs, { Dayjs } from "dayjs";
import type { PickerValue } from "@mui/x-date-pickers/internals";

// Overloads
export function toISODate(d: Dayjs): string;
export function toISODate(d?: PickerValue | null): string | null;

// Impl
export function toISODate(d?: Dayjs | PickerValue | null): string | null {
  if (!d) return null;
  const dj = dayjs.isDayjs(d) ? d : dayjs(d);
  return dj.isValid() ? dj.format("YYYY-MM-DD") : null;
}
