import { useEffect, useState } from 'react';
import Post from '../post/Post'
import './givesFeed.css';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import PropTypes from 'prop-types';
import React from 'react';
import config from '../../config';
// *
// GIVESFEED.JSX IS USED ON THE PROFILE PAGE, GIVES TAB
// *

const PAGE_SIZE = 25;

const fetchPosts = async (username, page) => {
  const res = await axios.get(`${config.apiUrl}/gives/${username}?page=${page}`);
  const data = res.data || [];

  const hasMore = data.length === PAGE_SIZE;

  return { posts: data, hasMore };
};

// used on the profile
export default function Feed({username}) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // const {user} = useContext(AuthContext);
  
  const loadMore = async () => {
    const { posts: newPosts, hasMore: newHasMore } = await fetchPosts(username, page + 1);
    
    setPosts((prevPosts) => [...prevPosts, ...newPosts]);
    setHasMore(newHasMore);
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    const loadPosts = async () => {
      const { posts: newPosts, hasMore: newHasMore } = await fetchPosts(username, 1);
      
      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setHasMore(newHasMore);
    };

    setPage(1);
    setPosts([]);
    setHasMore(true);
    loadPosts();
  }, [username]);

// reset scroll position navigating from timeline to profile
useEffect(() => {
  window.scrollTo(0, 0);
}, [username]);
  
  return (
    <div className='gfeed'>
        <div className="feedWrap">
        <InfiniteScroll
        dataLength={posts.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
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
      {posts.map((p, index) => (
        <Post key={p._id + '-' + index} post={p} />
      ))}
      </InfiniteScroll>
        </div>
    </div>
  )
}

Feed.propTypes = {
  username: PropTypes.string.isRequired,
};
