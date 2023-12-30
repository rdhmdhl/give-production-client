import React from 'react'
import './coversation.css';

function Conversation() {
  return (
    <div className='single-conversation-container'>
        <div className="left-side-container">
            <img className='profile-picture' src="/assets/person/nopicture.png" alt="" />
        </div>
        <div className="right-side-container">
            <h3 className='username-title'>Anonymous User</h3>      
            <p className='message-preview'>You sent this user $5</p>  
        </div>
    </div>
  )
}

export default Conversation