import { useContext, useEffect, useState } from 'react';
import Post from '../post/Post'
// import Share from '../share/Share'
import './feed.css';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import { AuthContext } from '../../context/AuthContext';
import React from 'react';
import ReactLoading from 'react-loading';
import PropTypes from 'prop-types';

export default function Feed({socket}) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const {user} = useContext(AuthContext);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false); // New state variable


  const fetchPosts = async () => {
    let res;

    try {
      if (!user || !user.username) {
        // fetch posts if no user is logged in
        res = await axios.get(`statuses/timeline/public-posts?page=${page}`);
      } else {
        // fetch posts if user is logged in
        res = await axios.get(`statuses/timeline/user/${user.username}?page=${page}`);
      }
      if (res.data.length === 25) {
        setPage(prevPage => prevPage + 1);
        setPosts((posts) => [...posts, ...res.data]);
        setHasMore(true);
        if(page === 1 && res.data.length <= 25) {
          setAllPostsLoaded(true);
        }
      } else if (res.data.length < 25 && res.data.length > 0){
        setPosts((posts) => [...posts, ...res.data]);
        setHasMore(false);
      } else if (res.data.length === 0 ) { 
        setHasMore(false);
      }

    } catch (error) {
      alert("An error occured when fetching posts. Please try again later.");
    }
};


useEffect(() => {
  fetchPosts();
},[hasMore]);


return (
  
      <div className='feed'>
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
              <p style={{textAlign: 'center'}}>
                <b>Nothing left to see here!</b>
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