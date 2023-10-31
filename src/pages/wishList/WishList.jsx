import React from 'react'
// import PropTypes from 'prop-types'
import WishListItem from '../../components/wishlist/WishListItem';
import { AiFillPlusCircle } from 'react-icons/ai';
import './WishList.css';

function wishList() {
  return (
    <div className='wishlist-wrapper'>
        <div className="title-container">
            <h1 className='wishlist-title'>
                Reid&apos;s Wishlist
            </h1>
        </div>
        <WishListItem/>
        <div className="add-item-icon-container">
            <AiFillPlusCircle className='add-item-icon'/>
        </div>
    </div>
  )
}

// wishList.propTypes = {}
// 
export default wishList
