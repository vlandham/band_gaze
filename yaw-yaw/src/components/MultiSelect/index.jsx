import React, { Component, PropTypes } from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import isEmpty from 'lodash.isempty';

import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css';


/**
 * Helper to make options from filter data
 */
function makeOptions(values) {
  return values.map((v) => {
    return {
      label: v.label,
      value: v.value,
    };
  });
}

class MultiSelect extends Component {
  static propTypes = {
    id: React.PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    description: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    values: PropTypes.arrayOf(React.PropTypes.shape({
      label: React.PropTypes.string,
      value: React.PropTypes.string,
    })),
    multi: PropTypes.bool,
    value: PropTypes.any,
    handleChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  }

  static defaultProps = {
    handleChange: () => {},
    multi: true,
    values: [],
    value: undefined,
    id: '',
    label: '',
    disabled: false,
  }

  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(newValue) {
    let newVal;
    if (isEmpty(newValue)) {
      newVal = undefined;
    } else if (newValue instanceof Array) {
      newVal = newValue.map(d => d.value);
    } else {
      newVal = newValue;
    }

    this.props.handleChange(this.props.id, newVal);
  }

  render() {
    const {
      id,
      values,
      multi,
      placeholder,
      disabled,
      value,
    } = this.props;

    const options = makeOptions(values);

    return (
      <div className="MultiSelect">
        <VirtualizedSelect
          name={`multi-select-${id}`}
          options={options}
          value={value}
          onChange={this.handleChange}
          multi={multi}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
    );
  }
}

export default MultiSelect;
