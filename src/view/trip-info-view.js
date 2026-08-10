import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';
import he from 'he';

const MAX_CITIES_IN_ROUTE = 3;
const INDEX_OFFSET = 1;

const createTripInfoTemplate = (events, destinations, offers) => {
  if (events.length === 0) {
    return '';
  }

  const cities = events.map((event) => {
    const eventDestination = destinations.find((item) => item.id === event.destination);
    return eventDestination ? eventDestination.name : '';
  }).filter((city) => city !== '');

  const escapedCities = cities.map((city) => he.escape(city));

  const routeTitle = escapedCities.length <= MAX_CITIES_IN_ROUTE
    ? escapedCities.join(' &mdash; ')
    : `${escapedCities[0]} &mdash; ... &mdash; ${escapedCities[escapedCities.length - INDEX_OFFSET]}`;

  const firstevent = events[0];
  const lastevent = events[events.length - INDEX_OFFSET];

  const dateStart = dayjs(firstevent.dateFrom).format('MMM D');
  const isSameMonth = dayjs(firstevent.dateFrom).isSame(dayjs(lastevent.dateTo), 'month');
  const dateEnd = dayjs(lastevent.dateTo).format(isSameMonth ? 'D' : 'MMM D');

  const routePeriod = `${dateStart}&nbsp;&mdash;&nbsp;${dateEnd}`;

  const totalPrice = events.reduce((sum, event) => {
    let price = event.basePrice;

    const typeOffersObj = offers.find((offer) => offer.type === event.type);
    if (typeOffersObj) {
      const selectedOffers = typeOffersObj.offers.filter((offer) => event.offers.includes(offer.id));
      const offersPrice = selectedOffers.reduce((offerSum, offer) => offerSum + offer.price, 0);
      price += offersPrice;
    }

    return sum + price;
  }, 0);

  return (
    `<section class="trip-main__trip-info  trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${routeTitle}</h1>
        <p class="trip-info__dates">${routePeriod}</p>
      </div>

      <p class="trip-info__cost">
        Total: &euro;&nbsp;<span class="trip-info__cost-value">
          ${he.escape(String(totalPrice))}
        </span>
      </p>
    </section>`
  );
};

export default class TripInfoView extends AbstractView {
  #events = null;
  #destinations = null;
  #offers = null;

  constructor(events, destinations, offers) {
    super();
    this.#events = events;
    this.#destinations = destinations;
    this.#offers = offers;
  }

  get template() {
    return createTripInfoTemplate(this.#events, this.#destinations, this.#offers);
  }
}
