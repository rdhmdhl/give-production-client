import React from 'react';
import PropTypes from 'prop-types';
import './SelectedCurrencyDetails.css';
import {AiOutlineClose} from 'react-icons/ai';

const SelectedCurrencyDetails = ({ amount, clearSelectedCurrency, giveorreceive}) => {
  if (!amount) return null;

  return (
    <div className="selected-currency-details">
        <div className="currency-amount-container">
          <p className='selected-currency-amount'>${amount}</p>
        </div>
        <div className="right-currency-section">
            <div className="close-icon-container">
            <AiOutlineClose className="close-icon" onClick={clearSelectedCurrency}/>
            </div>
            <div className="currency-description">
              <p>{giveorreceive} this amount. Click share below to create a link.</p>
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
