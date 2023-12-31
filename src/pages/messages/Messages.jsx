import React from 'react'
import './Messages.css';
// import Conversation
//  from '../../components/message/Conversation';
import ConversationsFeed from '../../components/feed/ConversationsFeed';
import PropTypes from 'prop-types';


function Messages({user, socket}) {
  return (
    <div className='messages-container'>
        <div className="top-box">
            <h2 className='inbox-title'>Inbox</h2>
        </div>
        <ConversationsFeed user={user} socket={socket}/>
    </div>
  )
}

Messages.propTypes = {
    user: PropTypes.object,
    socket: PropTypes.object
}

export default Messages;