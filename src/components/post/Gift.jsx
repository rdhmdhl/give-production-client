import React, { useState } from 'react';
import SearchBar from './SearchBar';
import ItemList from './ItemList';
import PropTypes from 'prop-types';
import './Gift.css';

function Gift({post, setItemGives, onClick, onGive, setChangeItemIconColor, socket, setseenGifts, onItemClick}) {
  const [items, setItems] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (searchResults) => {
    setItems(searchResults);
    setSearched(true);
  };

  return (
    <div className='gift-container' onClick={onClick}>
      <SearchBar onSearch={handleSearch} />
      {searched && 
      <ItemList 
      items={items} 
      post={post} 
      setItemGives={setItemGives} 
      onGive={onGive}
      socket={socket}
      onItemClick={onItemClick}
      setChangeItemIconColor={setChangeItemIconColor}
      setseenGifts={setseenGifts}
      />}
      </div>
  );
}

export default Gift;

Gift.propTypes = {
  post: PropTypes.object,
  setItemGives: PropTypes.func,
  onClick: PropTypes.func,
  onGive: PropTypes.func,
  socket: PropTypes.object,
  setChangeItemIconColor: PropTypes.func,
  onItemClick: PropTypes.func,
  setseenGifts: PropTypes.func
};

// needed for the createlink component that does not need these props
Gift.defaultProps = {
  post: null,
  setItemGives: () => {},
  onClick: () => {},
  onGive: () => {},
  socket: null,
};
