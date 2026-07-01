import { render, replace } from '../framework/render.js';
import EventEditView from '../view/event-edit-view.js';
import EventItemView from '../view/event-item-view.js';
import EventListView from '../view/event-list-view.js';
import SortView from '../view/sort-view.js';

export default class BoardPresenter {
  #boardContainer = null;
  #eventModel = null;
  #eventListComponent = new EventListView();

  #eventPresenterMap = new Map();

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

    for (const event of events) {
      this.#renderEvent(event, destinations, offers);
    }
  }

  #resetAllEventsView = () => {
    this.#eventPresenterMap.forEach((replaceFormToCard) => replaceFormToCard());
  };

  #renderEvent(event, destinations, offers) {
    let eventComponent = null;
    let eventEditComponent = null;

    let isEditMode = false;

    const replaceCardToForm = () => {
      this.#resetAllEventsView();

      replace(eventEditComponent, eventComponent);
      document.addEventListener('keydown', escKeyDownHandler);

      isEditMode = true;
    };

    const replaceFormToCard = () => {
      if (isEditMode) {
        replace(eventComponent, eventEditComponent);
        document.removeEventListener('keydown', escKeyDownHandler);
        isEditMode = false;
      }
    };

    function escKeyDownHandler(evt) {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        evt.preventDefault();
        replaceFormToCard();
      }
    }

    eventComponent = new EventItemView(
      event,
      destinations,
      offers,
      () => {
        replaceCardToForm();
      }
    );

    eventEditComponent = new EventEditView(
      event,
      destinations,
      offers,
      {
        onFormSubmit: () => {
          replaceFormToCard();
        },
        onRollupClick: () => {
          replaceFormToCard();
        }
      }
    );

    const eventKey = event.id || event;
    this.#eventPresenterMap.set(eventKey, replaceFormToCard);

    render(eventComponent, this.#eventListComponent.element);
  }
}
