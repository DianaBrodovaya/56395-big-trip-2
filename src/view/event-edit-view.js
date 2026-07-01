import AbstractView from '../framework/view/abstract-view.js';
import { EVENT_TYPES } from '../const.js';
import { humanizeDate } from '../utils.js';

const upFirstLetter = (word) => `${word[0].toUpperCase()}${word.slice(1)}`;
const formatOfferTitle = (title) => title.split(' ').join('_');

const createEventEditTemplate = (event, destinations, offers) => {
  const { dateFrom, dateTo, basePrice, type } = event;
  const eventId = event.id || 0;
  const eventDestination = destinations.find((destination) => destination.id === event.destination);
  const { name, description, pictures } = eventDestination || {};
  const typeOffersObj = offers.find((offer) => offer.type === type);
  const typeOffers = typeOffersObj ? typeOffersObj.offers : [];
  const eventOffers = typeOffers.filter((typeOffer) => event.offers.includes(typeOffer.id));

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-${eventId}">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${eventId}" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>

                ${EVENT_TYPES.map((eventType) => `
                  <div class="event__type-item">
                    <input id="event-type-${eventType}-${eventId}"
                           class="event__type-input  visually-hidden"
                           type="radio"
                           name="event-type"
                           value="${eventType}"
                           ${eventType === type ? 'checked' : ''}>
                    <label class="event__type-label  event__type-label--${eventType}" for="event-type-${eventType}-${eventId}">${upFirstLetter(eventType)}</label>
                  </div>
                `).join('')}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-${eventId}">
              ${type}
            </label>
            <input class="event__input  event__input--destination"
                  id="event-destination-${eventId}"
                  type="text"
                  name="event-destination"
                  value="${name || ''}"
                  list="destination-list-${eventId}"
                  autocomplete="off"
                  onfocus="this.dataset.oldValue = this.value; this.value = ''; this.blur(); this.focus();"
                  onblur="if (!this.value) { this.value = this.dataset.oldValue; }">

            <datalist id="destination-list-${eventId}">
              ${destinations.map((destination) => `
                <option value="${destination.name}"></option>
              `).join('')}
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-${eventId}">From</label>
            <input class="event__input  event__input--time" id="event-start-time-${eventId}" type="text"
              name="event-start-time" value="${humanizeDate(dateFrom)}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-${eventId}">To</label>
            <input class="event__input  event__input--time" id="event-end-time-${eventId}" type="text"
              name="event-end-time" value="${humanizeDate(dateTo)}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-${eventId}">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-${eventId}" type="text"
            name="event-price" value="${basePrice}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>

        <section class="event__details">
        ${typeOffers.length ?
      `<section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>

            <div class="event__available-offers">
              ${typeOffers.map((typeOffer) => {
      const isChecked = eventOffers.map((offer) => offer.id).includes(typeOffer.id) ? 'checked' : '';
      const formattedTitle = formatOfferTitle(typeOffer.title);

      return (
        `<div class="event__offer-selector">
                <input class="event__offer-checkbox  visually-hidden" id="event-offer-${formattedTitle}-${eventId}" type="checkbox"
                  name="event-offer-${formattedTitle}" ${isChecked}>
                <label class="event__offer-label" for="event-offer-${formattedTitle}-${eventId}">
                  <span class="event__offer-title">${typeOffer.title}</span>
                  &plus;&euro;&nbsp;
                  <span class="event__offer-price">${typeOffer.price}</span>
                </label>
              </div>`
      );
    }).join('')}
            </div>
          </section>`
      : ''}


    ${eventDestination ? (
      `<section class="event__section  event__section--destination">
            <h3 class="event__section-title  event__section-title--destination">Destination</h3>
            <p class="event__destination-description">${description}</p>
          ${pictures && pictures.length ? (
        `<div class="event__photos-container">
              <div class="event__photos-tape">
                ${pictures.map((picture) => `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`).join('')}
                </div>
              </div>`
      ) : ''}
        </section>`
    ) : ''}
        </section>
      </form>
    </li>`
  );
};

export default class EventEditView extends AbstractView {
  #event = null;
  #destinations = null;
  #offers = null;
  #handleFormSubmit = null;
  #handleRollupClick = null;

  constructor(event, destinations, offers, { onFormSubmit, onRollupClick }) {
    super();
    this.#event = event;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleRollupClick = onRollupClick;

    this.element.querySelector('form')
      .addEventListener('submit', this.#formSubmitHandler);

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#rollupClickHandler);
  }

  get template() {
    return createEventEditTemplate(this.#event, this.#destinations, this.#offers);
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit();
  };

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleRollupClick();
  };
}
