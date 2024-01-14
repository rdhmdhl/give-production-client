import React from 'react';
import PropTypes from 'prop-types';
import './ItemModal.css';
import { useState, useContext } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { AuthContext } from '../../context/AuthContext';
import Popup from '../popup/Popup';
import NotificationSender from '../notifications/NotificationSender';
import axios from 'axios';
import config from '../../config';

export default function ItemModal({ item, showModal, setShowModal, setChangeItemIconColor, post, setItemGives, onGive, socket, setseenGifts, onItemClick }) {

const [currentImage, setCurrentImage] = useState(item.image.imageUrl);
const {user: currentUser, balance, dispatch} = useContext(AuthContext);
const [showPopup, setShowPopup] = useState(false);
const [popupMessage, setPopupMessage] = useState('');
const [buttonOneText, setButtonOneText] = useState('');
const [buttonOneFunc, setButtonOneFunc] = useState(() => {});
const [buttonTwoText, setButtonTwoText] = useState('');
const [buttonTwoFunc, setButtonTwoFunc] = useState(() => {});


const popupStatus = async (message, buttonOne, buttonOneFunc, buttonTwo, buttonTwoFunc) => {
  setPopupMessage(message);
  setButtonOneText(buttonOne);
  setButtonOneFunc(() => buttonOneFunc); // Assuming buttonOneFunc is a function
  setButtonTwoText(buttonTwo);
  setButtonTwoFunc(() => buttonTwoFunc); // Assuming buttonTwoFunc is a function
  setShowPopup(true);
}

if (!showModal) return null;

// log a message when the modal is showing
let totalPrice;

const handleImageClick = (image) => {
  setCurrentImage(image)
}

  // main function for handling give
  const giveHandler = async (item) => {
    if (post && post.userId !== currentUser._id) {
      if (balance < item.price.value) {
        await popupStatus("Add money to your account balance.", "Close", () => {setShowPopup(false)});
        return;
      }
    
    // calculate shipping
    const shippingTotal = calculateShipping(item);
    // calculate total price, including shipping
    const totalPrice = calculateTotalPrice(item, shippingTotal);

    // setting title for confirm give function
    const itemPrice = item.price.value;

    // token from local storage
    const token = localStorage.getItem('token');
    // popup to ask user if they want to give item
    const userConfirmed = await confirmGive(itemPrice, setseenGifts);

    // if user confirms transaction 
    if (userConfirmed) {
      const withdrawalResult = await performWithdrawal(totalPrice, currentUser, token);

      // if withdrawal is sucessful
      if (withdrawalResult.success) {
        const updateResult = await updatePostAndBalance(item, totalPrice, post, dispatch, setItemGives, setChangeItemIconColor, onGive);

        // if withdrawal not successful
        if (!updateResult.success) {
          await popupStatus(updateResult.error, "Close");
        } else {
          // send notification if result is sucessful
          handleNotification(item);
        }
      } else {
        // withdrawal error popup
        await popupStatus(withdrawalResult.error, "Close");
      }
    }
  } else {
    await popupStatus('You cannot give to your own post!', 'Close');
  }
}

  const calculateTotalPrice = (item, shippingTotal) => {
    if (shippingTotal !== "Calculated" && shippingTotal !== "Free") {
      return parseFloat(item.price.value) + parseFloat(shippingTotal);
    }
    return parseFloat(item.price.value);
  };

// Function to update the post and balance
async function updatePostAndBalance(item, totalPrice, post, dispatch, setItemGives, setChangeItemIconColor, onGive) {
  try {
      // update the post
      const response = await axios.post(`${config.apiUrl}/statuses/api/gives`, {
        type: 'item',
        price: parseFloat(item.price.value),
        shipping: calculateShipping(item),
        ebItemId: item.itemId,
        ebItemTitle: item.title,
        ebItemPhoto: item.image.imageUrl,
        postId: post._id
      });

      // set give id and user id
      const giveId = response.data.give._id;
      const giveUserId = currentUser._id;
      
      // Update the post with the reference to the Give document
      await axios.put(`${config.apiUrl}/statuses/api/statuses/` + post._id + "/give", {
        type: 'item',
        giveUserId: giveUserId,
        giveId: giveId,
      });
  
      // Update the balance
      dispatch({ type: "UPDATE_BALANCE", payload: balance - totalPrice });

      // Update the number of gifts on the post
      setItemGives(prevItemGives => prevItemGives + 1);
  
      // Add the gift to the gift section of the post
      onGive();
  
      // Change the color of the icon on the post immediately
      setChangeItemIconColor(true);
  

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update post and balance' };
  }
}

// Function to perform the withdrawal
async function performWithdrawal(totalPrice, currentUser, token) {
  try {
    // withdrawal from user's account
    const response = await axios.post(`${config.apiUrl}/api/billing-settings-withdrawal`, {
      balance: totalPrice,
      userId: currentUser._id
    }, {
      headers: {
        'x-auth-token': token
      }
    });
    setShowModal(false);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response ? error.response.data : 'Network error' };
  }
}

  // confim the user wants to give this item
  async function confirmGive(itemPrice, setseenGifts) {
    setShowPopup(true);
    return new Promise((resolve) => {
      popupStatus(
        `Are you sure you want to give this item for $${itemPrice}?`,
        "Yes",
        () => {
          resolve(true);
          setShowPopup(false); // Close the popup
          setseenGifts(false); // Close the Item Modal and Gift component
        },
        "No",
        () => {
          resolve(false);
          setShowPopup(false); // Close the popup
        }
      );
    });
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

    function combinedClickHandler(item, popupStatus) {
      if(post){
        // Call giveHandler function
        giveHandler(item, popupStatus, balance, popupStatus, setChangeItemIconColor, onGive);
      } else {
        onItemClick(item);
      }
    }

  return (
    <div className="item-modal">
      {showPopup && (
        <Popup 
          className="popup"
          isPopupOpen={showPopup} 
          message={popupMessage} 
          button1Text={buttonOneText} 
          button1Action={buttonOneFunc} 
          button2Text={buttonTwoText} 
          button2Action={buttonTwoFunc}       
        />
      )}
      <div className="item-modal-content">


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
    post: PropTypes.object,
    setItemGives: PropTypes.func.isRequired,
    setChangeItemIconColor: PropTypes.func,
    onGive: PropTypes.func,
    socket: PropTypes.object,
    setseenGifts: PropTypes.func,
    onItemClick: PropTypes.func
  };