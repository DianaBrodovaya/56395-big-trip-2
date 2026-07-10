import { render } from '../framework/render.js';
import EventListView from '../view/event-list-view.js';
import SortView from '../view/sort-view.js';
import NoEventView from '../view/no-event-view.js';
import EventPresenter from './event-presenter.js';
import { updateItem } from '../utils/common.js';

export default class BoardPresenter {
  #boardContainer = null;
  #eventModel = null;
  #eventListComponent = new EventListView();
  #pointPresenters = new Map();

  #boardEvents = [];
  #destinations = [];
  #offers = [];

  constructor({ boardContainer, eventModel }) {
    this.#boardContainer = boardContainer;
    this.#eventModel = eventModel;
  }

  init() {
    this.#boardEvents = [...this.#eventModel.events];
    this.#destinations = [...this.#eventModel.destinations];
    this.#offers = [...this.#eventModel.offers];

    if (this.#boardEvents.length === 0) {
      render(new NoEventView(), this.#boardContainer);
      return;
    }

    render(new SortView(), this.#boardContainer);
    render(this.#eventListComponent, this.#boardContainer);

    for (const event of this.#boardEvents) {
      this.#renderEvent(event, this.#destinations, this.#offers);
    }
  }

  #handleEventChange = (updatedEvent) => {
    this.#boardEvents = updateItem(this.#boardEvents, updatedEvent);

    const presenterKey = updatedEvent.id || updatedEvent;
    this.#pointPresenters.get(presenterKey).init(updatedEvent, this.#destinations, this.#offers);
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #renderEvent(event, destinations, offers) {
    const eventPresenter = new EventPresenter({
      eventListContainer: this.#eventListComponent.element,
      onModeChange: this.#handleModeChange,
      onDataChange: this.#handleEventChange
    });

    eventPresenter.init(event, destinations, offers);

    const eventKey = event.id || event;
    this.#pointPresenters.set(eventKey, eventPresenter);
  }
}
