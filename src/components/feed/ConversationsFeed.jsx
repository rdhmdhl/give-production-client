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
import Conversation from '../message/Conversation';

export default function ConversationsFeed({
    socket, 
    user
}) {
  const [conversations, setConversations] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allConversationsLoaded, setAllConversationsLoaded] = useState(false); // New state variable
  const [initialLoad, setInitialLoad] = useState(true);
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
        // fetch conversations
        res = await axios.get(`${config.apiUrl}/conversations/${user._id}?page=${page}`);
        console.log("res conversations: ", res);

      if (res.data.length === 25) {
        setPage(prevPage => prevPage + 1);
        setConversations((conversations) => [...conversations, ...res.data]);
        setHasMore(true);
      } if (res.data.length < 25 && res.data.length > 0){
        setConversations((conversations) => [...conversations, ...res.data]);
        setHasMore(false);
        setAllConversationsLoaded(true);
      } else if (res.data.length === 0 ) { 
        setHasMore(false);
        setAllConversationsLoaded(true);
      }
    } catch (error) {
      await popupStaus("An error occured when fetching conversations. Please try again later.")
    }
};

useEffect(() => {
  if (initialLoad) {
    fetchConversations();
    setInitialLoad(false);
  }
}, [hasMore]);


return (
      <div className='conversations-feed' style={{backgroundColor: 'rgb(21, 24, 25)'}}>
        <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />
          <div className="feedWrap">
            {!allConversationsLoaded ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10rem', marginBottom: '20px' }}>
                <ReactLoading type={'balls'} color={'white'} height={'20%'} width={'20%'} />
              </div>
            ) : (
              <InfiniteScroll
              className="infinite-scroll-component" style={{ height: 'auto', overflow: 'visible' }}
              dataLength={conversations.length}
              next={fetchConversations}
              hasMore={hasMore}
              // loader={
              // <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '20px' }}>
              //   <ReactLoading type={'bars'} color={'#000'} height={'50px'} width={'50px'} />
              //   </div>}
              page={page}
              endMessage={
                <p style={{textAlign: 'center', margin: `3rem`, fontWeight: '100', color: 'var(--offwhite)'}}>
                  Send or receive a gift to start a conversation. 
                </p>
              }
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
            {conversations.map((c, index) => (
              <Conversation key={c._id + '-' + index} conversation={c} socket={socket}/>
            ))}

            </InfiniteScroll>
            )}
              </div>
          </div>
      )
}

ConversationsFeed.propTypes = {
  socket: PropTypes.object,
  user: PropTypes.object
};