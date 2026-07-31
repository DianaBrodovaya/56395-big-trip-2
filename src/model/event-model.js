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
      const [events, destinations, offers] = await Promise.all([
        this.#eventsApiService.events,
        this.#eventsApiService.destinations,
        this.#eventsApiService.offers
      ]);

      this.#events = events.map(this.#adaptToClient);
      this.#destinations = destinations;
      this.#offers = offers;
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
    }
    try {
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
