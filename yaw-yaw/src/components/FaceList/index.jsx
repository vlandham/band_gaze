import React, { Component, PropTypes } from 'react';
import * as d3 from 'd3';

import './index.scss';


class FaceList extends Component {

  static propTypes = {
    faces: PropTypes.array,
    onUpdate: PropTypes.func,
  }

  onComponentDidMount(props) {

  }

  renderFace(face) {
    return (
      <div className="face" key={face.face_id}>
        <img alt="" src={`/face_imgs/${face.face_id}.jpg`} />
      </div>
    );
  }

  render() {
    const { faces } = this.props;

    return (
      <div className="FaceList">
        <h2>Faces</h2>
        {faces.map((f) => this.renderFace(f))}
      </div>
    );
  }
}


export default FaceList;
