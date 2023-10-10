import React from 'react';
import PropTypes from 'prop-types';
import './callbackpopup.css';

const CallbackPopup = ({ message, onClose }) => {
  return (
    <div className="popup-container">
      <div className="popup-content">
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

CallbackPopup.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CallbackPopup;
