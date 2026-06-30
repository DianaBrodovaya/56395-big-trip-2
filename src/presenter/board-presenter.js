//import { render, replace, RenderPosition } from '../framework/render.js';
import { render } from '../render.js';
import { getDefaultEvent } from '../const.js';
import EventEditView from '../view/event-edit-view.js';
import EventItemView from '../view/event-item-view.js';
import EventListView from '../view/event-list-view.js';
import SortView from '../view/sort-view.js';

export default class BoardPresenter {
  constructor({boardContainer, eventModel}) {
    this.boardContainer = boardContainer;
    this.eventListComponent = new EventListView();
    this.eventModel = eventModel;
  }

  init() {
    const events = this.eventModel.getEvents();
    const destinations = this.eventModel.getDestinations();
    const offers = this.eventModel.getOffers();

    render(new SortView(), this.boardContainer);
    render(this.eventListComponent, this.boardContainer);
    render(new EventEditView(getDefaultEvent(), destinations, offers), this.eventListComponent.getElement());
    render(new EventEditView(events[2], destinations, offers), this.eventListComponent.getElement());

    for (const event of events) {
      render(new EventItemView(event, destinations, offers), this.eventListComponent.getElement());
    }
  }
}
