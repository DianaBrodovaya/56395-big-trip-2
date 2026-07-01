import { render } from '../framework/render.js';
import EventEditView from '../view/event-edit-view.js';
import EventItemView from '../view/event-item-view.js';
import EventListView from '../view/event-list-view.js';
import SortView from '../view/sort-view.js';

export default class BoardPresenter {
  #boardContainer = null;
  #eventModel = null;
  #eventListComponent = new EventListView();

  constructor({ boardContainer, eventModel }) {
    this.#boardContainer = boardContainer;
    this.#eventModel = eventModel;
  }

  init() {
    const events = this.#eventModel.events;
    const destinations = this.#eventModel.destinations;
    const offers = this.#eventModel.offers;

    render(new SortView(), this.#boardContainer);
    render(this.#eventListComponent, this.#boardContainer);

    if (events.length > 0) {
      render(new EventEditView(events[0], destinations, offers), this.#eventListComponent.element);
    }

    for (let i = 1; i < events.length; i++) {
      render(new EventItemView(events[i], destinations, offers), this.#eventListComponent.element);
    }
  }
}
