import React from 'react'
import './coversation.css';
import PropTypes from 'prop-types';
import {useNavigate} from 'react-router-dom';

function Conversation({conversation,
    //  socket
    }) {

    const navigate = useNavigate();


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

    const goToConversationPage = () => {
        navigate(`/messages/${conversation._id}`);
    }
        

  return (
    <div className='single-conversation-container' onClick={goToConversationPage}>
        <div className="left-side-container">
            <img className='profile-picture' src={`${process.env.REACT_APP_PUBLIC_FOLDER}/assets/person/no-profile-pic.webp`} alt="" />
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
        _id: PropTypes.string,
        // updatedAt: PropTypes.string
    }),
};

export default Conversation