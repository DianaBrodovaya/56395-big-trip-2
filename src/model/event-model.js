import { destinations } from '../mock/destinations-mock.js';
import { offers } from '../mock/offers-mock.js';
import { events } from '../mock/events-mock.js';

export default class EventModel {
  #events = [];
  #destinations = [];
  #offers = [];

  constructor() {
    this.#events = events;
    this.#destinations = destinations;
    this.#offers = offers;
  }

  get events() {
    return [...this.#events];
  }

  get destinations() {
    return [...this.#destinations];
  }

  get offers() {
    return [...this.#offers];
  }
}
