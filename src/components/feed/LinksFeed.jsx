import { useEffect, useState } from 'react';
// import Post from '../post/Post'
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
import Link from '../link/Link';

export default function LinksFeed({
    socket, 
    // user
}) {
  const [links, setLinks] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [alllinksLoaded, setAlllinksLoaded] = useState(false); // New state variable
  const [initialLoad, setInitialLoad] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  
  // used for catch blocks
  const popupStaus = async (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  }

  const fetchLinks = async () => {
    let res;
    try {
        // fetch links if user isn't logged in
        res = await axios.get(`${config.apiUrl}/links/all?page=${page}`);
        console.log("res links: ", res);
      if (res.data.length === 25) {
        setPage(prevPage => prevPage + 1);
        setLinks((links) => [...links, ...res.data]);
        setHasMore(true);
      } if (res.data.length < 25 && res.data.length > 0){
        setLinks((links) => [...links, ...res.data]);
        setHasMore(false);
        setAlllinksLoaded(true);
      } else if (res.data.length === 0 ) { 
        setHasMore(false);
        setAlllinksLoaded(true);
      }
    } catch (error) {
      await popupStaus("An error occured when fetching links. Please try again later.")
    }
};

useEffect(() => {
  if (initialLoad) {
    fetchLinks();
    setInitialLoad(false);
  }
}, [hasMore]);


return (
      <div className='feed' style={{backgroundColor: 'rgb(21, 24, 25)'}}>
        <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />
          <div className="feedWrap">
            {!alllinksLoaded ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10rem', marginBottom: '20px' }}>
                <ReactLoading type={'balls'} color={'white'} height={'20%'} width={'20%'} />
              </div>
            ) : (
              <InfiniteScroll
              className="infinite-scroll-component" style={{ height: 'auto', overflow: 'visible' }}
              dataLength={links.length}
              next={fetchLinks}
              hasMore={hasMore}
              // loader={
              // <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '20px' }}>
              //   <ReactLoading type={'bars'} color={'#000'} height={'50px'} width={'50px'} />
              //   </div>}
              page={page}
              endMessage={
                <p style={{textAlign: 'center', margin: `3rem`, fontWeight: '100', color: 'var(--offwhite)'}}>
                  There are no more links availble. Create one for it to show up on the home page. 
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
            {links.map((l, index) => (
              <Link key={l._id + '-' + index} link={l} socket={socket}/>
            ))}

            </InfiniteScroll>
            )}
              </div>
          </div>
      )
}

LinksFeed.propTypes = {
  username: PropTypes.string, 
  socket: PropTypes.object,
  setIsLoading: PropTypes.bool, 
  user: PropTypes.object
};