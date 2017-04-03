import React, { PropTypes } from 'react';

const ModeSelector = ({ mode, onChange }) => {
  return (
    <div className="mode-selector">
      <button
        className={`btn btn-default ${mode === 'map' ? 'active' : ''}`}
        onClick={() => mode !== 'map' && onChange('map')}
      >
        Map
      </button>
      <button
        className={`btn btn-default ${mode === 'cluster' ? 'active' : ''}`}
        onClick={() => mode !== 'cluster' && onChange('cluster')}
      >
        Cluster
      </button>
    </div>
  );
}
ModeSelector.propTypes = {
  mode: PropTypes.string,
  onChange: PropTypes.func,
};

export default ModeSelector;
