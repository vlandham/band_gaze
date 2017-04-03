import React from 'react';

import './index.scss';

const loadingId = '_loading';

const SimilarCityList = (props) => {
  const { cityData, onHover, onSelect, numCities } = props;

  const items = Array(numCities).fill(0).map((d, i) => {
    if (cityData && cityData[i]) {
      return cityData[i];
    }

    return {
      id: loadingId,
    };
  });

  return (
    <div className="SimilarCityList">
      <ol className="list-unstyled">
        {items.map((item, i) => {
          let click;
          let label;
          let mouseEnter;
          let mouseLeave;

          if (item.id !== loadingId) {
            label = `${item.city}, ${item.state}`;
            mouseEnter = () => onHover(item);
            mouseLeave = () => onHover();
            click = () => onSelect(item);
          } else if (i === 0) {
            label = 'Loading...';
          } else {
            label = '';
          }

          return (
            <li
              key={i}
              onMouseEnter={mouseEnter}
              onMouseLeave={mouseLeave}
              onClick={click}
            >
              {label}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

SimilarCityList.propTypes = {
  cityData: React.PropTypes.array,
  onHover: React.PropTypes.func,
  onSelect: React.PropTypes.func,
  numCities: React.PropTypes.number,

};

SimilarCityList.defaultProps = {
  numCities: 10,
};

export default SimilarCityList;
