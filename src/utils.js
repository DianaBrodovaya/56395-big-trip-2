import dayjs from 'dayjs';

const DATE_FORMAT = 'DD/MM/YY HH:mm';
const TIME_FORMAT = 'HH:mm';
const DAY_FORMAT = 'MMM D';

const humanizeDate = (date) => date ? dayjs(date).format(DATE_FORMAT) : '';
const humanizeTime = (date) => date ? dayjs(date).format(TIME_FORMAT) : '';
const humanizeDay = (date) => date ? dayjs(date).format(DAY_FORMAT).toUpperCase() : '';

const getDuration = (startDate, endDate) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  const diffInMinutes = end.diff(start, 'minute');
  const diffInHours = end.diff(start, 'hour');
  const diffInDays = end.diff(start, 'day');

  const formatValue = (value) => String(value).padStart(2, '0');

  const minutes = formatValue(diffInMinutes % 60);
  const hours = formatValue(diffInHours % 24);
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
