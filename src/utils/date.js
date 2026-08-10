import dayjs from 'dayjs';

const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;
const MIN_DIGITS_COUNT = 2;

const DateFormat = {
  DATE: 'DD/MM/YY HH:mm',
  TIME: 'HH:mm',
  DAY: 'MMM D',
};

const humanizeDate = (date) => date ? dayjs(date).format(DateFormat.DATE) : '';
const humanizeTime = (date) => date ? dayjs(date).format(DateFormat.TIME) : '';
const humanizeDay = (date) => date ? dayjs(date).format(DateFormat.DAY).toUpperCase() : '';

const getDuration = (startDate, endDate) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  const diffInMinutes = end.diff(start, 'minute');
  const diffInHours = end.diff(start, 'hour');
  const diffInDays = end.diff(start, 'day');

  const formatValue = (value) => String(value).padStart(MIN_DIGITS_COUNT, '0');

  const minutes = formatValue(diffInMinutes % MINUTES_IN_HOUR);
  const hours = formatValue(diffInHours % HOURS_IN_DAY);
  const days = formatValue(diffInDays);

  if (diffInDays > 0) {
    return `${days}D ${hours}H ${minutes}M`;
  }

  if (diffInHours > 0) {
    return `${hours}H ${minutes}M`;
  }

  return `${minutes}M`;
};

export { humanizeDate, humanizeTime, humanizeDay, getDuration };
