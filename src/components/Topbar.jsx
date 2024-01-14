import "./topbar.css";
// import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import { AiOutlineMenu, AiFillMail, AiFillBell, AiOutlineClose, AiFillSetting } from "react-icons/ai";
import { CiLocationOn } from "react-icons/ci";
import { HiMiniGiftTop } from "react-icons/hi2";
import React, { useEffect, useContext, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import AccountBalanceModal  from "./AccountBalanceModal";
import propTypes from 'prop-types';

import Popup from './popup/Popup';

export default function TopBar({socket}) {
  const {user, balance, updateBalance } = useContext(AuthContext)
  
  const iconRef = useRef(null);

  const navigate = useNavigate();

  const [showPopup, setShowPopup] = useState(false);

  const [showTopbar, setShowTopbar] = useState(false);

  // used to display and error on the popup component
  const [popupMessage, setPopupMessage] = useState(''); 

  // hook to run getBalance function when component mounts
  useEffect(() => { 
    if (user) {
      updateBalance();
    }
  }, [user, updateBalance]);

  // used to get notifications for online users
  useEffect(() => {
    if (socket) {
      try{
        // updating the user's balance
        // should only change when someone gives them currency from a link or post
        updateBalance();

      } catch {
        setPopupMessage("error updating the balance, please try again later.")
      }

    }
  }, [socket]);
  
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


// view dropdown notifications, handle for click outside of dropdown
// useEffect(() => {
//   const handleClickOutside = (event) => {
//     if (
//       dropdownRef.current &&
//       !dropdownRef.current.contains(event.target) &&
//       iconRef.current &&
//       !iconRef.current.contains(event.target)
//     ) {
//       setDropdownVisible(false);
//     }
//   };

//   document.addEventListener("mousedown", handleClickOutside);
//   return () => {
//     document.removeEventListener("mousedown", handleClickOutside);
//   };
// }, []);

// handle for clicking account balance
const [isModalOpen, setIsModalOpen] = useState(false);

const goToNotifications = () => {
  // setDropdownVisible((prevState) => !prevState);
  setShowTopbar(false);
  navigate('/notifications');
};

const toggleTopbar = () => {
  setShowTopbar(prev => !prev)
};

const goToSettings = () => {
  setShowTopbar(false);
  navigate(`/profile/${user.username}/settings`)
};

const goHome = () => {
  navigate('/')
};

const goToProfile = () => {
  setShowTopbar(false);
  navigate(`/profile/${user ? user.username : ''}`)
};

const goToMessages = () => {
  setShowTopbar(false);
  navigate('/conversations');
};


  return (
    <div className='topbarContainer'>
      <div className="toggle-topbar-container">

        {showTopbar ?
          <HiMiniGiftTop style={{display: "hidden", opacity: "0"}}/>
          :
          <HiMiniGiftTop className="home-topbar-icon" onClick={goHome}/>
        }
       
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
                  <img 
                    src={
                      user && user.profilePicture ? 
                      user.profilePicture
                      : "/assets/person/nopicture.png"
                    }
                    alt="No Picture" 
                    className="topbarImg"
                    onClick={goToProfile}
                  />
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


            <div className="notificaitons-container"  onClick={goToNotifications}>
              <p>Notifications</p>
              <div className="notifications-icon-container" ref={iconRef}>
                <AiFillBell className="notification-bell-icon"/>
                {/* set with prop from notifications page */}
              {/* <span className="topbarIconBadge">{unreadNotifications.length}</span> */}
            </div>


      </div>     
      <div className="topbar-messages-container" onClick={goToMessages}>
            <p>Messages</p>
            <div className="messages-icon-container">
              <AiFillMail className="messages-icon"/>
              {/* update with the messages notifications */}
              {/* <span className="message-count-icon">{unreadNotifications.length}</span> */}
            </div>
      </div>
        <div className="topbar-messages-container" onClick={goToSettings}>
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