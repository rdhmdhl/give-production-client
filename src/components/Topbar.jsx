import "./topbar.css";
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import React, { useEffect, useContext, useRef, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {format} from 'timeago.js';
import AccountBalanceModal  from "./AccountBalanceModal";
import propTypes from 'prop-types';
import axios from 'axios';
import config from '../config'

export default function TopBar({socket}) {
  const {user, balance, updateBalance } = useContext(AuthContext)
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const iconRef = useRef(null);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  // State to track which notifications to display
  const [displayingReadNotifications, setDisplayingReadNotifications] = useState(false);
  const navigate = useNavigate();

  // hook to run getBalance function when component mounts
  useEffect(() => { 
    updateBalance();
  }, [user, updateBalance]);

  // Event handler for clicking on the account balance
  const handleAccountBalanceClick = () => {
    if (!user || !user.username) {
      // User is not logged in, navigate to the login page
      navigate('/login');
    } else {
      // User is logged in, handle the logic for showing the account balance modal
      setIsModalOpen(true);
    }
  };

  // New function to switch which notifications are displayed when the button is clicked
  const switchNotificationsDisplay = () => {
    setDisplayingReadNotifications(prevState => !prevState);
  };

  // Determine which notifications to display based on the state variable
  const notificationsToDisplay = displayingReadNotifications ? readNotifications : unreadNotifications;

  // used to get notifications for online users
  useEffect(() => {
    if (socket) {
      const handleGetNotification = (data) => {
        const { senderUserId, receiverUserId, relatedPostId, amount, type, read, createdAt, ebItemPhoto, ebItemTitle } = data;
        setUnreadNotifications((prev) => [
          {
            senderUserId,
            receiverUserId,
            relatedPostId,
            amount,
            type,
            read,
            createdAt,
            ebItemPhoto,
            ebItemTitle
          },
          ...prev,
        ]);
      };
  
      socket.on("getNotification", handleGetNotification);
  
      // Cleanup function
      return () => {
        socket.off("getNotification", handleGetNotification);
      };
    }
  }, [socket]);
  
  // Retrieve the user's notifications from the database
  useEffect(() => {
    if (user && user._id) {
      axios.get(`${config.apiUrl}/api/notifications/${user._id}`)
      .then((response) => {
        if (response.data.length > 0) {
          const unread = response.data.filter((notification) => notification.read == false);
          const read = response.data.filter((notification) => notification.read == true);

          setUnreadNotifications(unread);
          setReadNotifications(read);
        }
        })
        .catch(() => {
          alert("Failed to load notifications. Please try again later.");
        });
    }
  }, [user]);

// view dropdown notifications, handle for click outside of dropdown
useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      iconRef.current &&
      !iconRef.current.contains(event.target)
    ) {
      setDropdownVisible(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

// handle for clicking account balance
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDropdownClick = () => {
    setDropdownVisible((prevState) => !prevState);
  };

  const markAsRead = async () => {
    try {
      // mark notifications as read in database
      await axios.put(`${config.apiUrl}/api/read-notifications/${user._id}`)
      
      // get notifications from database
      const response = await axios.get(`${config.apiUrl}/api/notifications/${user._id}`);

      // filter notifications by read status
      const unread = response.data.filter((notification) => notification.read == false);
      const read = response.data.filter((notification) => notification.read == true);
      
      // update state
      setUnreadNotifications(unread);
      setReadNotifications(read);
    } catch (error) {
      alert('An error occurred when trying to mark notifications read. Please try again later.')
    }
  };

  return (
    <div className='topbarContainer'>
        <div className="topbarLeft">
          <Link to='/' style={{textDecoration: 'none'}}>
          <span className="logo">G_VE</span>
          </Link>
        </div>
        <div className="topbarRight" >
          <div className="account-balance" >
            <p onClick={handleAccountBalanceClick}>${balance.toFixed(2)}</p>
            <AccountBalanceModal
              isModalOpen={isModalOpen}
              closeModal={() => setIsModalOpen(false)}
              balance={balance}
            />
          </div>

          <div className="topbarIcons">
            <div className="topbariconItem" onClick={handleDropdownClick} ref={iconRef}>
              <CircleNotificationsIcon />
              <span className="topbarIconBadge">{unreadNotifications.length}</span>
          </div>

     {/* dropdown notifications */}
          {dropdownVisible && (
            <div className="notificationsDropdown" ref={dropdownRef}>
              {/* New button to switch between displaying read and unread notifications */}
              <div className="unread-read-button-container">
              <button className="undread-read-button" onClick={switchNotificationsDisplay}>
                {displayingReadNotifications ? 'Show Unread Notifications' : 'Show Read Notifications'}
              </button>
              </div>
              {notificationsToDisplay
               .slice() // Create a shallow copy of the notifications array to avoid mutating the original array
               .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort notifications by createdAt in descending order
               .map((notification, index) => (
                <div key={index}>
                    <div className="notificationDetails">
                      <div className="senderandamount">
                      <img className="profilePhoto" src={`${process.env.PUBLIC_URL}/assets/person/nopicture.png`} alt="Anonymous user" />
                        <div className="senderandtitle">

                          <span className="notificationSender">
                            {/* {notification.senderUserId} */}
                            Anonymous User
                          </span>

                          {notification.type === 'item' && (
                          <span className="notificationItemTitle">
                            {notification.ebItemTitle}
                          </span>
                          )}
                          
                          <span className="notificationDate">
                            {format(notification.createdAt)}
                          </span>
                          
                        </div>  

                    <span className="notificationAmount">
                      {notification.type === 'currency'
                        ? (
                          <div className="currency-box">
                            {`$${notification.amount}`}
                          </div>
                        )
                        : notification.type === 'item'
                        ? (
                            <img src={notification.ebItemPhoto} alt="Item" />
                        )
                        : ''}
                    </span>
                      </div>
                  </div>
                </div>
                ))}
                {unreadNotifications.length > 0 && !displayingReadNotifications &&
                <div className="mark-as-read-container">
                  <div className="button-container">
                  <button className="mark-as-read-button" onClick={markAsRead}>
                    Mark all read
                  </button>
                  </div>
                </div>
                }
          </div>
          )
          }
      </div>     
      <Link to={`/profile/${user ? user.username : ''}`}>
        <img 
          src={
            user && user.profilePicture ? 
            user.profilePicture
            : "/assets/person/nopicture.png"
          }
          alt="No Picture" 
          className="topbarImg"
        />
      </Link>
        </div>
    </div>
  )
}

TopBar.propTypes = {
  socket: propTypes.object,
}