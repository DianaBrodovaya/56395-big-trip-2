import he from 'he';
import { TypeInPreposition } from '../const';

const getEventTitle = (type, cityName = '') => {
  const preposition = Object.values(TypeInPreposition).includes(type) ? 'in' : 'to';
  const formattedType = type.charAt(0).toUpperCase() + type.slice(1);

  if (cityName) {
    return `${formattedType} ${preposition} ${he.escape(cityName)}`;
  }

  return `${formattedType} ${preposition}`;
};

export { getEventTitle };
