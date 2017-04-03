import React, { Component, PropTypes } from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import createFilterOptions from 'react-select-fast-filter-options';
import isEmpty from 'lodash.isempty';

import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css';

import './index.scss';

/**
 * Helper to make options from city data
 */
function makeOptions(cityData) {
  const ids = Object.keys(cityData);
  const options = ids.map((id) => {
    const city = cityData[id];
    return {
      value: id,
      label: `${city.city}, ${city.state}`,
      // keep these for sorting. better to sort by city then state than
      // to sort by "city, state" since otherwise you get "Boston Heights"
      // returned before "Boston, MA" since `,` is after ` `.
      city: city.city,
      state: city.state,
    };
  }).sort((optionA, optionB) => {
    const result = optionA.city.localeCompare(optionB.city);

    if (result === 0) {
      return optionA.state.localeCompare(optionB.state);
    }

    return result;
  });

  return options;
}

class CitySearch extends Component {
  static propTypes = {
    cityData: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    searchId: PropTypes.string,
  }

  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      value: undefined,
    };
  }

  componentWillMount() {
    this.updateOptions(this.props.cityData);
  }

  componentWillUpdate(nextProps) {
    if (this.props.cityData !== nextProps.cityData) {
      this.updateOptions(nextProps.cityData);
    }

    if (nextProps.searchId === undefined) {
      this.state.value = undefined;
    }
  }

  updateOptions(cityData) {
    this.options = makeOptions(cityData);
    this.filterOptions = createFilterOptions({
      indexes: ['label'],
      options: this.options,
    });
  }

  handleChange(newValue) {
    if (isEmpty(newValue)) {
      newValue = undefined;
    }
    this.setState({ value: newValue });
    this.props.handleChange(newValue && newValue.value);
  }

  render() {
    const options = this.options;

    return (
      <div className="CitySearch">
        <VirtualizedSelect
          name="city-search"
          value={this.state.value}
          filterOptions={this.filterOptions}
          options={options}
          onChange={this.handleChange}
          noResultsText="No Results Found"
          placeholder="Search for a city or town"
        />
      </div>
    );
  }
}

export default CitySearch;
