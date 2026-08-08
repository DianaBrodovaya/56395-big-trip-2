import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { FilterType } from '../const.js';

const filter = {
  [FilterType.EVERYTHING]: (events) => events,
  [FilterType.FUTURE]: (events) => events.filter((event) => dayjs(event.dateFrom).isAfter(dayjs())),
  [FilterType.PRESENT]: (events) => events.filter((event) => dayjs(event.dateFrom).isSameOrBefore(dayjs()) && dayjs(event.dateTo).isSameOrAfter(dayjs())),
  [FilterType.PAST]: (events) => events.filter((event) => dayjs(event.dateTo).isBefore(dayjs())),
};

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export { FilterType, filter };
