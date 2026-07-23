import { render, replace, remove, RenderPosition } from './framework/render.js';
import EventModel from './model/event-model.js';
import FilterModel from './model/filter-model.js';
import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import TripInfoView from './view/trip-info-view.js';
import { sortEventDay } from './utils/sort.js';

const siteHeaderElement = document.querySelector('.trip-main');
const filtersContainer = siteHeaderElement.querySelector('.trip-controls__filters');
const siteMainElement = document.querySelector('.trip-events');
const newEventButtonElement = siteHeaderElement.querySelector('.trip-main__event-add-btn');

const eventModel = new EventModel();
const filterModel = new FilterModel();

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
filterPresenter.init();

const boardPresenter = new BoardPresenter({
  boardContainer: siteMainElement,
  eventModel,
  filterModel,
  onNewEventDestroy: handleNewEventFormClose
});
boardPresenter.init();

renderTripInfo();

function handleNewEventFormClose() {
  newEventButtonElement.disabled = false;
}

newEventButtonElement.addEventListener('click', () => {
  newEventButtonElement.disabled = true;
  boardPresenter.createEvent();
});
