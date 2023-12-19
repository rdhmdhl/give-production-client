import React, { useState, //useRef,//
 useEffect, useContext }from 'react'
import { Link } from 'react-router-dom';
import './Notifications.css';
import {format} from 'timeago.js';
import Popup from '../../components/popup/Popup';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import propTypes from 'prop-types';
import config from '../../config'
function Notifications({socket}) {
    const {user } = useContext(AuthContext)
    // const dropdownRef = useRef(null);
    // previously used to close the notifications window in topbar 
    // const [dropdownVisible, setDropdownVisible] = useState(false);

    const [readNotifications, setReadNotifications] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState([]);
    // State to track which notifications to display
    const [displayingReadNotifications, setDisplayingReadNotifications] = useState(false);
    
    // used to display and error on the popup component
    const [popupMessage, setPopupMessage] = useState(''); 

    const [showPopup, setShowPopup] = useState(false);

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

// function to show popup used in the catch blocks
const popupStatus = async (message) => {
    setPopupMessage(message);
    setShowPopup(true);
    }

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

return (
    <div className='notifications-page-wrapper'>
        
        <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />


            {/* <div className="notificationsDropdown" //ref={dropdownRef}//
            > */}
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

          {/* </div> */}
    </div>
  )
}

Notifications.propTypes = {
    socket: propTypes.object,
}

export default Notifications