import he from 'he';

const upFirstLetter = (word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`;

const TypeInPreposition = {
  CHECK_IN: 'check-in',
  SIGHTSEEING: 'sightseeing',
  RESTAURANT: 'restaurant'
};

const getEventTitle = (type, cityName = '') => {
  const preposition = Object.values(TypeInPreposition).includes(type) ? 'in' : 'to';
  const formattedType = upFirstLetter(type);

  if (cityName) {
    return `${formattedType} ${preposition} ${he.escape(cityName)}`;
  }

  return `${formattedType} ${preposition}`;
};

const isEscapeKey = (evt) => evt.key === 'Escape' || evt.key === 'Esc';

const getCheckedInputValue = (evt) => {
  if (evt.target.tagName !== 'INPUT') {
    return null;
  }

  evt.preventDefault();
  return evt.target.value;
};

export { upFirstLetter, getEventTitle, isEscapeKey, getCheckedInputValue };
