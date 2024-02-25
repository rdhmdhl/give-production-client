import { useEffect, useState, useRef } from 'react';
import './conversationFeed.css';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
// import { AuthContext } from '../../context/AuthContext';
import React from 'react';
import ReactLoading from 'react-loading';
import PropTypes from 'prop-types';
import config from '../../config';
import Popup from '../popup/Popup';
import Message from '../message/Message';
import '../../pages/conversations/MessagesPage.css';

const PAGE_SIZE = 25;

// Function to fetch messages
const fetchMessages = async (conversationId, page) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${config.apiUrl}/messages/${conversationId}?page=${page}`, {
      headers: {
          'x-auth-token': token
      }
  })
  const data = res.data || [];
  const hasMore = data.length === PAGE_SIZE;
  
  return { messages: data, hasMore }; // Reverse if needed to display in correct order
};

export default function MessagesFeed({
    socket, 
    // user,
    conversationId,
    sendMessage
}) {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false); // New state variable
  // const [initialLoad, setInitialLoad] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const lastMessageRef = useRef(null);
  // used for catch blocks
  const popupStaus = async (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  }

  // After updating messages list
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sendMessage]);

  useEffect(() => {
    if (!socket) {
      return;
    }
    // Listen for new messages
    const handleNewMessage = (newMessage) => {
      if (newMessage.conversationId === conversationId) {
        setMessages(prevMessages => [newMessage, ...prevMessages]);
      }
    };
    socket.on('new-message', handleNewMessage);
    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, conversationId])

  useEffect(() => {
    // Load initial messages for the conversation
    const loadInitialMessages = async () => {
      const { messages: newMessages, hasMore: newHasMore } = await fetchMessages(conversationId, 1);
      setMessages(newMessages);
      setHasMore(newHasMore);
      setAllMessagesLoaded(true);
    };

    setPage(1);
    setMessages([]);
    setHasMore(true);
    loadInitialMessages();
  }, [conversationId]); // Re-load when conversationId changes

  const loadMoreMessages = async () => {
    if (!hasMore) return; // Prevent fetching if no more messages

    try {    
      const nextPage = page + 1;
      const { messages: newMessages, hasMore: newHasMore } = await fetchMessages(conversationId, nextPage);
      
      setMessages((prevMessages) => [...prevMessages, ...newMessages]); // Append new messages
      setPage(nextPage);
      setHasMore(newHasMore);
    } catch {
      await popupStaus("An error occured when fetching messages. Please try again later.")
    }
  };

return (
  <div className='messages-feed-infinite-container' id="messagesInfiniteScroll">
    <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />
      {!allMessagesLoaded ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10rem', marginBottom: '20px' }}>
          <ReactLoading type={'balls'} color={'white'} height={'20%'} width={'20%'} />
        </div>
      ) : (
        <InfiniteScroll
          style={{ height: 'auto', display: 'flex', flexDirection: 'column-reverse' }}
          inverse={true}
          dataLength={messages.length}
          scrollableTarget="messagesInfiniteScroll"
          // scrollThreshold="50%"
          next={loadMoreMessages}
          hasMore={hasMore}
          page={page}
        >
        {messages.map((m, index) => (
          <Message 
            key={m._id + '-' + index} 
            message={m} 
            socket={socket}
            ref={index === messages.length - 1 ? lastMessageRef : null}
            />
        ))}
        </InfiniteScroll>
        )}
  </div>
  )
}
MessagesFeed.propTypes = {
  socket: PropTypes.object,
  conversationId: PropTypes.string,
  user: PropTypes.object,
  sendMessage: PropTypes.func
}