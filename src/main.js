import EventModel from './model/event-model.js';
import FilterModel from './model/filter-model.js';
import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';

const siteHeaderElement = document.querySelector('.trip-main');
const filtersContainer = siteHeaderElement.querySelector('.trip-controls__filters');
const siteMainElement = document.querySelector('.trip-events');
const newEventButtonElement = siteHeaderElement.querySelector('.trip-main__event-add-btn');

const eventModel = new EventModel();
const filterModel = new FilterModel();

const filterPresenter = new FilterPresenter({
  filterContainer: filtersContainer,
  filterModel,
  eventModel
});
filterPresenter.init();

const boardPresenter = new BoardPresenter({
  boardContainer: siteMainElement,
  eventModel,
  filterModel,
  onNewEventDestroy: handleNewEventFormClose
});
boardPresenter.init();

function handleNewEventFormClose() {
  newEventButtonElement.disabled = false;
}

newEventButtonElement.addEventListener('click', () => {
  newEventButtonElement.disabled = true;
  boardPresenter.createEvent();
});
