import React from 'react';
import PropTypes from 'prop-types';
import './ItemModal.css';
import { useState, useContext } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { AuthContext } from '../../context/AuthContext';
import { UpdateBalance } from '../../context/AuthActions';
import axios from 'axios';

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
        axios.post("statuses/api/gives", {
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
          dispatch(UpdateBalance(prevBalance => prevBalance - totalPrice)); // Decrease user's balance in context
    
          axios.post("/api/billing-settings-withdrawal", {
            balance: totalPrice,
            userId: currentUser._id
          }, {
            headers: {
              'x-auth-token': token
            }
          })
          .then(() => {
            // Update the post with the reference to the Give document
            axios.put("statuses/api/statuses/" + post._id + "/give", {
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

    // get online user from the database
    function getUser(userId) {
      return axios.get(`/api/onlineusers/${userId}`)
        .then((response) => {
          if (response.status === 204) {
            return null; // user is offline
          } else {
            return response.data;
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 404) {
            return null; // user not found
          }
          else {
            alert('An error occured when trying to get the user.');
            return null;
          }
        });
    }
// *****
    function handleNotification(item) {
      const receiver = post.userId;
      getUser(receiver).then((onlineUser) => {
    
        // Always save the notification to the database
        axios
          .post("/api/notifications", {
            receiverUserId: post.userId,
            senderUserId: currentUser._id,
            relatedPostId: post._id,
            ebItemId: item.itemId,
            ebItemTitle: item.title,
            ebItemPhoto: item.image.imageUrl,
            amount: totalPrice,
            type: "item",
            read: false,
          })
          .catch(() => {
            alert('An error occured when trying to save the notfication.');
          });
    
        // Emit the sendMessage event if the user is online
        if (socket && onlineUser) {
          const createdAt = new Date().toISOString();
          socket.emit('sendMessage', {
            senderUserId: currentUser._id,
            receiverUserId: post.userId,
            relatedPostId: post._id,
            ebItemId: item.itemId,
            ebItemTitle: item.title,
            ebItemPhoto: item.image.imageUrl,
            amount: totalPrice,
            type: 'item',
            createdAt: createdAt
          });
        }
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