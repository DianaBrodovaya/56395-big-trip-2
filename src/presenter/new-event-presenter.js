import { render, remove, RenderPosition } from '../framework/render.js';
import EventEditView from '../view/event-edit-view.js';
import { UserAction, UpdateType } from '../const.js';

export default class NewEventPresenter {
  #eventListContainer = null;
  #handleDataChange = null;
  #handleDestroy = null;

  #eventEditComponent = null;

  constructor({ eventListContainer, onDataChange, onDestroy }) {
    this.#eventListContainer = eventListContainer;
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;
  }

  init(destinations, offers) {
    if (this.#eventEditComponent !== null) {
      return;
    }

    this.#eventEditComponent = new EventEditView(
      destinations,
      offers,
      {
        onFormSubmit: this.#handleFormSubmit,
        onDeleteClick: this.#handleDeleteClick
      }
    );

    render(this.#eventEditComponent, this.#eventListContainer, RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#eventEditComponent === null) {
      return;
    }

    this.#handleDestroy();
    remove(this.#eventEditComponent);
    this.#eventEditComponent = null;

    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  #handleFormSubmit = (newEvent) => {
    this.#handleDataChange(
      UserAction.ADD_EVENT,
      UpdateType.MINOR,
      newEvent
    );
  };

  #handleDeleteClick = () => {
    this.destroy();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.destroy();
    }
  };

  setSaving() {
    if (this.#eventEditComponent === null) {
      return;
    }
    this.#eventEditComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  }

  setAborting() {
    if (this.#eventEditComponent === null) {
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
