import { useEffect, useState } from 'react';
import './feed.css';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import React from 'react';
import PropTypes from 'prop-types';
import config from '../../config';
import Link from '../link/Link';

const PAGE_SIZE = 25;

const fetchActiveLinks = async (username, page) => {
  const res = await axios.get(`${config.apiUrl}/links/${username}?page=${page}`);
  const data = res.data || [];

  const hasMore = data.length === PAGE_SIZE;
  
  return { links: data, hasMore };
};




export default function Feed({username}) {
  const [links, setlinks] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  
  const loadMore = async () => {
    const { links: newlinks, hasMore: newHasMore } = await fetchActiveLinks(username, page + 1);
    
    setlinks((prevlinks) => [...prevlinks, ...newlinks]);
    setHasMore(newHasMore);
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    const loadlinks = async () => {
      const { links: newlinks, hasMore: newHasMore } = await fetchActiveLinks(username, 1);
      
      setlinks((prevlinks) => [...prevlinks, ...newlinks]);
      setHasMore(newHasMore);
    };

    setPage(1);
    setlinks([]);
    setHasMore(true);
    loadlinks();
  }, [username]);
  
return (
<div className='feed'>
    <div className="feedWrap">

      <InfiniteScroll
        className="infinite-scroll-component" style={{ height: 'auto', overflow: 'visible' }}
        dataLength={links.length}
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
      {links.map((l, index) => (
        <Link key={l._id + '-' + index} link={l} />
      ))}
      </InfiniteScroll>
  </div>
</div>
)
}

Feed.propTypes = {
  username: PropTypes.string.isRequired,
};