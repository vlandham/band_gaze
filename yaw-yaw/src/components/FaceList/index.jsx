import React, { Component, PropTypes } from 'react';
import * as d3 from 'd3';

import './index.scss';

import FacePanel from './facepanel';


class FaceList extends Component {

  static propTypes = {
    faces: PropTypes.array,
    onUpdate: PropTypes.func,
  }

  componentDidMount() {
    console.log('component has mounted')
    this.facePanel = new FacePanel(this.facePanelContainer);
    this.facePanel.renderFaces(this.props.faces);
  }

  componentDidUpdate() {
    console.log('updated')
    this.facePanel.renderFaces(this.props.faces);
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

    // console.log(faces.length, faces[0])
    // <h2>Faces</h2>
    // {faces.map((f) => this.renderFace(f))}

    return (
      <div className="FaceList">
        <div
          className="FacePanel"
          ref={(node) => { this.facePanelContainer = node; }}
        >

        </div>

      </div>
    );
  }
}


export default FaceList;
