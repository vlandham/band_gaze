import React, { Component, PropTypes } from 'react';
import FeatureSlider from '../FeatureSlider';

import './index.scss';

class FeatureVectorMaker extends Component {
  static propTypes = {
    features: PropTypes.arrayOf(PropTypes.object).isRequired,
    searchVector: PropTypes.object.isRequired,
    searchWeights: PropTypes.object.isRequired,
    handleFeatureVectorChange: PropTypes.func,
  }

  constructor(props) {
    super(props);

    const { searchWeights, searchVector } = this.props;

    this.handleSliderChange = this.handleSliderChange.bind(this);
    this.handleSliderEnable = this.handleSliderEnable.bind(this);
    this.handleSliderDisable = this.handleSliderDisable.bind(this);

    // Maintain a local copy of the search vector and weights to accomoddate
    // for the optimistic update of the UI that happens before the new state
    // is confirmed by the server. This helps when two quick changes to weights
    // or vector elements are made, we want to maintain the changes while waiting
    // for final confirmation from the server.
    this.state = {
      searchWeightsLocal: searchWeights,
      searchVectorLocal: searchVector,
    };
  }

  componentWillReceiveProps(nextProps) {
    // If we get a new searchVector from a parent component update
    // local state to match
    this.setState({ searchVectorLocal: nextProps.searchVector });
  }


  /**
   * Handle an update to a FeatureSlider's value
   * @param {String} id feature identifier
   * @param {Number} value
   */
  handleSliderChange(id, value) {
    const { handleFeatureVectorChange } = this.props;
    const { searchWeightsLocal, searchVectorLocal } = this.state;
    const newVector = Object.assign({}, searchVectorLocal, {
      [id]: value,
    });

    this.setState({ searchVectorLocal: newVector });
    handleFeatureVectorChange(newVector, searchWeightsLocal);
  }

  /**
   * Enable a feature in the search.
   * @param {String} id feature identifier
   */
  handleSliderEnable(id) {
    const { handleFeatureVectorChange } = this.props;
    const { searchWeightsLocal, searchVectorLocal } = this.state;

    const newWeights = Object.assign({}, searchWeightsLocal, {
      [id]: 1,
    });

    this.setState({ searchWeightsLocal: newWeights });
    handleFeatureVectorChange(searchVectorLocal, newWeights);
  }

  /**
   * Disable a feature in the search.
   * @param {String} id feature identifier
   */
  handleSliderDisable(id) {
    const { handleFeatureVectorChange } = this.props;
    const { searchWeightsLocal, searchVectorLocal } = this.state;

    const newWeights = Object.assign({}, searchWeightsLocal, {
      [id]: 0,
    });

    this.setState({ searchWeightsLocal: newWeights });
    handleFeatureVectorChange(searchVectorLocal, newWeights);
  }

  render() {
    const { features } = this.props;
    const { searchVectorLocal, searchWeightsLocal } = this.state;
    return (
      <div className="FeatureVectorMaker">
        <div className="features">
          {
            features.map((feature) => {
              const weight = searchWeightsLocal[feature.id];
              const isDisabled = (weight === 0);
              return (
                <FeatureSlider
                  handleChange={this.handleSliderChange}
                  handleDisable={this.handleSliderDisable}
                  handleEnable={this.handleSliderEnable}
                  id={feature.id}
                  key={feature.id}
                  label={feature.label}
                  value={searchVectorLocal[feature.id]}
                  disabled={isDisabled}
                />
              );
            })
          }
        </div>
      </div>
    );
  }
}

export default FeatureVectorMaker;
