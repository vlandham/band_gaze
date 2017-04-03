import React, { Component, PropTypes } from 'react';
import * as d3 from 'd3';
import FeatureSlider from '../FeatureSlider';

import './index.scss';

class Filter extends Component {

  static propTypes = {
    faces: PropTypes.array,
    onUpdateFilter: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      yaw: 0,
      roll: 0,
      smile: 0
    };

    // this.onFilterChange = this.onFilterChange.bind(this);
    this.handleSliderChange = this.handleSliderChange.bind(this);
  }

  onComponentDidMount(props) {
    this.filterFaces();
  }

  /**
   * Handle an update to a FeatureSlider's value
   * @param {String} id feature identifier
   * @param {Number} value
   */
  handleSliderChange(id, value) {
    const { onUpdate } = this.props;

    this.setState({
      [id]: value,
    });

    this.filterFaces();


    // const filtered = this.filterFaces();
    // const { searchWeightsLocal, searchVectorLocal } = this.state;
    // const newVector = Object.assign({}, searchVectorLocal, {
    //   [id]: value,
    // });

    // this.setState({ searchVectorLocal: newVector });
    // handleFeatureVectorChange(newVector, searchWeightsLocal);
  }

  filterFaces() {
    const { onUpdateFilter, faces } = this.props;

    const { smile, roll, yaw } = this.state;

    const buffer = 5;

    // filter based on smile, roll, yaw
    let filtered = faces.filter((f) => {
      return (f.face_roll > (roll - buffer) && f.face_roll < (roll + buffer)) &&
      (f.face_yaw > (yaw - buffer) && f.face_yaw < (yaw + buffer)) &&
      (f.face_smile > (smile - (buffer / 10)) && f.face_smile < (smile + (buffer / 10)));
    });

    // Keep only unique IDs
    const filteredIds = {}
    filtered = filtered.filter((f) => {
      if (!filteredIds[f.face_id]) {
        filteredIds[f.face_id] = true;

        return true;
      }
      return false;
    });

    // keep first 100
    filtered = filtered.slice(0, 100);

    onUpdateFilter(filtered);
  }

  // onFilterChange() {
  //
  // }

  render() {
    console.log(this.state)
    return (
      <div className="Filter">
        <h2>Filters</h2>
        <FeatureSlider
          id={'yaw'}
          label={'Yaw'}
          value={this.state.yaw}
          min={-40}
          max={40}
          step={5}
          handleChange={this.handleSliderChange}
        />
        <FeatureSlider
          id={'roll'}
          label={'Roll'}
          value={this.state.roll}
          min={-40}
          max={40}
          step={5}
          handleChange={this.handleSliderChange}
        />
        <FeatureSlider
          id={'smile'}
          label={'Smile'}
          value={this.state.smile}
          handleChange={this.handleSliderChange}
          min={0}
          max={1}
          step={0.1}
        />
      </div>
    );
  }
}


export default Filter;
