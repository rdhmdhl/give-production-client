import React, { useState } from 'react';
import axios from 'axios';
import './SearchBar.css';
import PropTypes from 'prop-types';
import {ImSearch} from 'react-icons/im'
import config from '../../config';
import Popup from '../popup/Popup';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const popupStatus = async (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  }

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(`${config.apiUrl}/api/products/search`, {
        params: {
          q: query,
        },
      });
      const items = response.data;
      onSearch(items);
    } catch (error) {
      await popupStatus("An error occurred when searching for an item. Please try again later.", "Close")
    }
  };
  

  return (
    <form className='searchbar-container' onSubmit={handleSubmit}>
      <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />
      <input type="text"  
      className='searchbar-input'
      value={query} 
      onChange={handleQueryChange} 
      placeholder="Search for an item..."
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      />
      <ImSearch 
        className={`search-icon ${isFocused ? 'focused' : ''}`} 
        type="submit"
        onClick={handleSubmit}
      />
    </form>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};