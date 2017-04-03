import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { addUrlProps } from 'react-url-query';
import debounce from 'lodash.debounce';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap.css';

import {
  fetchSimilarById,
  fetchSimilarByFeatures,
  fetchCityData,
  clearSimilarCities,
  fetchClusters,
} from '../../actions/actions';

import FeatureVectorMaker from '../../components/FeatureVectorMaker';
import CitySearch from '../../components/CitySearch';
import SearchResults from '../../components/SearchResults';
import ExploreMap from '../../components/ExploreMap';
import AutoSize from '../../components/AutoSize';
import ModeSelector from '../../components/ModeSelector';

import tooltipStrings from './tooltipStrings';


import './index.scss';


const urlPropsQueryConfig = {
};

const mapStateToProps = (state) => {
  return {
    cityData: state.shared.cityData,
    cityFeatures: state.similarCities.cityFeatures,
    clusters: state.clusters.clusters,
    searchId: state.similarCities.searchId,
    searchVector: state.similarCities.searchVector,
    searchWeights: state.similarCities.searchWeights,
    similarCities: state.similarCities.similarCities,
  };
};

class Explore extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    cityData: PropTypes.object,
    cityFeatures: PropTypes.arrayOf(PropTypes.object).isRequired,
    searchId: PropTypes.string,
    searchVector: PropTypes.object,
    searchWeights: PropTypes.object,
    similarCities: PropTypes.arrayOf(PropTypes.object).isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      mode: "map",
    };

    this.handleFeatureVectorChange = this.handleFeatureVectorChange.bind(this);
    this.handleFeatureVectorChange = debounce(this.handleFeatureVectorChange, 200);
    this.handleCitySearchChange = this.handleCitySearchChange.bind(this);
    this.handleSelectCity = this.handleSelectCity.bind(this);
    this.handleChangeMode = this.handleChangeMode.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchCityData());
    dispatch(fetchClusters());
  }

  handleFeatureVectorChange(newVector, newWeights) {
    const { dispatch } = this.props;
    console.log('handleFeatureVectorChange', newVector, newWeights)
    dispatch(fetchSimilarByFeatures(newVector, newWeights));
  }

  handleCitySearchChange(cityId) {
    console.log('handleCitySearchChange', cityId)
    const { dispatch } = this.props;
    if (cityId) {
      dispatch(fetchSimilarById(cityId));
    } else {
      dispatch(clearSimilarCities(cityId));
    }
  }

  handleSelectCity(city) {
    const { dispatch } = this.props;

    dispatch(fetchSimilarById(city.id));
  }

  handleChangeMode(newMode) {
    this.setState({ mode: newMode });
  }

  render() {
    const {
      cityData,
      cityFeatures,
      clusters,
      searchVector,
      searchWeights,
      similarCities,
      searchId,
    } = this.props;
    const {
      mode,
    } = this.state;

    const showResults = similarCities.length > 0;

    return (
      <div className="Explore">
        <div className="content">

          {/* Left Column */}
          <div className="controls">
            <div className="search">
              <Tooltip
                placement="right"
                overlay={tooltipStrings.searchForCities}
                overlayClassName="tooltip"
              >
                <p className="section-header">Search For Cities</p>
              </Tooltip>

              <CitySearch
                cityData={cityData}
                handleChange={this.handleCitySearchChange}
                searchId={searchId}
              />
              <Tooltip
                placement="right"
                overlay={tooltipStrings.tuneSearch}
                overlayClassName="tooltip"
              >
                <p className="section-header">Tune Search By</p>
              </Tooltip>

              <FeatureVectorMaker
                features={cityFeatures}
                handleFeatureVectorChange={this.handleFeatureVectorChange}
                searchVector={searchVector}
                searchWeights={searchWeights}
              />
            </div>

            {showResults &&
              <div className="results">
                <SearchResults
                  features={cityFeatures}
                  similarCities={similarCities}
                  onSelectCity={this.handleSelectCity}
                />
              </div>
            }
          </div>

          {/* Right Column */}
          <div className="map">
            <ModeSelector mode={mode} onChange={this.handleChangeMode} />
            <AutoSize maxHeight>
              <ExploreMap
                cityData={cityData}
                similarCities={similarCities}
                clusters={clusters}
                onSelectCity={this.handleSelectCity}
                mode={mode}
              />
            </AutoSize>
          </div>

        </div>
      </div>
    );
  }
}

export default addUrlProps({ urlPropsQueryConfig })(connect(mapStateToProps)(Explore));
