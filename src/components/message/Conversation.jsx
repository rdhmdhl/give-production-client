import React from 'react'
import './coversation.css';
import PropTypes from 'prop-types';
function Conversation({conversation,
    //  socket
    }) {

  function truncateAtWord(str, maxLength) {
    if (str.length <= maxLength) {
        return str;
    }

    const truncated = str.slice(0, maxLength + 1);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex > 0) {
        return truncated.slice(0, lastSpaceIndex) + '...';
    }

    return truncated.slice(0, maxLength) + '...';
  }
        

  return (
    <div className='single-conversation-container'>
        <div className="left-side-container">
            <img className='profile-picture' src="/assets/person/nopicture.png" alt="" />
        </div>
        <div className="right-side-container">
            <h3 className='username-title'>Anonymous User</h3>      
            <p className='message-preview'>
                {truncateAtWord(conversation.lastMessage, 69)} {/* Adjust 50 to your preferred length */}
            </p>  
        </div>
    </div>
  )
}

Conversation.propTypes = {
    conversation: PropTypes.shape({
        lastMessage: PropTypes.string,
        // updatedAt: PropTypes.string
    }),
};

export default Conversation