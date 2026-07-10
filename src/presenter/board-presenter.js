import { render } from '../framework/render.js';
import EventListView from '../view/event-list-view.js';
import SortView from '../view/sort-view.js';
import NoEventView from '../view/no-event-view.js';
import EventPresenter from './event-presenter.js';
import { updateItem } from '../utils/common.js';
import { SortType } from '../const.js';
import { sortEventDay, sortEventTime, sortEventPrice } from '../utils/sort.js';

export default class BoardPresenter {
  #boardContainer = null;
  #eventModel = null;
  #eventListComponent = new EventListView();
  #pointPresenters = new Map();

  #sourcedBoardEvents = [];
  #boardEvents = [];
  #destinations = [];
  #offers = [];

  #sortComponent = null;
  #currentSortType = SortType.DAY;

  constructor({ boardContainer, eventModel }) {
    this.#boardContainer = boardContainer;
    this.#eventModel = eventModel;
  }

  init() {
    this.#boardEvents = [...this.#eventModel.events].sort(sortEventDay);
    this.#sourcedBoardEvents = [...this.#eventModel.events].sort(sortEventDay);

    this.#destinations = [...this.#eventModel.destinations];
    this.#offers = [...this.#eventModel.offers];

    if (this.#boardEvents.length === 0) {
      render(new NoEventView(), this.#boardContainer);
      return;
    }

    this.#renderSort();
    render(this.#eventListComponent, this.#boardContainer);
    this.#renderEvents();
  }

  #sortEvents(sortType) {
    switch (sortType) {
      case SortType.TIME:
        this.#boardEvents.sort(sortEventTime);
        break;
      case SortType.PRICE:
        this.#boardEvents.sort(sortEventPrice);
        break;
      default:
        this.#boardEvents = [...this.#sourcedBoardEvents];
    }

    this.#currentSortType = sortType;
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#sortEvents(sortType);
    this.#clearEventList();
    this.#renderEvents();
  };

  #clearEventList() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #handleEventChange = (updatedEvent) => {
    this.#boardEvents = updateItem(this.#boardEvents, updatedEvent);
    this.#sourcedBoardEvents = updateItem(this.#sourcedBoardEvents, updatedEvent);

    const presenterKey = updatedEvent.id || updatedEvent;
    this.#pointPresenters.get(presenterKey).init(updatedEvent, this.#destinations, this.#offers);
  };

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
    for (const event of this.#boardEvents) {
      this.#renderEvent(event, this.#destinations, this.#offers);
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
