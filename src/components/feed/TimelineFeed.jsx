import { useEffect, useState } from 'react';
import Post from '../post/Post'
// import Share from '../share/Share'
import './feed.css';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
// import { AuthContext } from '../../context/AuthContext';
import React from 'react';
import ReactLoading from 'react-loading';
import PropTypes from 'prop-types';
import config from '../../config';
import Popup from '../popup/Popup';

export default function Feed({socket, user}) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false); // New state variable
  const [initialLoad, setInitialLoad] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  
  // used for catch blocks
  const popupStaus = async (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  }

  const fetchPosts = async () => {
    let res;
    try {
      if (user) {
        // fetch posts if user is logged in
        res = await axios.get(`${config.apiUrl}/statuses/timeline/user/${user.username}?page=${page}`);
      } else {
        // fetch posts if user isn't logged in
        res = await axios.get(`${config.apiUrl}/statuses/timeline/public-posts?page=${page}`);
      }

      if (res.data.length === 25) {
        setPage(prevPage => prevPage + 1);
        setPosts((posts) => [...posts, ...res.data]);
        setHasMore(true);
      } if (res.data.length < 25 && res.data.length > 0){
        setPosts((posts) => [...posts, ...res.data]);
        setHasMore(false);
        setAllPostsLoaded(true);
      } else if (res.data.length === 0 ) { 
        setHasMore(false);
      }
    } catch (error) {
      await popupStaus("An error occured when fetching posts. Please try again later.")
    }
};

useEffect(() => {
  if (initialLoad) {
    fetchPosts();
    setInitialLoad(false);
  }
}, [hasMore]);


return (
      <div className='feed'>
        <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />
          <div className="feedWrap">
            {!allPostsLoaded ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10rem', marginBottom: '20px' }}>
                <ReactLoading type={'balls'} color={'white'} height={'20%'} width={'20%'} />
              </div>
            ) : (
              <InfiniteScroll
              dataLength={posts.length}
              next={fetchPosts}
              hasMore={hasMore}
              // loader={
              // <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '20px' }}>
              //   <ReactLoading type={'bars'} color={'#000'} height={'50px'} width={'50px'} />
              //   </div>}
              page={page}
              endMessage={
                <p style={{textAlign: 'center', marginTop: `1rem`, fontWeight: '100'}}>
                  this is the begining :D
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
            {posts.map((p, index) => (
              <Post key={p._id + '-' + index} post={p} socket={socket}/>
            ))}

            </InfiniteScroll>
            )}
              </div>
          </div>
      )
}

Feed.propTypes = {
  username: PropTypes.string, 
  socket: PropTypes.object,
  setIsLoading: PropTypes.bool, 
  user: PropTypes.object
};