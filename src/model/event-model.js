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

  set events(updatedEvents) {
    this.#events = [...updatedEvents];
  }

  get destinations() {
    return [...this.#destinations];
  }

  get offers() {
    return [...this.#offers];
  }

  updateEvent(updatedEvent) {
    const index = this.#events.findIndex((event) => event.id === updatedEvent.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting event');
    }

    this.#events = [
      ...this.#events.slice(0, index),
      updatedEvent,
      ...this.#events.slice(index + 1),
    ];
  }
}
