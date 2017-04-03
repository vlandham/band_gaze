import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

const mapStateToProps = () => ({
});

export class App extends Component {
  static propTypes = {
    children: PropTypes.object,
  }

  render() {
    return (
      <div className="App">
        <div className="container-fluid">
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(App);
