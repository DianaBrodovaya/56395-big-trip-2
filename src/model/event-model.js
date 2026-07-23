import Observable from '../framework/observable.js';
import { destinations } from '../mock/destinations-mock.js';
import { offers } from '../mock/offers-mock.js';
import { events } from '../mock/events-mock.js';

export default class EventModel extends Observable {
  #events = [];
  #destinations = [];
  #offers = [];

  constructor() {
    super();
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

  updateEvent(updateType, updatedEvent) {
    const index = this.#events.findIndex((event) => event.id === updatedEvent.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting event');
    }

    this.#events = [
      ...this.#events.slice(0, index),
      updatedEvent,
      ...this.#events.slice(index + 1),
    ];

    this._notify(updateType, updatedEvent);
  }

  addEvent(updateType, newEvent) {
    this.#events = [
      newEvent,
      ...this.#events,
    ];

    this._notify(updateType, newEvent);
  }

  deleteEvent(updateType, targetEvent) {
    const index = this.#events.findIndex((event) => event.id === targetEvent.id);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting event');
    }

    this.#events = [
      ...this.#events.slice(0, index),
      ...this.#events.slice(index + 1),
    ];

    this._notify(updateType);
  }
}
