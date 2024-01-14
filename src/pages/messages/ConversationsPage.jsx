import React from 'react'
// import Conversation
//  from '../../components/message/Conversation';
import ConversationsFeed from '../../components/feed/ConversationsFeed';
import PropTypes from 'prop-types';
import './ConversationsPage.css';

function ConversationsPage({user, socket}) {
  return (
    <div className='ConversationsPage-container'>
        <div className="top-box">
            <h2 className='inbox-title'>Inbox</h2>
        </div>
        <ConversationsFeed user={user} socket={socket}/>
    </div>
  )
}

ConversationsPage.propTypes = {
    user: PropTypes.object,
    socket: PropTypes.object
}

export default ConversationsPage;