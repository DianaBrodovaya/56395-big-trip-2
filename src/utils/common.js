import he from 'he';
import { TYPE_IN_PREPOSITIONS } from '../const';

const updateItem = (items, update) => items.map((item) => item.id === update.id ? update : item);

const getEventTitle = (type, cityName = '') => {
  const preposition = TYPE_IN_PREPOSITIONS.includes(type) ? 'in' : 'to';
  const formattedType = type.charAt(0).toUpperCase() + type.slice(1);

  if (cityName) {
    return `${formattedType} ${preposition} ${he.escape(cityName)}`;
  }

  return `${formattedType} ${preposition}`;
};

export { updateItem, getEventTitle };
