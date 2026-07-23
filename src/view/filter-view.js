import AbstractView from '../framework/view/abstract-view.js';

const upFirstLetter = (word) => `${word[0].toUpperCase()}${word.slice(1)}`;

const createFilterItemTemplate = (filter, currentFilterType) => {
  const { type, count } = filter;

  return (
    `<div class="trip-filters__filter">
      <input id="filter-${type}"
             class="trip-filters__filter-input  visually-hidden"
             type="radio"
             name="trip-filter"
             value="${type}"
             data-filter-type="${type}"
             ${type === currentFilterType ? 'checked' : ''}
             ${count === 0 ? 'disabled' : ''}>
      <label class="trip-filters__filter-label" for="filter-${type}">${upFirstLetter(type)}</label>
    </div>`
  );
};

const createFilterTemplate = (filters, currentFilterType) => (
  `<form class="trip-filters" action="#" method="get">
    ${filters.map((filter) => createFilterItemTemplate(filter, currentFilterType)).join('')}

    <button class="visually-hidden" type="submit">Accept filter</button>
  </form>`
);

export default class FilterView extends AbstractView {
  #filters = null;
  #currentFilterType = null;
  #handleFilterTypeChange = null;

  constructor({ filters, currentFilterType, onFilterTypeChange }) {
    super();
    this.#filters = filters;
    this.#currentFilterType = currentFilterType;
    this.#handleFilterTypeChange = onFilterTypeChange;

    this.element.addEventListener('change', this.#filterTypeChangeHandler);
  }

  get template() {
    return createFilterTemplate(this.#filters, this.#currentFilterType);
  }

  #filterTypeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'INPUT') {
      return;
    }

    evt.preventDefault();
    this.#handleFilterTypeChange(evt.target.dataset.filterType);
  };
}
