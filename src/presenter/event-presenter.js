import { render, replace, remove } from '../framework/render.js';
import EventItemView from '../view/event-item-view.js';
import EventEditView from '../view/event-edit-view.js';
import { UserAction, UpdateType } from '../const.js';

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
      this.#destinations,
      this.#offers,
      {
        event: this.#event,
        onFormSubmit: this.#handleFormSubmit,
        onRollupClick: this.#handleFormRollupClick,
        onDeleteClick: this.#handleDeleteClickHandler
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

  destroy() {
    remove(this.#eventComponent);
    remove(this.#eventEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
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
    this.#handleDataChange(
      UserAction.UPDATE_EVENT,
      UpdateType.PATCH,
      { ...this.#event, isFavorite: !this.#event.isFavorite }
    );
  };

  #handleFormSubmit = (updatedEvent) => {
    this.#handleDataChange(
      UserAction.UPDATE_EVENT,
      UpdateType.MINOR,
      updatedEvent
    );
  };

  #handleFormRollupClick = () => {
    this.#eventEditComponent.reset(this.#event);
    this.#replaceFormToCard();
  };

  #handleDeleteClickHandler = (deletedEvent) => {
    this.#handleDataChange(
      UserAction.DELETE_EVENT,
      UpdateType.MINOR,
      deletedEvent
    );
  };

  setSaving() {
    if (this.#isEditMode) {
      this.#eventEditComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    } else {
      this.#eventComponent.setDisabled(true);
    }
  }

  setDeleting() {
    if (this.#isEditMode) {
      this.#eventEditComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  }

  setAborting() {
    if (!this.#isEditMode) {
      this.#eventComponent.setDisabled(false);
      this.#eventComponent.shake();
      return;
    }

    const resetFormState = () => {
      this.#eventEditComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#eventEditComponent.shake(resetFormState);
  }
}
