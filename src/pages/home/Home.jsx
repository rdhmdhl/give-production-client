import './Home.css';
import TimelineFeed from '../../components/feed/TimelineFeed';
import React from 'react';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function Home({socket, user}) {
const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    if (user !== null) {
      setIsLoadingUser(false);
    }
  }, [user]);

  return (
    <>
    {isLoadingUser ? (
      <div>Loading...</div>
    ) : (
      <div className="homeContainer">
        <TimelineFeed socket={socket} user={user} />
      </div>
    )}
  </>
  )
}

Home.propTypes = {
  socket: PropTypes.object,
  user: PropTypes.object
};