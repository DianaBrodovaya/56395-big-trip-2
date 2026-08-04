import Observable from '../framework/observable.js';
import { UpdateType } from '../const.js';

export default class EventModel extends Observable {
  #eventsApiService = null;
  #events = [];
  #destinations = [];
  #offers = [];

  constructor({ eventsApiService }) {
    super();
    this.#eventsApiService = eventsApiService;
  }

  get events() {
    return this.#events;
  }

  get destinations() {
    return this.#destinations;
  }

  get offers() {
    return this.#offers;
  }

  async init() {
    try {
      const events = await this.#eventsApiService.events;
      this.#events = events.map(this.#adaptToClient);
      this.#destinations = await this.#eventsApiService.destinations;
      this.#offers = await this.#eventsApiService.offers;

    } catch (err) {
      this.#events = [];
      this.#destinations = [];
      this.#offers = [];
    }

    this._notify(UpdateType.INIT);
  }

  async updateEvent(updateType, updatedEvent) {
    const index = this.#events.findIndex((event) => event.id === updatedEvent.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting event');
    } try {
      const response = await this.#eventsApiService.updateEvent(updatedEvent);
      const adaptedEvent = this.#adaptToClient(response);
      this.#events = [
        ...this.#events.slice(0, index),
        adaptedEvent,
        ...this.#events.slice(index + 1),
      ];
      this._notify(updateType, adaptedEvent);
    } catch (err) {
      throw new Error('Can\'t update event on server');
    }
  }

  async addEvent(updateType, update) {
    try {
      const response = await this.#eventsApiService.addEvent(update);
      const newEvent = this.#adaptToClient(response);
      this.#events = [newEvent, ...this.#events];
      this._notify(updateType, newEvent);
    } catch (err) {
      throw new Error('Can\'t add event');
    }
  }

  async deleteEvent(updateType, update) {
    const index = this.#events.findIndex((event) => event.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting event');
    } try {
      await this.#eventsApiService.deleteEvent(update);

      this.#events = [
        ...this.#events.slice(0, index),
        ...this.#events.slice(index + 1),
      ];

      this._notify(updateType);
    } catch (err) {
      throw new Error('Can\'t delete event');
    }
  }

  #adaptToClient(event) {
    const adaptedEvent = {
      ...event,
      basePrice: event['base_price'],
      dateFrom: event['date_from'] !== null ? new Date(event['date_from']) : event['date_from'],
      dateTo: event['date_to'] !== null ? new Date(event['date_to']) : event['date_to'],
      isFavorite: event['is_favorite'],
    };

    delete adaptedEvent['base_price'];
    delete adaptedEvent['date_from'];
    delete adaptedEvent['date_to'];
    delete adaptedEvent['is_favorite'];

    return adaptedEvent;
  }
}
