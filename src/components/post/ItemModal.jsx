import React from 'react';
import PropTypes from 'prop-types';
import './ItemModal.css';
import { useState, useContext } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { AuthContext } from '../../context/AuthContext';
import { UpdateBalance } from '../../context/AuthActions';
import NotificationSender from '../notifications/NotificationSender';
import axios from 'axios';
import config from '../../config';

export default function ItemModal({ item, showModal, setShowModal, setChangeItemIconColor, post, setItemGives, onGive, socket }) {

const [currentImage, setCurrentImage] = useState(item.image.imageUrl);
const {user: currentUser, balance, dispatch} = useContext(AuthContext);


if (!showModal) return null;

// log a message when the modal is showing
let totalPrice;
  const handleImageClick = (image) => {
    setCurrentImage(image)
  }
  function giveHandler(item) {
    if(post.userId !== currentUser._id) {
      try {
        const shippingTotal = calculateShipping(item);

    
        if (shippingTotal != "Calculated" && shippingTotal != "Free") {
          totalPrice = parseFloat(item.price.value) + parseFloat(calculateShipping(item));
        } else {
          totalPrice = parseFloat(item.price.value);
        }
    
        // Check if the user's balance is enough
        if (balance < totalPrice) {
          alert('Your balance is not sufficient to give this item.');
          return; // Stop execution of the function
        }

        alert(`Are you sure you want to give ${item.title}?`);
        axios.post(`${config.apiUrl}/statuses/api/gives`, {
          type: 'item',
          price: parseFloat(item.price.value),
          shipping: calculateShipping(item),
          ebItemId: item.itemId,
          ebItemTitle: item.title,
          ebItemPhoto: item.image.imageUrl,
          postId: post._id
        })
        .then(response => {
          const token = localStorage.getItem('token');
          const giveId = response.data.give._id;
          const giveUserId = currentUser._id;
    
          // Use context state to update the balace used in the topbar
          // Decrease user's balance in context
          dispatch(UpdateBalance(prevBalance => prevBalance - totalPrice));
    
          axios.post(`${config.apiUrl}/api/billing-settings-withdrawal`, {
            balance: totalPrice,
            userId: currentUser._id
          }, {
            headers: {
              'x-auth-token': token
            }
          })
          .then(() => {
            // Update the post with the reference to the Give document
            axios.put(`${config.apiUrl}/statuses/api/statuses/` + post._id + "/give", {
                  type: 'item',
                  giveUserId: giveUserId,
                  giveId: giveId,
            })
            .then(() => {
              // Update the number of gifts on the post
              setItemGives(prevItemGives => prevItemGives + 1);
              // Add the gift to the gift secton of the post
              onGive();
              // used to change the color of the icon on the post immediately
              setChangeItemIconColor(true);
              // Call handleNotification function
              handleNotification(item);
            });
          })
          .catch(() => {
            alert('An error occured when trying to update the post.');
          });
        })
        .catch(() => {
          alert('An error occured when trying to update the post.');
        });
      } catch{
        alert('An error occured when trying to update the post.');
      }
    } else {
      alert('You cannot give to your own post!')
    }
  }
  
  

  function calculateShipping(item) {
    if (item.shippingOptions && item.shippingOptions.length > 0) {
        const shippingOption = item.shippingOptions[0];
        if (shippingOption.shippingCostType === "CALCULATED") {
            return "Calculated";
        }
        if (shippingOption.shippingCost.value === "0.00") {
            return "Free";
        }
        if (shippingOption.shippingCost.value) {
            return `${parseFloat(shippingOption.shippingCost.value).toFixed(2)}`;
        }
    }
    // return a default value or throw an error if no valid shipping option is found
    throw new Error("No valid shipping option found.");
}


  const handleNotification = async (item) => {
  
      // Emit the sendMessage event if the user is online
        const createdAt = new Date().toISOString();

        let senderUserId = currentUser._id;
        let receiverUserId = post.userId;
        let relatedPostId = post._id;
        let ebItemId = item.itemId;
        let ebItemTitle = item.title;
        let ebItemPhoto = item.image.imageUrl;
        let amount = totalPrice;
        let type = "item";
        let linkorpost = "post";
        let message = "gave an item to your post"

        await NotificationSender({
          socket,
          receiverUserId,
          senderUserId,
          relatedPostId,
          ebItemId,
          ebItemTitle,
          ebItemPhoto,
          amount,
          type,
          linkorpost, 
          message,
          createdAt
        });
  }

    function combinedClickHandler(item) {
      // Call giveHandler function
      giveHandler(item);

      // Close the modal
      setShowModal(false);
    }

  return (
    <div className="item-modal">
      <div className="modal-content">
        <AiOutlineClose className = 'closebutton' onClick={() => setShowModal(false)}>Close</AiOutlineClose>
        <img src={currentImage} alt={item.title} />
        {/* image carousel */}
        {item.additionalImages && item.additionalImages.length > 0 && (
          <div className="image-carousel">
            {item.additionalImages.map((image, index) => (
              <img 
              key={index} 
              src={image.imageUrl} 
              alt={`Additional Image ${index}`} 
              className="additional-img" 
              onClick={() => handleImageClick(image.imageUrl)}
              />
            ))}
          </div>
        )}

        <div className="title-wrap">
            <h2>{item.title}</h2>
        </div>
        <p>Price: ${item.price && parseFloat(item.price.value).toFixed(2)}</p>
        {item.shippingOptions && item.shippingOptions.length > 0 && (
          <p>
            Shipping:{" "}
            {item.shippingOptions[0].shippingCostType === "CALCULATED"
              ? "Calculated"
              : item.shippingOptions[0].shippingCost.value === "0.00"
              ? "Free"
              : `$${parseFloat(item.shippingOptions[0].shippingCost.value).toFixed(2)}`}
          </p>
        )}
        <p>Condition: {item.condition}</p>
    
        <div className="button-container">
          <button className='giveButton' onClick={() => combinedClickHandler(item)}>
            Give
         </button>
        </div>
        

        {/* <p>Item ID: {item.itemId}</p> */}
      </div>
    </div>
  );
}

ItemModal.propTypes = {
    item: PropTypes.object.isRequired,
    showModal: PropTypes.bool.isRequired,
    setShowModal: PropTypes.func.isRequired,
    post: PropTypes.object.isRequired,
    setItemGives: PropTypes.func.isRequired,
    setChangeItemIconColor: PropTypes.func,
    onGive: PropTypes.func,
    socket: PropTypes.object
  };