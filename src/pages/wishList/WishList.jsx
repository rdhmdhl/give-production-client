import React, { useState } from 'react'
// import PropTypes from 'prop-types'
import WishListItem from '../../components/wishlist/WishListItem';
import Gift from '../../components/post/Gift.jsx'
import { AiFillPlusCircle } from 'react-icons/ai';
import './WishList.css';

export default function wishList() {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null)
  const [showItem, setShowItem] = useState(false)
  // const [seenGifts, setseenGifts] = useState(null)


  // hook to run getBalance function when component mounts
  // useEffect(() => { 
  //   if (showSearchBar) {
  //       setShowSearchBar(prev => prev);
  //       console.log("chaning the state of showgiftsection!");
  //   }
  // }, [setShowGiftSection]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowItem(true);
    // setseenGifts(false); // used to hide the item list when a selection is made
    console.log("logging from the wishlist, here is the item: ", item);
    setShowSearchBar(prev => !prev)
};

const handleAddItemClick = () => {
  setShowSearchBar(prev => !prev)
  
}



  return (
    <div className='wishlist-wrapper'>
        <div className="title-container">
            <h1 className='wishlist-title'>
                Reid&apos;s Wishlist
            </h1>
        </div>

        {showSearchBar &&
          <div className="search-results-container">
            <Gift onItemClick={handleItemClick}/>
          </div>
        }
        {showItem &&
          <WishListItem selectedItem={selectedItem}/>
        }

        <div className="add-item-icon-container">
            <AiFillPlusCircle className='add-item-icon' onClick={handleAddItemClick}/>
        </div>
    </div>
  )
}

// wishList.propTypes = {}
// 
