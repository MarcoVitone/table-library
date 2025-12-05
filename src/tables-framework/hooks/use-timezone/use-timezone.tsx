import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const useTimezone = () => {
  const timezone = "Europe/Rome";

  const getTimezoneOffset = (timezone: string, date: Dayjs): number => {
    const localDate = date.tz(timezone);
    const utcDate = date.utc();

    const offset = localDate.diff(utcDate, "minute");
    return offset;
  };
  const convertUTCToTimezone = (dateString?: string | Dayjs): string => {
    if (!dateString) return "";
    if (!timezone) return dateString as string;
    const utcDate = new Date(dateString as string);

    const utcTimestamp = utcDate.getTime();

    const timezoneOffset = getTimezoneOffset(timezone, dayjs(utcDate));

    const timezoneTimestamp = utcTimestamp + timezoneOffset * 60 * 1000;

    const dateInTimezone = new Date(timezoneTimestamp);
    const year = dateInTimezone.getFullYear();
    const month = String(dateInTimezone.getMonth() + 1).padStart(2, "0");
    const day = String(dateInTimezone.getDate()).padStart(2, "0");
    const hours = String(dateInTimezone.getHours()).padStart(2, "0");
    const minutes = String(dateInTimezone.getMinutes()).padStart(2, "0");
    const seconds = String(dateInTimezone.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const setTimezoneDatePickerPayload = (date: string): string => {
    const currentDateTime = dayjs().tz(timezone);
    const datePayload = dayjs(date)
      .tz(timezone)
      .hour(currentDateTime.hour())
      .minute(currentDateTime.minute())
      .second(currentDateTime.second())
      .millisecond(currentDateTime.millisecond())
      .format();
    return datePayload;
  };

  return {
    timezone,
    convertUTCToTimezone,
    setTimezoneDatePickerPayload,
  };
};

export { useTimezone };
