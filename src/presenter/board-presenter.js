import { render, remove } from '../framework/render.js';
import EventListView from '../view/event-list-view.js';
import SortView from '../view/sort-view.js';
import NoEventView from '../view/no-event-view.js';
import EventPresenter from './event-presenter.js';
import { SortType } from '../const.js';
import { sortEventDay, sortEventTime, sortEventPrice } from '../utils/sort.js';
import { filter } from '../utils/filters.js';

export default class BoardPresenter {
  #boardContainer = null;
  #eventModel = null;
  #filterModel = null;

  #eventListComponent = new EventListView();
  #pointPresenters = new Map();

  #sortComponent = null;
  #noEventComponent = null;
  #currentSortType = SortType.DAY;

  constructor({ boardContainer, eventModel, filterModel }) {
    this.#boardContainer = boardContainer;
    this.#eventModel = eventModel;
    this.#filterModel = filterModel;

    this.#eventModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get events() {
    const filterType = this.#filterModel.filter;
    const events = this.#eventModel.events;

    const filteredEvents = filter[filterType](events);

    switch (this.#currentSortType) {
      case SortType.TIME:
        return filteredEvents.sort(sortEventTime);
      case SortType.PRICE:
        return filteredEvents.sort(sortEventPrice);
    }
    return filteredEvents.sort(sortEventDay);
  }

  init() {
    this.#renderBoard();
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearBoard();
    this.#renderBoard();
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case 'UPDATE_POINT':
        this.#pointPresenters.get(data.id || data).init(data, this.#eventModel.destinations, this.#eventModel.offers);
        break;
      case 'MAJOR':
        this.#currentSortType = SortType.DAY;
        this.#clearBoard();
        this.#renderBoard();
        break;
    }
  };

  #clearBoard() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    remove(this.#sortComponent);
    if (this.#noEventComponent) {
      remove(this.#noEventComponent);
    }
  }

  #renderSort() {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });
    render(this.#sortComponent, this.#boardContainer);
  }

  #renderBoard() {
    const events = this.events;

    if (events.length === 0) {
      this.#noEventComponent = new NoEventView(this.#filterModel.filter);
      render(this.#noEventComponent, this.#boardContainer);
      return;
    }

    this.#renderSort();
    render(this.#eventListComponent, this.#boardContainer);

    for (const event of events) {
      const eventPresenter = new EventPresenter({
        eventListContainer: this.#eventListComponent.element,
        onModeChange: this.#handleModeChange,
        onDataChange: this.#eventModel.updateEvent.bind(this.#eventModel)
      });
      eventPresenter.init(event, this.#eventModel.destinations, this.#eventModel.offers);
      this.#pointPresenters.set(event.id || event, eventPresenter);
    }
  }
}
