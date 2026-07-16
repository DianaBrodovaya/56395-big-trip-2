import { render, replace, remove } from '../framework/render.js';
import EventItemView from '../view/event-item-view.js';
import EventEditView from '../view/event-edit-view.js';

export default class EventPresenter {
  #eventListContainer = null;
  #handleModeChange = null;
  #handleDataChange = null;

  #eventComponent = null;
  #eventEditComponent = null;

  #event = null;
  #destinations = null;
  #offers = null;
  #isEditMode = false;

  constructor({ eventListContainer, onModeChange, onDataChange }) {
    this.#eventListContainer = eventListContainer;
    this.#handleModeChange = onModeChange;
    this.#handleDataChange = onDataChange;
  }

  init(event, destinations, offers) {
    this.#event = event;
    this.#destinations = destinations;
    this.#offers = offers;

    const prevEventComponent = this.#eventComponent;
    const prevEventEditComponent = this.#eventEditComponent;

    this.#eventComponent = new EventItemView(
      this.#event,
      this.#destinations,
      this.#offers,
      this.#handleRollupClick,
      this.#handleFavoriteClick
    );

    this.#eventEditComponent = new EventEditView(
      this.#event,
      this.#destinations,
      this.#offers,
      {
        onFormSubmit: this.#handleFormSubmit,
        onRollupClick: this.#handleFormRollupClick
      }
    );

    if (prevEventComponent === null || prevEventEditComponent === null) {
      render(this.#eventComponent, this.#eventListContainer);
      return;
    }

    if (!this.#isEditMode) {
      replace(this.#eventComponent, prevEventComponent);
    } else {
      replace(this.#eventEditComponent, prevEventEditComponent);
    }

    remove(prevEventComponent);
    remove(prevEventEditComponent);
  }

  resetView() {
    if (this.#isEditMode) {
      this.#eventEditComponent.reset(this.#event);
      this.#replaceFormToCard();
    }
  }

  #replaceCardToForm = () => {
    this.#handleModeChange();
    replace(this.#eventEditComponent, this.#eventComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#isEditMode = true;
  };

  #replaceFormToCard = () => {
    replace(this.#eventComponent, this.#eventEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#isEditMode = false;
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#eventEditComponent.reset(this.#event);
      this.#replaceFormToCard();
    }
  };

  #handleRollupClick = () => {
    this.#replaceCardToForm();
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange({
      ...this.#event,
      isFavorite: !this.#event.isFavorite
    });
  };

  #handleFormSubmit = (updatedEvent) => {
    this.#handleDataChange(updatedEvent);
    this.#replaceFormToCard();
  };

  #handleFormRollupClick = () => {
    this.#eventEditComponent.reset(this.#event);
    this.#replaceFormToCard();
  };

  destroy() {
    remove(this.#eventComponent);
    remove(this.#eventEditComponent);
  }
}
