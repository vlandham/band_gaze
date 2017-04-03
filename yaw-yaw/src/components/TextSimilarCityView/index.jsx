import React from 'react';

import './index.scss';

const TextSimilarCityView = (props) => {
  return (
    <div className="TextSimilarCityView">
      <pre>
        {JSON.stringify(props.data, null, 2)}
      </pre>
    </div>
  );
};

TextSimilarCityView.propTypes = {
  data: React.PropTypes.array,
};

export default TextSimilarCityView;
