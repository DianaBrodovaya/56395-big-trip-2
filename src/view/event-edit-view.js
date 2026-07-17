import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { EVENT_TYPES } from '../const.js';
import { humanizeDate } from '../utils/date.js';

import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const upFirstLetter = (word) => `${word[0].toUpperCase()}${word.slice(1)}`;
const formatOfferTitle = (title) => title.split(' ').join('_');

const createEventEditTemplate = (state, destinations, offers) => {
  const { dateFrom, dateTo, basePrice, type, destination, offers: selectedOffersIds, id } = state;
  const eventId = id || 0;

  const eventDestination = destinations.find((item) => item.id === destination);
  const { name, description, pictures } = eventDestination || {};

  const typeOffersObj = offers.find((offer) => offer.type === type);
  const typeOffers = typeOffersObj ? typeOffersObj.offers : [];

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
            <input class="event__input  event__input--destination" id="event-destination-${eventId}" type="text"
              name="event-destination" value="${name || ''}" list="destination-list-edit-${eventId}" autocomplete="off">
            <datalist id="destination-list-edit-${eventId}">
              ${destinations.map((item) => `
                <option value="${item.name}"></option>
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
          ${typeOffers.length ? `
            <section class="event__section  event__section--offers">
              <h3 class="event__section-title  event__section-title--offers">Offers</h3>
              <div class="event__available-offers">
                ${typeOffers.map((typeOffer) => {
      const isChecked = selectedOffersIds.includes(typeOffer.id) ? 'checked' : '';
      const formattedTitle = formatOfferTitle(typeOffer.title);
      return (
        `<div class="event__offer-selector">
                      <input class="event__offer-checkbox  visually-hidden"
                             id="event-offer-${formattedTitle}-${eventId}"
                             type="checkbox"
                             name="event-offer-${formattedTitle}"
                             data-offer-id="${typeOffer.id}"
                             ${isChecked}>
                      <label class="event__offer-label" for="event-offer-${formattedTitle}-${eventId}">
                        <span class="event__offer-title">${typeOffer.title}</span>
                        &plus;&euro;&nbsp;
                        <span class="event__offer-price">${typeOffer.price}</span>
                      </label>
                    </div>`
      );
    }).join('')}
              </div>
            </section>
          ` : ''}

          ${eventDestination && (description || (pictures && pictures.length)) ? `
            <section class="event__section  event__section--destination">
              <h3 class="event__section-title  event__section-title--destination">Destination</h3>
              ${description ? `<p class="event__destination-description">${description}</p>` : ''}
              ${pictures && pictures.length ? `
                <div class="event__photos-container">
                  <div class="event__photos-tape">
                    ${pictures.map((picture) => `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`).join('')}
                  </div>
                </div>
              ` : ''}
            </section>
          ` : ''}
        </section>
      </form>
    </li>`
  );
};

export default class EventEditView extends AbstractStatefulView {
  #destinations = null;
  #offers = null;
  #handleFormSubmit = null;
  #handleRollupClick = null;

  #datepickerFrom = null;
  #datepickerTo = null;

  constructor(event, destinations, offers, { onFormSubmit, onRollupClick }) {
    super();
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleRollupClick = onRollupClick;

    this._setState(EventEditView.parseEventToState(event));
    this._restoreHandlers();
  }

  get template() {
    return createEventEditTemplate(this._state, this.#destinations, this.#offers);
  }

  removeElement() {
    super.removeElement();

    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }

    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  }

  _restoreHandlers() {
    this.element.querySelector('form')
      .addEventListener('submit', this.#formSubmitHandler);

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#rollupClickHandler);

    this.element.querySelector('.event__type-group')
      .addEventListener('change', this.#typeChangeHandler);

    this.element.querySelector('.event__input--destination')
      .addEventListener('change', this.#destinationChangeHandler);

    const offersContainer = this.element.querySelector('.event__available-offers');
    if (offersContainer) {
      offersContainer.addEventListener('change', this.#offersChangeHandler);
    }

    this.#setDatepicker();
  }

  reset(event) {
    this.updateElement(
      EventEditView.parseEventToState(event)
    );
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(EventEditView.parseStateToEvent(this._state));
  };

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleRollupClick();
  };

  #typeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'INPUT') {
      return;
    }
    evt.preventDefault();
    this.updateElement({
      type: evt.target.value,
      offers: [],
    });
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const selectedDestination = this.#destinations.find((item) => item.name === evt.target.value);

    if (!selectedDestination) {
      evt.target.value = '';
      return;
    }

    this.updateElement({
      destination: selectedDestination.id,
    });
  };

  #offersChangeHandler = (evt) => {
    if (evt.target.tagName !== 'INPUT') {
      return;
    }
    evt.preventDefault();

    const clickedOfferId = evt.target.dataset.offerId;
    const isChecked = evt.target.checked;
    let updatedOffers = [...this._state.offers];

    if (isChecked) {
      updatedOffers.push(clickedOfferId);
    } else {
      updatedOffers = updatedOffers.filter((id) => id !== clickedOfferId);
    }

    this._setState({
      offers: updatedOffers
    });
  };

  #setDatepicker() {
    const eventId = this._state.id || 0;

    const commonConfig = {
      enableTime: true,
      'time_24hr': true,
      dateFormat: 'd/m/y H:i',
    };

    this.#datepickerFrom = flatpickr(
      this.element.querySelector(`#event-start-time-${eventId}`),
      {
        ...commonConfig,
        defaultDate: this._state.dateFrom,
        maxDate: this._state.dateTo,
        onChange: this.#dateFromChangeHandler,
      },
    );

    this.#datepickerTo = flatpickr(
      this.element.querySelector(`#event-end-time-${eventId}`),
      {
        ...commonConfig,
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom,
        onChange: this.#dateToChangeHandler,
      },
    );
  }

  #dateFromChangeHandler = ([userDate]) => {
    this._setState({
      dateFrom: userDate,
    });
    this.#datepickerTo.set('minDate', this._state.dateFrom);
  };

  #dateToChangeHandler = ([userDate]) => {
    this._setState({
      dateTo: userDate,
    });
    this.#datepickerFrom.set('maxDate', this._state.dateTo);
  };

  static parseEventToState(event) {
    return { ...event };
  }

  static parseStateToEvent(state) {
    return { ...state };
  }
}
