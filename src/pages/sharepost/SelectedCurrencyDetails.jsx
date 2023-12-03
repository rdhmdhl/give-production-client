import React from 'react';
import PropTypes from 'prop-types';
import './SelectedCurrencyDetails.css';
import {AiOutlineClose} from 'react-icons/ai';

const SelectedCurrencyDetails = ({ amount, clearSelectedCurrency, giveorreceive}) => {
  if (!amount) return null;

  let descriptionSentance;

  if (giveorreceive === 'give') {
    descriptionSentance = "Select enter the number of times this can be used in the quantity field."
  } else {
    descriptionSentance = "";
  }

  return (
    <div className="selected-currency-details">
        <div className="currency-amount-container">
          <p className='selected-currency-amount'>${amount}</p>
        </div>
        <div className="right-currency-section">
            <div className="close-icon-container">
            <AiOutlineClose className="close-currency-icon" onClick={clearSelectedCurrency}/>
            </div>
            <div className="currency-description">
              <p>{giveorreceive} this gift. {descriptionSentance} Click create below to share this link.</p>
            </div>
        </div>
    </div>
  );
};

SelectedCurrencyDetails.propTypes = {
  amount: PropTypes.number,
  clearSelectedCurrency: PropTypes.func,
  giveorreceive: PropTypes.string,
};

export default SelectedCurrencyDetails;
