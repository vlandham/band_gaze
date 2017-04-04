import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addUrlProps } from 'react-url-query';
import * as d3 from 'd3';

import faceData from '../../../data/faces.csv';
import AutoSize from '../../components/AutoSize';
import Filter from '../../components/Filter';
import FaceList from '../../components/FaceList';

import './index.scss';

const urlPropsQueryConfig = {
};

const mapStateToProps = () => ({
});

class HomePage extends Component {
  static propTypes = {}

  constructor(props) {
    super(props);

    this.onFilteredChange = this.onFilteredChange.bind(this);

    this.state = {
      faces: [],
      filtered: [],
    };
  }

  componentDidMount() {
    const that = this;
    d3.csv(faceData, function setFaces(error, faces) {
      const filtered = [];
      that.setState({ faces, filtered });
    });
  }

  onFilteredChange(filtered) {
    this.setState({ filtered });
  }

  render() {
    const { faces, filtered } = this.state;
    return (
      <div className="HomePage">
        <div className="content">
          <div className="controls">
            <Filter
              faces={faces}
              onUpdateFilter={this.onFilteredChange}
            />
          </div>
          <div className="results">
            <FaceList
              faces={filtered}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default addUrlProps({ urlPropsQueryConfig })(connect(mapStateToProps)(HomePage));
