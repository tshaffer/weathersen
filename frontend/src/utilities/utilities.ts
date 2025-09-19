import { Dayjs } from "dayjs";

export const toISODate = (d: Dayjs | null): string => (d ? d.format("YYYY-MM-DD") : "");
