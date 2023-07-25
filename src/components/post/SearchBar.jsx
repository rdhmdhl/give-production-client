import React, { useState } from 'react';
import axios from 'axios';
import './SearchBar.css';
import PropTypes from 'prop-types';
import {ImSearch} from 'react-icons/im'

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get('/api/products/search', {
        params: {
          q: query,
        },
      });
      const items = response.data;
      onSearch(items);
    } catch (error) {
      alert('An error occurred when trying to search for an item. Please try again later.')
    }
  };
  

  return (
    <form className='searchbar-container' onSubmit={handleSubmit}>
      <input type="text"  
      value={query} 
      onChange={handleQueryChange} 
      placeholder="Search for an item..."
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      />
        <ImSearch className={`search-icon ${isFocused ? 'focused' : ''}`} type="submit"/>
    </form>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};