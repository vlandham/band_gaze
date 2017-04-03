import React, { PropTypes, Component } from 'react';
import debounce from 'lodash.debounce';

const propTypes = {
  children: PropTypes.object,

  /* The amount of delay between debounced calls (default: 100) */
  debounceTime: PropTypes.number,

  /* If set, the default width is set to this value and the child is
     rendered. If null, the child is not rendered until a width is provided */
  defaultRenderWidth: PropTypes.number,

  /* If set, the default height is set to this value and the child is
     rendered. If null, the child is not rendered until a height is provided */
  defaultRenderHeight: PropTypes.number,

  /* If true, the component checks on componentDidUpdate to see if it needs to resize */
  parentMayResize: PropTypes.bool,

  /* Optional class name to be added to the container */
  className: PropTypes.string,

  /* If true, the container div gets height: 100% added as a style attribute */
  maxHeight: PropTypes.bool,

  /* If true, includes height as a prop to the child */
  includeHeight: PropTypes.bool,

  /* If true, includes width as a prop to the child */
  includeWidth: PropTypes.bool,
};

const defaultProps = {
  parentMayResize: false,
  defaultRenderWidth: null,
  defaultRenderHeight: null,
  debounceTime: 100,
  includeHeight: true,
  includeWidth: true,
};

/**
 * Component for automatically setting a width prop to the DOM
 * node of the first child. Note that checking offsetWidth is a
 * somewhat expensive operation (forced reflow), so try and leave
 * `parentMayResize` false if you are having performance issues.
 *
 * Example usage:
 * <AutoSize>
 *   <MyComponent />
 * </AutoSize>
 *
 * MyComponent gets a `width` prop set.
 *
 */
class AutoSize extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: props.defaultRenderWidth,
      height: props.defaultRenderHeight,
    };

    if (props.debounceTime) {
      this.updateSize = debounce(this.updateSize.bind(this), props.debounceTime);
    } else {
      this.updateSize = this.updateSize.bind(this);
    }
  }

  componentDidMount() {
    this.updateSize();
    window.addEventListener('resize', this.updateSize);
  }


  componentDidUpdate() {
    const { parentMayResize } = this.props;

    // have to update width of the parent can cause a resize without a window resize
    // e.g. something collapses or expands.
    if (parentMayResize) {
      this.updateSize();
    }
  }

  componentWillUnmount() {
    this.updateSize.cancel();
    window.removeEventListener('resize', this.updateSize);
  }

  // Call set state to update the width so it starts an update of the child component
  updateSize() {
    const { width, height } = this.state;
    const child = this.sizeNode.firstChild;

    // we need to temporarily remove the child otherwise this container will
    // never shrink.
    if (child) {
      this.sizeNode.removeChild(child);
    }

    // calculate height and width based solely on the parent
    const domWidth = this.sizeNode.offsetWidth;
    const domHeight = this.sizeNode.offsetHeight;

    // add the child back in now that height and width have been calculated
    if (child) {
      this.sizeNode.appendChild(child);
    }

    if (width !== domWidth || height !== domHeight) {
      this.setState({
        width: domWidth,
        height: domHeight,
      });
    }
  }

  render() {
    const { className, maxHeight, includeWidth, includeHeight } = this.props;
    const { width, height } = this.state;

    if (process.env.NODE_ENV !== 'production' &&
        React.Children.count(this.props.children) > 1) {
      console.warn('AutoSize only works with a single child element.');
    }

    const child = this.props.children;
    let childToRender;

    // if we have a child and a width is provided, render the child with the width as a prop
    if (child && width != null) {
      childToRender = React.cloneElement(child, {
        width: includeWidth ? width : undefined,
        height: includeHeight ? height : undefined,
      });
    }

    const style = maxHeight ? { height: '100%' } : undefined;

    // we rely on this div getting the full width from the browser's layout
    // and read its offsetWidth to set as the width to the child component.
    return (
      <div
        className={`auto-size ${className || ''}`}
        style={style}
        ref={(node) => { this.sizeNode = node; }}
      >
        {childToRender}
      </div>
    );
  }
}

AutoSize.propTypes = propTypes;
AutoSize.defaultProps = defaultProps;

export default AutoSize;
