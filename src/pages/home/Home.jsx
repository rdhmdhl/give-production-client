import './Home.css';
// import TimelineFeed from '../../components/feed/TimelineFeed';
import LinksFeed from '../../components/feed/LinksFeed';
import React from 'react';
import PropTypes from 'prop-types';

export default function Home({socket, user}) {

  return (
    <>
      <div className="homeContainer">
        <LinksFeed socket={socket} user={user} />
      </div>
   </>
  )
}

Home.propTypes = {
  socket: PropTypes.object,
  user: PropTypes.object
};