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

  
  return (
    <div className={`individual-message-container ${messageClass}`}>
      <p>{message.text}</p>
    </div>
  )
}

Message.propTypes = {
    message: PropTypes.shape({
        text: PropTypes.string,
        senderUserId: PropTypes.string,
        _id: PropTypes.string,
        // updatedAt: PropTypes.string
    }),
    socket: PropTypes.object
  };

export default Message