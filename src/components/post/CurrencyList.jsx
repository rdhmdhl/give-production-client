import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
// TODO use update balace function to fetch new balace, instead of dispatching a payload
// use an api call to update the balance on the server, then call updateBalance to fetch
// import { UpdateBalance } from '../../context/AuthActions';
import NotificationSender from '../notifications/NotificationSender';
import config from '../../config';
import Popup from '../popup/Popup';
import './CurrencyList.css';

export default function CurrencyList({post, setAmount, currentUser, onClick, socket, onAmountClick, setChangeCurrencyColor, setSeenMoney, onGive = () => {} }) {

const { user, balance, dispatch } = useContext(AuthContext);
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

// Main function to handle currency transactions
async function currencyHandler(currency, post, user, balance, dispatch, popupStatus, setAmount, currentUser, setChangeCurrencyColor, onGive) {
  if (post && post.userId !== currentUser._id) {
    if (balance < currency) {
      await popupStatus("Add money to your account balance.", "Close");
      return;
    }

    const token = localStorage.getItem('token');
    const userConfirmed = await confirmTransaction(currency, popupStatus, setSeenMoney);

    // if user confirms transaction 
    if (userConfirmed) {
      const withdrawalResult = await performWithdrawal(currency, user, token);

      // if withdrawal is sucessful
      if (withdrawalResult.success) {
        const updateResult = await updatePostAndBalance(currency, post, user, dispatch, setAmount, setChangeCurrencyColor, onGive);

        // if withdrawal not successful
        if (!updateResult.success) {
          await popupStatus(updateResult.error, "Close");
        } else {
          // send notification if result is sucessful
          handleNotification(currency);
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



// Function to update the post and balance
async function updatePostAndBalance(currency, post, user, dispatch) {
  try {
      // Update the post
      const postResponse = await axios.post(`${config.apiUrl}/statuses/api/gives`, {
        type: 'currency',
        amount: currency,
        postId: post._id,
      });
  
      const giveId = postResponse.data.give._id;
      const giveUserId = user._id;
  
      // Update the post with the reference to the Give document
      await axios.put(`${config.apiUrl}/statuses/api/statuses/` + post._id + "/give", {
        type: 'currency',
        giveUserId: giveUserId, 
        giveId: giveId
      });
  
      // Update the balance
      dispatch({ type: "UPDATE_BALANCE", payload: balance - currency });
  
      // Update the amount state
      setAmount(prevAmount => prevAmount + currency);
  
      // Change the color
      setChangeCurrencyColor(true);
  
      // Call the onGive function
      onGive();
  

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update post and balance' };
  }
}


// Function to show a confirmation popup
async function confirmTransaction(currency, popupStatus, setSeenMoney) {
  return new Promise((resolve) => {
    popupStatus(
      `Are you sure you want to give $${currency}?`,
      "Yes",
      () => {
        resolve(true);
        setShowPopup(false); // Close the popup
        setSeenMoney(false); // Close the currencyList
      },
      "No",
      () => {
        resolve(false);
        setShowPopup(false); // Close the popup
      }
    );
  });
}

// Function to perform the withdrawal
async function performWithdrawal(currency, user, token) {
  try {
    const response = await axios.post(`${config.apiUrl}/api/billing-settings-withdrawal`, {
      balance: currency,
      userId: user._id
    }, {
      headers: {
        'x-auth-token': token
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response ? error.response.data : 'Network error' };
  }
}

  const handleNotification = async (currency) => {

    let receiverUserId = post.userId;
    let senderUserId = user._id;
    let amount = currency;
    let linkorpost = "post";
    let giveorreceive = "give";
    let type = "currency";
    let relatedPostId = post._id
    let message = "gave to your post"

    await NotificationSender({
      socket,
      receiverUserId,
      senderUserId,
      amount,
      linkorpost,
      giveorreceive,
      type, 
      relatedPostId,
      message
    });
  }

  function combinedClickHandler(currency) {
    // Call giveHandler function
    if (post) {
      currencyHandler(currency, post, user, balance, dispatch, popupStatus, setAmount, currentUser, setChangeCurrencyColor, onGive);

    }
  }

// called when user clicks on item, creates modal with the product info
// or highlights an item for the share component
const handleCurrencyClick = (currency) => {
  if (onAmountClick) {
    onAmountClick(currency);
  }
};

  return (
    <div className='amounts' onClick={onClick}>
      {showPopup && (
        <Popup 
          isPopupOpen={showPopup} 
          message={popupMessage} 
          button1Text={buttonOneText} 
          button1Action={buttonOneFunc} 
          button2Text={buttonTwoText} 
          button2Action={buttonTwoFunc}       
        />
      )}
        <span className="giveMoney" 
            onClick={function oneDollar(){
            let currency=1; combinedClickHandler(currency); handleCurrencyClick(currency)
            }}
        >$1
        </span>

        <span className="giveMoney" 
            onClick={function fiveDollars(){
            let currency=5; combinedClickHandler(currency); handleCurrencyClick(currency)
            }}
        >$5
        </span>

        <span className="giveMoney" 
            onClick={function tenDollars(){
            let currency=10; combinedClickHandler(currency); handleCurrencyClick(currency)
            }} 
        >$10
        </span>
    </div>

  )
}

CurrencyList.propTypes = {
    post: PropTypes.object,
    currentUser: PropTypes.object,
    setAmount: PropTypes.func,
    onClick: PropTypes.func,
    onGive: PropTypes.func,
    socket: PropTypes.object,
    setChangeCurrencyColor: PropTypes.func,
    setSeenMoney: PropTypes.func,
    onAmountClick: PropTypes.func
};