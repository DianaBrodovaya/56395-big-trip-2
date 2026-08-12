import { render, replace, remove, RenderPosition } from './framework/render.js';
import EventModel from './model/event-model.js';
import FilterModel from './model/filter-model.js';
import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import EventsApiService from './events-api-service.js';
import TripInfoView from './view/trip-info-view.js';
import NewEventButtonView from './view/new-event-button-view.js';
import { sortEventDay } from './utils/sort.js';

const STORE_KEY = 'big-trip-auth-token';
const END_POINT = 'https://22.objects.htmlacademy.pro/big-trip';

let authorizationToken = localStorage.getItem(STORE_KEY);

const siteHeaderElement = document.querySelector('.trip-main');
const filtersContainer = siteHeaderElement.querySelector('.trip-controls__filters');
const siteMainElement = document.querySelector('.trip-events');

let tripInfoComponent = null;
let newEventButtonComponent = null;

if (!authorizationToken) {
  authorizationToken = `Basic ${Math.random().toString(36).substring(2, 15)}`;
  localStorage.setItem(STORE_KEY, authorizationToken);
}

const AUTHORIZATION = authorizationToken;

const filterModel = new FilterModel();
const eventsApiService = new EventsApiService(END_POINT, AUTHORIZATION);
const eventModel = new EventModel({ eventsApiService });

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

function handleNewEventFormClose() {
  newEventButtonComponent.setDisabled(false);
}

function handleNewEventButtonClick() {
  newEventButtonComponent.setDisabled(true);
  boardPresenter.createEvent();
}

newEventButtonComponent = new NewEventButtonView({
  onClick: handleNewEventButtonClick
});

newEventButtonComponent.setDisabled(true);

render(newEventButtonComponent, siteHeaderElement);

eventModel.addObserver(() => {
  renderTripInfo();
});

filterPresenter.init();
boardPresenter.init();

eventModel.init()
  .then(() => {
    newEventButtonComponent.setDisabled(false);
  })
  .catch(() => {
    newEventButtonComponent.setDisabled(true);
  });
