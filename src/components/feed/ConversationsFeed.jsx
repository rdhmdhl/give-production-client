import { useEffect, useState } from 'react';
import './conversationFeed.css';
import axios from 'axios';
import React from 'react';
import ReactLoading from 'react-loading';
import PropTypes from 'prop-types';
import config from '../../config';
import Popup from '../popup/Popup';
import Conversation from '../message/Conversation';
export default function ConversationsFeed({
    socket, 
    user
}) {
  const [conversations, setConversations] = useState([]);
  const [allConversationsLoaded, setAllConversationsLoaded] = useState(false); // New state variable
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  // used for catch blocks
  const popupStaus = async (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  }

  const fetchConversations = async () => {
    let res;
    try {
        const token = localStorage.getItem("token");
        // fetch conversations
        res = await axios.get(`${config.apiUrl}/conversations/${user._id}`, {
          headers: {
              'x-auth-token': token
          }
        });
        if(res){
          setConversations(res.data);
          setAllConversationsLoaded(true);
        }
    } catch (error) {
      await popupStaus("An error occured when fetching conversations. Please try again later.")
    }
}

useEffect(() => {
  fetchConversations();
}, [])

return (
  <div className='conversations-feed' style={{backgroundColor: 'rgb(21, 24, 25)'}}>
    <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />
      <div className="feedWrap">
        {!allConversationsLoaded ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10rem', marginBottom: '20px' }}>
            <ReactLoading type={'balls'} color={'white'} height={'20%'} width={'20%'} />
          </div>
        ) : (
          <div className="conversations">
            {conversations.map((c, index) => (
                <Conversation key={c._id + '-' + index} conversation={c} socket={socket}/>
                ))}
              <div style={{ textAlign: 'center', margin: '2rem' }}>
              <p style={{ fontWeight: '100', color: 'var(--gray)' }}>
                We prioritize your security. All messages are encrypted end-to-end for maximum privacy and security.
              </p>
              <br/>
              <p style={{ fontWeight: '100', color: 'var(--gray)' }}>
                Send or receive a gift to start a conversation.
              </p>
            </div>
          </div>
        )}
      </div>
  </div>
  )
}

ConversationsFeed.propTypes = {
  socket: PropTypes.object,
  user: PropTypes.object
};