import dayjs from "dayjs";

function formatDateShort(date, locale = "en-US") {
  return new Date(date).toLocaleDateString(locale, {
    dateStyle: "short",
  });
}

function formatDateLong(date, locale = "en-US") {
  return new Date(date || new Date()).toLocaleDateString(locale, {
    dateStyle: "medium",
  });
}

function formatTime(date, locale = "en-US") {
  return new Date(date).toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "numeric",
  });
}

function getDateDiff(date1, date2) {
  return dayjs(date1).diff(dayjs(date2), "day");
}

export { formatDateShort, formatDateLong, formatTime, getDateDiff };
