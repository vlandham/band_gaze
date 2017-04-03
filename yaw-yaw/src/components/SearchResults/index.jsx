import React, { Component, PropTypes } from 'react';
import _values from 'lodash.values';
import addComputedProps, { compose } from 'react-computed-props';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap.css';

import tooltipStrings from './tooltipStrings';

import RadarChart from '../RadarChart';
import SimilarCityList from '../SimilarCityList';
import AutoSize from '../AutoSize';


import './index.scss';

/**
 * Computed only when cityData changes
 */
function cityDataProps(props) {
  return {
    cityDataValues: _values(props.cityData),
  };
}

class SearchResults extends Component {
  static propTypes = {
    features: PropTypes.arrayOf(PropTypes.object).isRequired,
    similarCities: PropTypes.arrayOf(PropTypes.object),
    onSelectCity: PropTypes.func,
  }

  static defaultProps = {
    similarCities: [],
  }

  constructor(props) {
    super(props);
    this.state = {};

    this.handleHoverCity = this.handleHoverCity.bind(this);
  }

  handleHoverCity(city) {
    this.setState({ compareCity: city });
  }

  render() {
    const { features, similarCities, onSelectCity } = this.props;
    const { compareCity } = this.state;
    const selectedCity = similarCities[0];

    const bestMatch = selectedCity ?
      `${selectedCity.city}, ${selectedCity.state}`
      : undefined;
    const otherMatches = similarCities.slice(1);

    return (
      <div className="SearchResults">
        <Tooltip
          placement="right"
          overlay={tooltipStrings.bestMatch}
          overlayClassName="tooltip"
        >
          <p className="section-header">Best Match</p>
        </Tooltip>

        <p className="best-match">{bestMatch}</p>

        <Tooltip
          placement="right"
          overlay={tooltipStrings.otherMatches}
          overlayClassName="tooltip"
        >
          <p className="section-header">Other Matches</p>
        </Tooltip>


        <div className="city-results">
          <SimilarCityList
            cityData={otherMatches}
            onHover={this.handleHoverCity}
            onSelect={onSelectCity}
          />
        </div>
        <div className="radar-chart-container">
          <AutoSize>
            <RadarChart
              data={selectedCity}
              compareData={compareCity}
              features={features}
            />
          </AutoSize>
        </div>
      </div>
    );
  }
}

export default compose(
  addComputedProps(cityDataProps, { changeInclude: ['cityData'] })
)(SearchResults);
