import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ItemModal from './ItemModal';
import ReactDOM from 'react-dom';
import './ItemList.css';

export default function ItemList({ items, post, setItemGives, onGive, setChangeItemIconColor, socket, onItemClick }) {
    const [selectedItem, setSelectedItem] = useState(null);

    const uniqueItems = [];
    const itemIds = new Set();

    items.forEach((item) => {
        if (!itemIds.has(item.itemId)) {
        uniqueItems.push(item);
        itemIds.add(item.itemId);
        }
    });

    // called when user clicks on item, creates modal with the product info
    // or highlights an item for the share component
    const handleItemClick = (item) => {
        if (onItemClick) {
            onItemClick(item);
        } else {
            setSelectedItem(item);
        }
    };

    // used to exit the modal
    const closeModal = () => {
    setSelectedItem(null);
    };

    return (
    <div className="item-list-container">
    {selectedItem && ReactDOM.createPortal(
      <ItemModal
        className="item-modal-in-list"
        item={selectedItem}
        showModal={!!selectedItem}
        setShowModal={closeModal}
        post={post}
        setItemGives={setItemGives}
        setChangeItemIconColor={setChangeItemIconColor}
        socket={socket}
        onGive={onGive}
      />,
      document.body // renders directly within <body>
    )}
        <div className="item-list">
            {uniqueItems.map((item, index) => (
            <span className="item" key={`${item.itemId}-${index}`} onClick={() => handleItemClick(item)}>
                {/* <p className="headline">{item.title}</p> */}
                <img className="product-img" src={item.image.imageUrl} alt={item.title} />
                <p className='title'> {item.title}</p>
                <p className="price">
                    ${item.price && parseFloat(item.price.value).toFixed(2)}
                </p>

                <p className='line'></p>
                <p className='cta'>Send Now</p>

            </span>
            ))}
        </div>
    </div>
    );
}

ItemList.propTypes = {
items: PropTypes.array,
post: PropTypes.object,
setItemGives: PropTypes.func,
onGive: PropTypes.func,
setChangeItemIconColor: PropTypes.func,
socket: PropTypes.object,
onItemClick: PropTypes.func
};