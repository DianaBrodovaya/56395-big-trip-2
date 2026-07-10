import dayjs from 'dayjs';

const sortEventDay = (eventA, eventB) => dayjs(eventA.dateFrom).diff(dayjs(eventB.dateFrom));

const sortEventTime = (eventA, eventB) => {
  const durationA = dayjs(eventA.dateTo).diff(dayjs(eventA.dateFrom));
  const durationB = dayjs(eventB.dateTo).diff(dayjs(eventB.dateFrom));
  return durationB - durationA;
};

const sortEventPrice = (eventA, eventB) => eventB.basePrice - eventA.basePrice;

export { sortEventDay, sortEventTime, sortEventPrice };
