import React from 'react'
import './Messages.css';
import Conversation
 from '../../components/message/Conversation';
function Messages() {
  return (
    <div className='messages-container'>
        <div className="top-box">
            <h2 className='inbox-title'>Inbox</h2>
        </div>
        <Conversation/>
        <Conversation/>
        <Conversation/>
        <Conversation/>
    </div>
  )
}

export default Messages