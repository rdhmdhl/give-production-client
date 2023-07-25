import React, { useContext } from 'react'
import PropTypes from 'prop-types';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { UpdateBalance } from '../../context/AuthActions';


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
  
          axios.post("/api/billing-settings-withdrawal", {
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

              
              axios.post("statuses/api/gives", {
                type: 'currency',
                amount: currency,
                postId: post._id,
                
              }).then(response => {
                const giveId = response.data.give._id;
                const giveUserId = currentUser._id;
              
                // Update the post with the reference to the Give document
              axios.put("statuses/api/statuses/" + post._id + "/give", {
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
  

      function handleNotification(currency) {
        const receiver = post.userId;
        getUser(receiver).then((onlineUser) => {
      
          // Always save the notification to the database
          axios
            .post("/api/notifications", {
              receiverUserId: post.userId,
              senderUserId: currentUser._id,
              relatedPostId: post._id,
              amount: currency,
              type: "currency",
              read: false,
            })
            .catch(() => {
              alert("Failed to save notifications. Please try again later.");
            });
      
          // Emit the sendMessage event if the user is online
          if (socket && onlineUser) {
            const createdAt = new Date().toISOString();
            socket.emit('sendMessage', {
              receiverUserId: post.userId, // changed from receiverId to receiverUserId
              senderUserId: currentUser._id, // changed from senderId to senderUserId
              relatedPostId: post._id,
              amount: currency,
              type: "currency",
              read: false,
              createdAt: createdAt
            });
          }
        });
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
            alert('An error occured while checking the user status. Please try again later.')
            return null;
          }
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