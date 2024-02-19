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
import '../../pages/conversations/MessagesPage.css';

export default function MessagesFeed({
    socket, 
    // user,
    conversationId,
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

  const fetchMessages = async () => {
    let res;
    console.log("fetch messages running ...");
    try {
        const token = localStorage.getItem("token");
        // fetch messages
        res = await axios.get(`${config.apiUrl}/messages/${conversationId}?page=${page}`, {
            headers: {
                'x-auth-token': token
            }
        });
      // reverse the order of the messages, to display newest at the bottom
      const reversedData = res.data;
      if (res.data.length === 25) {
        setPage(prevPage => prevPage + 1);
        setMessages((messages) => [...reversedData, ...messages]);
        console.log("reversed Data.len = 25: ", reversedData);
        setHasMore(true);
        setAllMessagesLoaded(true);
      } if (res.data.length < 25 && res.data.length > 0){
        setMessages((messages) => [...messages, ...reversedData, ]);
        console.log("reversed Data.len < 25 and > 0: ", reversedData);
        setHasMore(false);
        setAllMessagesLoaded(true);
      } else if (res.data.length === 0 ) { 
        console.log("no messages left ?");
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
      <div className='messages-feed-infinite-container' id="messagesInfiniteScroll" onScroll={() => console.log('Scrolling...')}>
        <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />
            {!allMessagesLoaded ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10rem', marginBottom: '20px' }}>
                <ReactLoading type={'balls'} color={'white'} height={'20%'} width={'20%'} />
              </div>
            ) : (
              <InfiniteScroll
              style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse' }}
              inverse={true}
              dataLength={messages.length}
              scrollableTarget="messagesInfiniteScroll"
              // scrollThreshold="30%"
              next={fetchMessages}
              hasMore={hasMore}
              loader={<p>loading more messages</p>}
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
      )
}

MessagesFeed.propTypes = {
  socket: PropTypes.object,
  conversationId: PropTypes.string,
  user: PropTypes.object,
};