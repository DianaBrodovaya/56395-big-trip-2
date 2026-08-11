import { render, remove } from '../framework/render.js';
import FailedLoadView from '../view/failed-load-view.js';
import EventListView from '../view/event-list-view.js';
import SortView from '../view/sort-view.js';
import NoEventView from '../view/no-event-view.js';
import LoadingView from '../view/loading-view.js';
import EventPresenter from './event-presenter.js';
import NewEventPresenter from './new-event-presenter.js';
import { sortEventDay, sortEventTime, sortEventPrice } from '../utils/sort.js';
import { filter } from '../utils/filters.js';
import { SortType, FilterType, UserAction, UpdateType } from '../const.js';

export default class BoardPresenter {
  #failedLoadComponent = new FailedLoadView();
  #isFailedLoad = false;

  #boardContainer = null;
  #eventModel = null;
  #filterModel = null;

  #eventListComponent = new EventListView();
  #loadingComponent = new LoadingView();
  #eventPresenters = new Map();
  #newEventPresenter = null;

  #sortComponent = null;
  #noEventComponent = null;
  #currentSortType = SortType.DAY;
  #isLoading = true;

  constructor({ boardContainer, eventModel, filterModel, onNewEventDestroy }) {
    this.#boardContainer = boardContainer;
    this.#eventModel = eventModel;
    this.#filterModel = filterModel;

    this.#newEventPresenter = new NewEventPresenter({
      eventListContainer: this.#eventListComponent.element,
      onDataChange: this.#handleViewAction,
      onDestroy: () => {
        onNewEventDestroy();
        this.#handleNewEventDestroy();
      }
    });

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

  createEvent() {
    this.#currentSortType = SortType.DAY;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);

    if (this.#noEventComponent) {
      remove(this.#noEventComponent);
      this.#noEventComponent = null;
      render(this.#eventListComponent, this.#boardContainer);
    }

    this.#newEventPresenter.init(this.#eventModel.destinations, this.#eventModel.offers);
  }

  #clearBoard({ resetSortType = false } = {}) {
    this.#newEventPresenter.destroy();

    this.#eventPresenters.forEach((presenter) => presenter.destroy());
    this.#eventPresenters.clear();

    remove(this.#sortComponent);
    if (this.#noEventComponent) {
      remove(this.#noEventComponent);
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
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
    if (this.#isLoading) {
      render(this.#loadingComponent, this.#boardContainer);
      return;
    }

    if (this.#isFailedLoad) {
      render(this.#failedLoadComponent, this.#boardContainer);
      return;
    }

    const events = this.events;

    if (events.length === 0) {
      this.#noEventComponent = new NoEventView(this.#filterModel.filter);
      render(this.#noEventComponent, this.#boardContainer);
      return;
    }

    this.#renderSort();
    render(this.#eventListComponent, this.#boardContainer);

    events.forEach((event) => {
      const eventPresenter = new EventPresenter({
        eventListContainer: this.#eventListComponent.element,
        onModeChange: this.#handleModeChange,
        onDataChange: this.#handleViewAction
      });

      eventPresenter.init(event, this.#eventModel.destinations, this.#eventModel.offers);
      this.#eventPresenters.set(event.id || event, eventPresenter);
    });
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
    this.#newEventPresenter.destroy();
    this.#eventPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleNewEventDestroy = () => {
    if (this.events.length === 0) {
      this.#noEventComponent = new NoEventView(this.#filterModel.filter);
      render(this.#noEventComponent, this.#boardContainer);
    }
  };

  #handleViewAction = async (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_EVENT:
        this.#eventPresenters.get(update.id).setSaving();
        try {
          await this.#eventModel.updateEvent(updateType, update);
        } catch {
          this.#eventPresenters.get(update.id).setAborting();
        }
        break;

      case UserAction.ADD_EVENT:
        this.#newEventPresenter.setSaving();
        try {
          await this.#eventModel.addEvent(updateType, update);
        } catch {
          this.#newEventPresenter.setAborting();
        }
        break;

      case UserAction.DELETE_EVENT:
        this.#eventPresenters.get(update.id).setDeleting();
        try {
          await this.#eventModel.deleteEvent(updateType, update);
        } catch {
          this.#eventPresenters.get(update.id).setAborting();
        }
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#eventPresenters.get(data.id || data).init(data, this.#eventModel.destinations, this.#eventModel.offers);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#currentSortType = SortType.DAY;
        this.#clearBoard({ resetSortType: true });
        this.#renderBoard();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        if (data && data.isError) {
          this.#isFailedLoad = true;
        }
        this.#clearBoard();
        this.#renderBoard();
        break;
    }
  };
}
