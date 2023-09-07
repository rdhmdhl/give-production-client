import React, {useState, useEffect}from 'react'
import './GiftSection.css';
import axios from 'axios';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import GiftSectionItem from './GiftSectionItem';
import config from '../../config';

export default function GiftSection({post, givesCounter}) {
  const [page, setPage] = useState(1);
  const [gifts, setGifts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 25;

  const fetchGifts = async (pageNumber, post) => {
    const res = await axios.get(`${config.apiUrl}/statuses/${post._id}/gives?page=${pageNumber}`);
    const data = res.data || [];

    return { gifts: data };
  };

  // create a function for fetching the latest gift for this post
  // add the latest gift to the top of the comment section
  const fetchLatestGift = async (post) => {
    const res = await axios.get(`${config.apiUrl}/statuses/${post._id}/gives?page=1&limit=1`);
    const data = res.data[0] || null;
  
    return data;
  };

  const loadMore = async(pageNumber) => {
    const {gifts: newGifts } = await fetchGifts(pageNumber, post);

    if(newGifts.length === PAGE_SIZE && givesCounter === 0) {
      setPage(pageNumber + 1);
      setHasMore(true);
    } else {
      setHasMore(false);
    }

    if (givesCounter > 0){
      setGifts(newGifts);
    } else {
      setGifts((prevGifts) => [...prevGifts, ...newGifts]);
    }
  };

  useEffect(() => {
    setPage(1);
    loadMore(1);
  }, []);

  // Fetch the latest gift whenever givesCounter is incremented
  useEffect(() => {
    if (givesCounter > 0) {
      const getLatestGift = async () => {
        const latest = await fetchLatestGift(post);
        setGifts((prevGifts) => [latest, ...prevGifts]);
      };
      getLatestGift();
    }
  }, [givesCounter]);

  return (
    <div className='container'>

        <InfiniteScroll
          dataLength={gifts.length}
          next={() => loadMore(page)}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
          // page={page}
          // endMessage={
          //   <p style={{textAlign: 'center'}}>
          //     <b>...</b>
          //   </p>
          // }
          >

        {gifts.map((g, index) => (
          <GiftSectionItem key={g._id + '-' + index} gifts={g}/>
          ))}
        </InfiniteScroll>
    </div>
  )
}
GiftSection.propTypes = {
  post: PropTypes.object.isRequired,
  givesCounter: PropTypes.number.isRequired
};