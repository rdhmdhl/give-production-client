import { useEffect, useState, useRef, useContext } from 'react';
import './conversationFeed.css';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import { AuthContext } from '../../context/AuthContext';
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
    // socket, 
    conversationId
}) {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false); // New state variable
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const lastMessageRef = useRef(null);
  // New state to determine if the last message was sent by the user or just loaded
  const [isLastMessageSentByUser, setIsLastMessageSentByUser] = useState(false);
  const [runScrollIntoView, setRunScrollIntoView] = useState(false);
  const { socket_context } = useContext(AuthContext);
  // used for catch blocks
  const popupStaus = async (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  }

  useEffect(() => {
    if (!socket_context) {
      return;
    }
    // Listen for new messages
    const handleNewMessage = (newMessage) => {
      if (newMessage.conversationId === conversationId) {
        setMessages(prevMessages => [ newMessage, ...prevMessages]);
        setIsLastMessageSentByUser(true);
      }
    };

    // socket connection for when users are online
    socket_context.on('new-message', handleNewMessage);

    return () => {
      socket_context.off('new-message', handleNewMessage);
    };
  }, [socket_context, conversationId]);

  useEffect(() => {
    if (!socket_context) {
      return;
    // condition is false, seems to run after the scrollintoview runs 
    // scrollinto view is false after it runs 
    } else if (isLastMessageSentByUser === false) {
      const onInit = () => {
        if (socket_context.recovered && messages.length > 0) {
            // socket connection for when a socket is disconnected
            console.log("socket recoverd in messages feed: ", socket_context.recoverd);
            const lastMessageId = messages[0]._id;
            socket_context.emit('last_message_id', {lastMessageId, conversationId})
        }
      };

      socket_context.on('init', onInit)

      socket_context.on('missed-messages', (missedMessages) => {
        // MISSED MESSAGES, WE NEED THE LAST ONE TO CHECK THE FIRST MESSAGE IN MESSAGES
        if(missedMessages && missedMessages.length > 0 && messages.length > 0 && missedMessages[0]._id !== messages[0]._id) {
          // check to see if the messages sent back 
          // are different than what's in the current messages array
          console.log("missed messages incoming...");
          setMessages(prevMessages => [...missedMessages, ...prevMessages]);
          setIsLastMessageSentByUser(true);
          setRunScrollIntoView(true);
        }
      });

      // socket_context.on('disconnect', reason => {
      //   console.log("socket.on('disconnect') was fired!");
      //   if (reason === 'io server disconnect') {
      //     console.log("reconnecting after 'disconnect' was fired");
      //     // Optionally handle token renewal or other logic here
      //     // socket.connect();
      //     onInit();
      //   }
      // });

      return () => {
        socket_context.off('init');
        socket_context.off('missed-messages');
      };
    }

  }, [socket_context, isLastMessageSentByUser])

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

  useEffect(() => {
    if (lastMessageRef.current && isLastMessageSentByUser) {
      lastMessageRef.current.scrollIntoView({
        behavior: 'smooth', // Optional: Defines the transition animation.
        block: 'end', // Optional: Aligns the element to the bottom of the visible area.
      });
    }
    setIsLastMessageSentByUser(false);
    setRunScrollIntoView(false);
  }, [messages, runScrollIntoView]); // Depend on messages to trigger scroll when it updates.

return (
  <div className='messages-feed-infinite-container' id="messagesInfiniteScroll">
    <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />
      {!allMessagesLoaded ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10rem', marginBottom: '20px' }}>
          <ReactLoading type={'balls'} color={'white'} height={'20%'} width={'20%'} />
        </div>
      ) : (
          <InfiniteScroll
            style={{ display: 'flex', flexDirection: 'column-reverse', width: '100vw'}}
            inverse={true}
            dataLength={messages.length}
            scrollableTarget="messagesInfiniteScroll"
            next={loadMoreMessages}
            hasMore={hasMore}
            page={page}
          >
            {messages.map((m, index) => (
              <Message 
                key={m._id + '-' + index} 
                message={m} 
                ref={index === 0 ? lastMessageRef : null}
                />
            ))}
          </InfiniteScroll>
        )
      }
  </div>
  )
}
MessagesFeed.propTypes = {
  // socket: PropTypes.object,
  conversationId: PropTypes.string,
}