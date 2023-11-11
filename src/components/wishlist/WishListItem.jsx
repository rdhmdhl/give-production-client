import React, { useState } from 'react';
import './WishListItem.css';
import {AiOutlineClose} from 'react-icons/ai';


export default function wishListItem({selectedItem}) {
    const [showItem, setShowitem] = useState(true);

    if (!showItem || !selectedItem) {
        return null;
    }

    const itemPrice = parseFloat(selectedItem.price.value);
    let shippingCostValue = calculateShipping(selectedItem);
    const totalPrice = itemPrice + shippingCostValue;


    function calculateShipping(item) {
        if (item.shippingOptions && item.shippingOptions.length > 0) {
            const shippingOption = item.shippingOptions[0];
            if (shippingOption.shippingCostType === "CALCULATED") {
                // TODO: add shipping ad
                return "+ shipping";
            }
            if (shippingOption.shippingCost.value === "0.00") {
                return 0;
            }
            if (shippingOption.shippingCost.value) {
                return `${parseFloat(shippingOption.shippingCost.value).toFixed(2)}`;
            }
        }
        // return a default value or throw an error if no valid shipping option is found
        throw new Error("No valid shipping option found.");
    }

  return (
    <div className='wish-list-item-container'>
        <div className="wish-list-item-details">
            <div className="image-container">
                <img src={selectedItem.image.imageUrl} alt="" />
            </div>

            <div className="title-and-progress-container">
                <div className="wish-list-title-container">
                    <h2 className='wish-list-item-title'>{selectedItem.title}</h2>
                    <div className='wish-item-close-icon'>
                        <AiOutlineClose onClick={() => setShowitem(prev => !prev)}/>
                    </div>
                </div>
                <div className="progress-bar">
                    <div className="inside-progress-bar"></div>
                </div>
                <div className="progress-container">
                    <h3>$40 of ${totalPrice} Collected</h3>
                </div>
            </div>
        </div>
        <div className="line-break"/>
    </div>
  )
}
