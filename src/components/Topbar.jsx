import "./topbar.css";
// import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import { AiOutlineMenu, AiFillMail, AiFillBell, AiOutlineClose, AiFillSetting } from "react-icons/ai";
import { CiLocationOn } from "react-icons/ci";
import React, { useEffect, useContext, useRef, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {format} from 'timeago.js';
import AccountBalanceModal  from "./AccountBalanceModal";
import propTypes from 'prop-types';
import axios from 'axios';
import config from '../config'
import Popup from './popup/Popup';

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
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState(''); 
  const [showTopbar, setShowTopar] = useState(false);

  // function to show popup used in the catch blocks
  const popupStatus = async (message) => {
  setPopupMessage(message);
  setShowPopup(true);
}

  // hook to run getBalance function when component mounts
  useEffect(() => { 
    if (user) {
      updateBalance();
    }
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
        const { senderUserId, receiverUserId, linkorpost, relatedPostId, amount, type, read, createdAt, ebItemPhoto, ebItemTitle, message } = data;
        
        // updating the user's balance
        // should only change when someone gives them currency from a link or post
        updateBalance();
        
        setUnreadNotifications((prev) => [
          {
            senderUserId,
            receiverUserId,
            linkorpost,
            relatedPostId,
            amount,
            type,
            read,
            createdAt,
            ebItemPhoto,
            ebItemTitle,
            message
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
          popupStatus("Could not load notifications at this time. Please try again later.", "Close")
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
      await popupStatus("An error occurred when trying to mark notifications read. Please try again later.", "Close")
    }
  };

    // Function to determine the destination URL
const getDestinationURL = (notification) => {
  if (notification.linkorpost === "link") {
    return `/link/${notification.relatedPostId}`;
  } else if (notification.linkorpost === "post") {
    return `/${notification.relatedPostId}`;
  }
  return "/"; // default URL if none match
};


const toggleTopbar = () => {
  setShowTopar(prev => !prev)
}


  return (
    <div className='topbarContainer'>
      <div className="toggle-topbar-container">
        {showTopbar ?
        <AiOutlineClose className="show-topbar-icon" onClick={toggleTopbar}/>
        :
        <AiOutlineMenu className="show-topbar-icon" onClick={toggleTopbar}/>
        }
      </div>

      <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />

        <div className={`topbar-left-container ${showTopbar ? 'visible' : 'hidden'}`} >


          <div className="topbar-left-content-wrapper">
            <div className="top-row-container">
              <div className="profile-photo-container">
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

                {user && (
                <>
                <p className="username-type">{user.username}</p>
                <div className="location-container">
                  <p className="location-type">{user.location}</p>
                  <CiLocationOn className="location-icon"/>
                </div>
                </>
                )}
              </div>
            </div>


            <div className="notificaitons-container">
              <p>Notifications</p>
              <div className="notifications-icon-container" onClick={handleDropdownClick} ref={iconRef}>
                <AiFillBell className="notification-bell-icon"/>
              <span className="topbarIconBadge">{unreadNotifications.length}</span>
            </div>

     {/* dropdown notifications */}

          {dropdownVisible && (
            <div className="notificationsDropdown" ref={dropdownRef}>
              {/* New button to switch between displaying read and unread notifications */}
                 <div className="notification-buttons-container">

                    {/* unread or read notifications button*/}
                    <div className="unread-read-button-container">
                    <button className="undread-read-button" onClick={switchNotificationsDisplay}>
                      {displayingReadNotifications ? 'Show Unread Notifications' : 'Show Read Notifications'}
                    </button>
                    </div>
                    {/* mark as read button */}
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
              {notificationsToDisplay
               .slice() // Create a shallow copy of the notifications array to avoid mutating the original array
               .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort notifications by createdAt in descending order
               .map((notification, index) => (
                <div key={index}>
                    <Link to={getDestinationURL(notification)}>
                      <div className="notificationDetails">
                        <div className="senderandamount">
                        <img className="profilePhoto" src={`${process.env.PUBLIC_URL}/assets/person/nopicture.png`} alt="Anonymous user" />
                          <div className="senderandtitle">
                            <span className="notificationSender">
                              {/* {notification.senderUserId} */}
                              Anonymous User
                            </span>
                            {notification.message && (
                              <span className="notification-message">
                                {notification.message}
                              </span>
                            )}
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
                    </Link>

                </div>
                ))}

          </div>
          )
          }
      </div>     
      <div className="messages-container">
            <p>Messages</p>
            <div className="messages-icon-container">
              <AiFillMail className="messages-icon"/>
              <span className="message-count-icon">{unreadNotifications.length}</span>
            </div>
      </div>
      <div className="messages-container">
            <p>Settings</p>
            <div className="messages-icon-container">
              <AiFillSetting className="messages-icon"/>
            </div>
      </div>
      <hr className="bottom-line"/>
      <div className="account-balance-container" >
                <p>Balance:</p>
                <p onClick={handleAccountBalanceClick}>${balance.toFixed(2)}</p>
                <AccountBalanceModal
                  isModalOpen={isModalOpen}
                  closeModal={() => setIsModalOpen(false)}
                  balance={balance}
                />
      </div>
    </div>
  </div>  
</div>
  )
}

TopBar.propTypes = {
  socket: propTypes.object,
}