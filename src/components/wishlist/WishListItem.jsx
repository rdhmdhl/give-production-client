import React from 'react';
import './WishListItem.css';
import imageSrc from './s-l500.jpeg';

export default function wishListItem() {
  return (
    <div className='wish-list-item-container'>
        <div className="wish-list-item-details">
            <div className="image-container">
                <img src={imageSrc} alt="" />
            </div>

            <div className="title-and-progress-container">
                <div className="wish-list-title-container">
                    <h2 className='wish-list-item-title'>Apple iPhone 15 Pro 128GB - Natural Titanium 6.1-inch</h2>
                </div>
                <div className="progress-bar">
                    <div className="inside-progress-bar"></div>
                </div>
                <div className="progress-container">
                    <h3>$40 of $1599 Collected</h3>
                </div>
            </div>
        </div>
        <div className="line-break"/>
    </div>
  )
}
