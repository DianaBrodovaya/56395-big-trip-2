import { render } from '../framework/render.js';
import EventListView from '../view/event-list-view.js';
import SortView from '../view/sort-view.js';
import NoEventView from '../view/no-event-view.js';
import EventPresenter from './event-presenter.js';
import { sortEventDay, sortEventTime, sortEventPrice } from '../utils/sort.js';
import { SortType } from '../const.js';

export default class BoardPresenter {
  #boardContainer = null;
  #eventModel = null;
  #eventListComponent = new EventListView();
  #pointPresenters = new Map();

  #sortComponent = null;
  #currentSortType = SortType.DAY;

  constructor({ boardContainer, eventModel }) {
    this.#boardContainer = boardContainer;
    this.#eventModel = eventModel;
  }

  get events() {
    switch (this.#currentSortType) {
      case SortType.TIME:
        return [...this.#eventModel.events].sort(sortEventTime);
      case SortType.PRICE:
        return [...this.#eventModel.events].sort(sortEventPrice);
    }
    return [...this.#eventModel.events].sort(sortEventDay);
  }

  init() {
    if (this.events.length === 0) {
      render(new NoEventView(), this.#boardContainer);
      return;
    }

    this.#renderSort();
    render(this.#eventListComponent, this.#boardContainer);
    this.#renderEvents();
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearEventList();
    this.#renderEvents();
  };

  #handleEventChange = (updatedEvent) => {
    this.#eventModel.updateEvent(updatedEvent);

    const presenterKey = updatedEvent.id || updatedEvent;
    this.#pointPresenters.get(presenterKey).init(
      updatedEvent,
      this.#eventModel.destinations,
      this.#eventModel.offers
    );
  };

  #clearEventList() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #renderSort() {
    this.#sortComponent = new SortView({
      onSortTypeChange: this.#handleSortTypeChange
    });
    render(this.#sortComponent, this.#boardContainer);
  }

  #renderEvents() {
    for (const event of this.events) {
      this.#renderEvent(event, this.#eventModel.destinations, this.#eventModel.offers);
    }
  }

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
