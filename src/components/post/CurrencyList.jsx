import React, { useContext } from 'react'
import PropTypes from 'prop-types';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { UpdateBalance } from '../../context/AuthActions';
import NotificationSender from '../notifications/NotificationSender';
import config from '../../config';

export default function CurrencyList({post, setAmount, currentUser, onClick, socket, onAmountClick, setChangeCurrencyColor, onGive = () => {} }) {

const { user, balance, dispatch } = useContext(AuthContext);

    // updates the gives and amount gave on the front end and the backend
    function currencyHandler(currency) {
      if(post && post.userId !== currentUser._id) {
        if(balance < currency) {
          alert("Add money to your account balance.")
          return;
        }
        try {
          const token = localStorage.getItem('token');
          alert(`Are you sure you want to give $${currency}?`);
  
          axios.post(`${config.apiUrl}/api/billing-settings-withdrawal`, {
            balance: currency,
            userId: user._id
          }, {
            headers: {
              'x-auth-token': token
            }

          }).then(() => {
              setAmount(prevsetAmount => prevsetAmount + currency);

              // Call handleNotification function
              handleNotification(currency);

              // use context state to update the balace used in the topbar
              dispatch(UpdateBalance(prevBalance => prevBalance - currency)); // Decrease user's balance in context

              
              axios.post(`${config.apiUrl}/statuses/api/gives`, {
                type: 'currency',
                amount: currency,
                postId: post._id,
                
              }).then(response => {
                const giveId = response.data.give._id;
                const giveUserId = currentUser._id;
              
                // Update the post with the reference to the Give document
              axios.put(`${config.apiUrl}/statuses/api/statuses/` + post._id + "/give", {
                type: 'currency',
                giveUserId: giveUserId, 
                giveId: giveId
              })
              .then(() => {
                // Call the onGive function to increment the givesCounter after the post is updated
                onGive();
                // state used to change the color of the icon on the post immediately 
                setChangeCurrencyColor(true);      
              });
            })
          }).catch((err) => {
            // Handle insufficient balance error
            if (err.response && err.response.status === 400 && err.response.data.error === 'Insufficient balance for withdrawal') {
              alert('You do not have enough balance to complete this transaction.');
            } else {
              alert("Something happened. Please try again later.");
            }
          })
        } catch (error) {
          alert("Failed to load notifications. Please try again later.");
        }
      } else {
        alert('You cannot give to your own post!')
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
          currencyHandler(currency);
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
    onAmountClick: PropTypes.func
};