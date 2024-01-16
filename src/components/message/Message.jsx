import React, { useContext } from 'react'
import PropTypes from 'prop-types';
// import {useNavigate} from 'react-router-dom';
import './message.css';
import { AuthContext } from '../../context/AuthContext';

function Message({message, 
  //socket
}) {
  
  const { user } = useContext(AuthContext)
  
  // Check if the message was sent by the current user
  const isCurrentUser = message.senderUserId === user._id;

  // Apply different styles based on who sent the message
  const messageClass = isCurrentUser ? 'message-sent' : 'message-received';

  // Render different content based on the message type
  const renderMessageContent = () => {
    if (message.messageType === 'gift') {
      if (message.giftDetails.giftType === 'item') {
        // Render image for item type gift
        return <img src={message.giftDetails.img} alt="Gift Item" />;
      } else {
        // Render text for currency type gift
        return <div className="currency-gift-box">{message.text}</div>;
      }
    } else {
      // Render text message
      return <p>{message.text}</p>;
    }
  };

  return (
    <div className={`individual-message-container ${messageClass}`}>
      {renderMessageContent()}
    </div>
  )
}

Message.propTypes = {
    message: PropTypes.shape({
        text: PropTypes.string,
        senderUserId: PropTypes.string,
        messageType: PropTypes.string,
        giftDetails: PropTypes.object,
        _id: PropTypes.string,
        // updatedAt: PropTypes.string
    }),
    socket: PropTypes.object
  };

export default Message