import React, { Component, PropTypes } from 'react';

import './index.scss';

class FeatureSlider extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleDisable: PropTypes.func,
    handleEnable: PropTypes.func,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    disabled: PropTypes.bool,
  }

  static defaultProps = {
    min: 0,
    max: 1,
    step: 0.001,
    value: 0.25,
    disabled: false,
  };

  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  handleChange(event) {
    this.props.handleChange(this.props.id, parseFloat(event.target.value));
    return event.stopPropagation();
  }

  handleToggle(event) {
    if (event.target.checked) {
      this.props.handleEnable(this.props.id);
    } else {
      this.props.handleDisable(this.props.id);
    }
  }

  render() {
    const {
      id,
      label,
      max,
      min,
      step,
      value,
      disabled,
     } = this.props;

    const showSlider = disabled ? 'hideSlider' : 'showSlider';

    return (
      <div className={`FeatureSlider ${showSlider}`}>
        <div className="label-group">
          <label className="feature-label" htmlFor={`feature-toggle-${id}`}>
            <span className="label-text">{label}</span>
            <input
              className="feature-toggle"
              type="checkbox"
              onChange={this.handleToggle}
              defaultChecked="true"
              name={`feature-toggle-${id}`}
              id={`feature-toggle-${id}`}
            />
          </label>
        </div>

        <div>
          <input
            className="feature-slider"
            max={max}
            min={min}
            name={id}
            onChange={this.handleChange}
            step={step}
            value={value}
            type="range"
            disabled={disabled}
          />
        </div>
      </div>
    );
  }
}

export default FeatureSlider;
