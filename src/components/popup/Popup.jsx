import './popup.css';
import React from 'react';
import PropTypes from 'prop-types';

const Popup = ({ isPopupOpen, message, button1Text, button1Action, button2Text, button2Action }) => {
  if (!isPopupOpen) return null;

  return (
    <div className="popup">
      <div className="popup-content">
        <p className='content-p'>{message}</p>

        <button className='popup-button' onClick={(e) => { e.stopPropagation(); button1Action(); }}>{button1Text}</button>

        {button2Text && <button onClick={(e) => { e.stopPropagation(); button2Action(); }}>{button2Text}</button>}
      </div>
    </div>
  );
};

Popup.propTypes = {
    isPopupOpen: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
    button1Text: PropTypes.string.isRequired,
    button1Action: PropTypes.func.isRequired,
    button2Text: PropTypes.string,
    button2Action: PropTypes.func,
};

export default Popup;
