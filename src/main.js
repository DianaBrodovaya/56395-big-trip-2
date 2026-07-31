import EventModel from './model/event-model.js';
import FilterModel from './model/filter-model.js';
import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import EventsApiService from './events-api-service.js';

const AUTHORIZATION = 'Basic dsfa6656aswqey8asq4dr';
const END_POINT = 'https://22.objects.htmlacademy.pro/big-trip';

const siteHeaderElement = document.querySelector('.trip-main');
const filtersContainer = siteHeaderElement.querySelector('.trip-controls__filters');
const siteMainElement = document.querySelector('.trip-events');
const newEventButtonElement = siteHeaderElement.querySelector('.trip-main__event-add-btn');

const filterModel = new FilterModel();

const eventsApiService = new EventsApiService(END_POINT, AUTHORIZATION);

const eventModel = new EventModel({
  eventsApiService
});

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

eventModel.init();

function handleNewEventFormClose() {
  newEventButtonElement.disabled = false;
}

newEventButtonElement.addEventListener('click', () => {
  newEventButtonElement.disabled = true;
  boardPresenter.createEvent();
});
