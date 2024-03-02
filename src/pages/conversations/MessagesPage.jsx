import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';
import './MessagesPage.css';
import MessagesFeed from '../../components/feed/MessagesFeed';
import {useParams} from 'react-router-dom';
import PropTypes from 'prop-types';
import { IoSend } from "react-icons/io5";
import config from '../../config';
import Popup from '../../components/popup/Popup';

function MessagesPage({user, socket}) {
  // Use useParams hook to access conversationId from URL
  const { conversationId } = useParams();
  const [messageText, setMessageText] = useState('');
  const [messageReceiver, setMessageReceiver] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  // used for catch blocks
  const popupStaus = async (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  }

  useEffect(() => {
    if(conversationId){
      fetchConversation();
    }
  }, [conversationId,])


  const fetchConversation = async () => {
    let res;
    try {
      res = await axios.get(`${config.apiUrl}/conversations/find/${conversationId}`)

      if (res.data.initiatorUserId != user._id){
        setMessageReceiver(res.data.initiatorUserId);
      } else {
        setMessageReceiver(res.data.responderUserId);
      }

    } catch (error) {
      await popupStaus("An error occured when fetching conversation. You may not be able to see the message send in real time.")
    }
  }

  const sendMessage = async () => {
    if (messageText.trim()) {
      try {
        const response = await axios.post(`${config.apiUrl}/messages/send`, {
          conversationId: conversationId,
          senderUserId: user._id, // assuming user._id contains the ID of the sender
          text: messageText
        });

        if (response.status === 201) {
          // Message sent successfully
          // real time messaging
          socket.emit("sendMessage", {
            receiverUserId: messageReceiver,
            senderUserId: user._id,
            messageData: {
              conversationId: conversationId,
              text: messageText
            }
        });
        }
      } catch (error) {
        await popupStaus("An error occured when sending your message. Try again later.")
      }
      // clear the input feild after sending
      setMessageText(''); 
      document.querySelector('.message-input').style.height = '38px';
    }
  };

  // used for adjusting the height of the text area when typing
  const adjustHeight = (e) => {
    const textarea = e.target;
    const minHeight = 38; // Adjusted initial height including padding and border
  
    textarea.style.height = 'auto';
    const totalHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.max(totalHeight, minHeight)}px`;
  
    setMessageText(textarea.value);
  };

  return (
    <div className='messages-container'>
      <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />
        <MessagesFeed 
          socket={socket} 
          conversationId={conversationId}
        />
      <div className='message-input-container'>
        <textarea 
          value={messageText}
          onChange={adjustHeight}
          placeholder='Type a message...'
          className='message-input'
          rows="1" // Start with a single line
          style={{ height: '38px' }}
        />
        {messageText &&
          <IoSend onClick={sendMessage} className='send-message-button'>Send</IoSend>
        }
      </div>
    </div>
  )
}

MessagesPage.propTypes = {
  user: PropTypes.object,
  socket: PropTypes.object
};

export default MessagesPage
