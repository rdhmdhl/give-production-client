import React from 'react';
import PropTypes from 'prop-types';
import './SelectedItemDetails.css';
import {AiOutlineClose} from 'react-icons/ai';

const SelectedItemDetails = ({ item, clearSelectedItem}) => {
  if (!item) return null;

  return (
    <div className="selected-item-details">
      <img className="product-img" src={item.image.imageUrl} alt={item.title} />
      <div className="right-section">
        <div className="close-icon-container">
          <AiOutlineClose className="close-icon" onClick={clearSelectedItem}/>
        </div>
        <div className="titleandprice">
          <p className='selected-item-title'> {item.title}</p>
          <p className="selected-item-price">
            ${item.price && parseFloat(item.price.value).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

SelectedItemDetails.propTypes = {
  item: PropTypes.object,
  clearSelectedItem: PropTypes.func
};

export default SelectedItemDetails;
