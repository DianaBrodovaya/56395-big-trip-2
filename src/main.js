import { render, replace, remove, RenderPosition } from './framework/render.js';
import EventModel from './model/event-model.js';
import FilterModel from './model/filter-model.js';
import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import EventsApiService from './events-api-service.js';
import TripInfoView from './view/trip-info-view.js';
import { sortEventDay } from './utils/sort.js';

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

let tripInfoComponent = null;

const renderTripInfo = () => {
  const prevTripInfoComponent = tripInfoComponent;

  const sortedEvents = [...eventModel.events].sort(sortEventDay);

  if (sortedEvents.length === 0) {
    if (prevTripInfoComponent) {
      remove(prevTripInfoComponent);
      tripInfoComponent = null;
    }
    return;
  }

  tripInfoComponent = new TripInfoView(sortedEvents, eventModel.destinations, eventModel.offers);

  if (prevTripInfoComponent === null) {
    render(tripInfoComponent, siteHeaderElement, RenderPosition.AFTERBEGIN);
    return;
  }

  replace(tripInfoComponent, prevTripInfoComponent);
  remove(prevTripInfoComponent);
};

eventModel.addObserver(() => {
  renderTripInfo();
});

const filterPresenter = new FilterPresenter({
  filterContainer: filtersContainer,
  filterModel,
  eventModel
});

const boardPresenter = new BoardPresenter({
  boardContainer: siteMainElement,
  eventModel,
  filterModel,
  onNewEventDestroy: handleNewEventFormClose
});

function handleNewEventFormClose() {
  newEventButtonElement.disabled = false;
}

newEventButtonElement.addEventListener('click', () => {
  newEventButtonElement.disabled = true;
  boardPresenter.createEvent();
});

filterPresenter.init();
boardPresenter.init();
eventModel.init();

