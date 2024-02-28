import React, { useContext } from 'react'
import PropTypes from 'prop-types';
// import {useNavigate} from 'react-router-dom';
import 'normalize.css';
import './message.css';
import { AuthContext } from '../../context/AuthContext';

const Message = React.forwardRef (({ message }, ref) => {
  // Assign a displayName to your component for ESLint
  Message.displayName = 'Message';
  const { user } = useContext(AuthContext)
  
  // Check if the message was sent by the current user
  const isCurrentUser = message.senderUserId === user._id;

  // Apply different styles based on who sent the message
  const messageClass = isCurrentUser ? 'message-sent' : 'message-received';
  let giftTitle;

  // Render different content based on the message type
  const renderMessageContent = () => {
    if (message.messageType === 'gift' ) {
      if (message.senderUserId === user._id) {
          giftTitle = message.giftDetails.title ? (
          <div className="gift-title">{`You gave: ${message.giftDetails.title}`}</div>
        ) : null;
      } else {
          giftTitle = message.giftDetails.title ? (
          <div className="gift-title">{`User gave: ${message.giftDetails.title}`}</div>
        ) : null;
      }
  
      if (message.giftDetails.giftType === 'item') {
        // Render image for item type gift
        return (
          <>
            {giftTitle && <div className="gift-title">{giftTitle}</div>}
            <img src={message.giftDetails.img} alt="Gift Item" />
          </>
        );
      } else {
        if (message.senderUserId === user._id){
          giftTitle = "You gave: "
        } else {
          giftTitle = "User gave: "
        }
        
        // Render text for currency type gift
        return (
          <>
            {giftTitle && <div className="gift-title">{giftTitle}</div>}
            <div className="currency-gift-box">
              ${message.text}
            </div>
          </>
        );
      }
    } else {
      // Render text message
      return <div>{message.text}</div>;
    }
  };

  return (
    <div ref={ref} className={`individual-message-container ${messageClass}`}>
      {renderMessageContent()}
    </div>
  )
})

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