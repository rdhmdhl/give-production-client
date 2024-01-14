import { useEffect, useState } from 'react';
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

export default function MessagesFeed({
    socket, 
    // user,
    conversationId,
    onMessagesUpdated
}) {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false); // New state variable
  const [initialLoad, setInitialLoad] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');


  // used for catch blocks
  const popupStaus = async (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  }

  useEffect(() => {
    if (!socket) {
      return;
    }

    // Listen for new messages
    const handleNewMessage = (newMessage) => {

      if (newMessage.conversationId === conversationId) {
        setMessages(prevMessages => [ ...prevMessages, newMessage]);
      }
    };
  
    socket.on('new-message', handleNewMessage);
    
    return () => {
      socket.off('new-message', handleNewMessage);
    };

  }, [socket, conversationId])

  useEffect(() => {
    if (messages && messages.length > 0) {
      onMessagesUpdated();
    }
  }, [messages, onMessagesUpdated]);


  const fetchMessages = async () => {
    let res;
    try {
        const token = localStorage.getItem("token");
        // fetch messages
        res = await axios.get(`${config.apiUrl}/messages/${conversationId}?page=${page}`, {
            headers: {
                'x-auth-token': token
            }
        });
      if (res.data.length === 25) {
        setPage(prevPage => prevPage + 1);
        setMessages((messages) => [...res.data, ...messages, 
          ...messages, ]);
        setHasMore(true);
      } if (res.data.length < 25 && res.data.length > 0){
        setMessages((messages) => [...res.data, ...messages]);
        setHasMore(false);
        setAllMessagesLoaded(true);
      } else if (res.data.length === 0 ) { 
        setHasMore(false);
        setAllMessagesLoaded(true);
      }
    } catch (error) {
      await popupStaus("An error occured when fetching messages. Please try again later.")
    }
}


useEffect(() => {
  if (initialLoad) {
    fetchMessages();
    setInitialLoad(false);
  }
}, [hasMore]);



return (
      <div className='messages-feed'>
        <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />
          <div className="feedWrap">
            {!allMessagesLoaded ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10rem', marginBottom: '20px' }}>
                <ReactLoading type={'balls'} color={'white'} height={'20%'} width={'20%'} />
              </div>
            ) : (
              <InfiniteScroll
              className="infinite-scroll-component" style={{ height: 'auto', overflow: 'visible' }}
              dataLength={messages.length}
              next={fetchMessages}
              hasMore={hasMore}
              // loader={
              // <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '20px' }}>
              //   <ReactLoading type={'bars'} color={'#000'} height={'50px'} width={'50px'} />
              //   </div>}
              page={page}
              // TODO --> write a refresh fuction
              // pullDownToRefresh
              // pullDownToRefreshContent={
              //   <h3 style={{textAlign: 'center'}}>&#8595; Pull down to refresh</h3>
              // }
              // releaseToRefreshContent={
              //   <h3 style={{textAlign: 'center'}}>&#8593; Release to refresh</h3>
              // }
              // refreshFunction={this.refresh}
              
              >
            {/* <Share/> */}
            {messages.map((m, index) => (
              <Message key={m._id + '-' + index} message={m} socket={socket}/>
            ))}

            </InfiniteScroll>
            )}
              </div>
          </div>
      )
}

MessagesFeed.propTypes = {
  socket: PropTypes.object,
  conversationId: PropTypes.string,
  user: PropTypes.object,
  onMessagesUpdated: PropTypes.func
};