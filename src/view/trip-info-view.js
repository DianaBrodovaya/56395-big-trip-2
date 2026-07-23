import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';

const createTripInfoTemplate = (route, dates, totalPrice) => (
  `<section class="trip-main__trip-info  trip-info">
    <div class="trip-info__main">
      <h1 class="trip-info__title">${route}</h1>
      <p class="trip-info__dates">${dates}</p>
    </div>
    <p class="trip-info__cost">
      Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalPrice}</span>
    </p>
  </section>`
);

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
    return createTripInfoTemplate(this.#getRoute(), this.#getDates(), this.#getTotalPrice());
  }

  #getRoute() {
    const names = this.#events.map((event) => {
      const destinationObj = this.#destinations.find((item) => item.id === event.destination);
      return destinationObj ? destinationObj.name : '';
    }).filter(Boolean);

    if (names.length === 0) {
      return '';
    }

    if (names.length <= 3) {
      return names.join(' &mdash; ');
    }

    return `${names[0]} &mdash; &hellip; &mdash; ${names[names.length - 1]}`;
  }

  #getDates() {
    if (this.#events.length === 0) {
      return '';
    }

    const startEvent = this.#events[0];
    const endEvent = this.#events[this.#events.length - 1];

    const start = dayjs(startEvent.dateFrom);
    const end = dayjs(endEvent.dateTo);

    if (start.format('MMM') === end.format('MMM')) {
      return `${start.format('D')}&nbsp;&mdash;&nbsp;${end.format('D')} ${start.format('MMM').toUpperCase()}`;
    }

    return `${start.format('D MMM').toUpperCase()}&nbsp;&mdash;&nbsp;${end.format('D MMM').toUpperCase()}`;
  }

  #getTotalPrice() {
    return this.#events.reduce((total, event) => {
      let price = total + event.basePrice;

      const typeOffersObj = this.#offers.find((offer) => offer.type === event.type);
      if (typeOffersObj) {
        const selectedOffers = typeOffersObj.offers.filter((offer) => event.offers.includes(offer.id));
        price += selectedOffers.reduce((sum, offer) => sum + offer.price, 0);
      }

      return price;
    }, 0);
  }
}
