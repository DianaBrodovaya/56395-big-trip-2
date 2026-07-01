import { render } from './framework/render.js';
import EventModel from './model/event-model.js';
import BoardPresenter from './presenter/board-presenter.js';
import FilterView from './view/filter-view.js';

const siteHeaderElement = document.querySelector('.trip-main');
const filtersContainer = siteHeaderElement.querySelector('.trip-controls__filters');
const siteMainElement = document.querySelector('.trip-events');

render(new FilterView(), filtersContainer);

const eventModel = new EventModel();

const boardPresenter = new BoardPresenter({
  boardContainer: siteMainElement,
  eventModel
});

boardPresenter.init();
