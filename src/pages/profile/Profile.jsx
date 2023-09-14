import './Profile.css'
import ProfileFeed from '../../components/feed/ProfileFeed';
import GivesFeed from '../../components/feed/GivesFeed';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom'
import { useParams } from 'react-router';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { AiOutlineGift } from 'react-icons/ai';
import { BsCurrencyDollar } from "react-icons/bs";
import config from '../../config';
import React from 'react';

export default function Profile() {
  const [user, setUser] = useState({});
  const {user: currentUser} = useContext(AuthContext)
  const username = useParams().username;
  const [userItemGives, setUserItemGives] = useState(0);
  const [userCurrencyGiveTotal, setuserCurrencyGiveTotal] = useState(0);

  useEffect(() => {
      async function fetchUser(){
        const res = await axios.get(`${config.apiUrl}/api/users?username=${username}`);
        setUser(res.data);
      }
      fetchUser();
    },[username])

  // useState hook for hidding the post give amounts on user posts
  const [isHidden, setIsHidden] = useState(false); 
      
  // Method to check if the current user is the author of the post
  // and hide the div if they are not
  const checkUser = useCallback(() => {
    if (currentUser.username !== user.username) {
      setIsHidden(false);
    } else {
      setIsHidden(true)
    }
  }, [currentUser.username, user.username]);

  // Use the useEffect hook to call the checkUser method
  // when the userId props change
  useEffect(() => {
    checkUser();
  }, [currentUser._id, checkUser]);

  // set the underline to posts or gives on profile 
  const [isUnderlined, setIsUnderlined] = useState(true);

  // slide to gives feed
  const [givesState, setGivesState] = useState(false);
  const hasToggled = () => {
      setGivesState(true);
      setIsUnderlined(false);
  };

  const resetHasToggled = () => {
    setGivesState(false);
    setIsUnderlined(true);
  };

  let toggleGivesFeed = givesState ? ' active' : '';

  // resets toggle gives feed on reload
  useEffect(() => {
    resetHasToggled();
  }, [username]);

  // fetch user give data, for the profileGivesNumber and profileAmountGaveNumber
  useEffect(() => {
    async function giveData(){
      const res = await axios.get(`${config.apiUrl}/user-gives/${username}`);
      setUserItemGives(res.data.totalItemsGave);
      setuserCurrencyGiveTotal(res.data.totalCurrencyGave);
    }
    giveData();
  }, [username]);

  return (
    <>
<div className="profile">
    <div className="profiletopCenter">
        <div className="profileCover">
            <img className='profileCoverImg' 
              src={
                user.coverPicture 
                ? user.coverPicture 
                : "/assets/person/nocover.png"} 
              alt="No Profile Cover Photo" />

            <img 
              className='profileUserImg' 
              src={
                user.profilePicture
                ? user.profilePicture 
                : "/assets/person/nopicture.png"} 
              alt="No Profile Picture" />
        
            <Link to={`/profile/${user.username}/settings`} >
           <span className="profileSettings" style={{display: isHidden ? 'flex' : 'none'}} >Edit Profile</span>
            </Link>
        </div>
        <div className="profileInfo">
            <h4 className='profileInfoName'>{user.displayName}</h4>
            <span className='profileUserName'>{user.username}</span>
            <span className='profileInfoDesc'>{user.bio}</span>
            {/* render icon if location exists */}
            {user.location && (
              <div className="locationContainer">
                  <LocationOnOutlinedIcon className='locationIcon'/>
                  <span className='profileLocation'>{user.location}</span>
              </div>
            )}
            <div className="profileGiveData">
                <div className="profileGives"><AiOutlineGift/></div>
                <div className="profileGivesNumber">{userItemGives}</div>

                <div className="profileAmountGave"><BsCurrencyDollar/></div>
                <div className="profileAmountGaveNumber">{userCurrencyGiveTotal}</div>
            </div>
        </div>
            <div className="profilePostsAndGives">
                <span 
                  style={{ textDecoration: isUnderlined ? 'underline' : 'none' }}
                  className="userPosts"
                  onClick={resetHasToggled}
                  >Posts
                </span>

                <span 
                  style={{ textDecoration: isUnderlined ? 'none' : 'underline' }}
                  className='userGives'
                  onClick={hasToggled}
                  >Gives
                </span>
            </div>
        <hr className='profileHR'/>
    </div>
</div>

<div className="profileFeeds">

  <div className={`postsFeed${toggleGivesFeed}`}>
    <ProfileFeed username={username} />
  </div>
  <div className={`givesFeed${toggleGivesFeed}`}>
    <GivesFeed username={username} />
  </div>

</div>

</>
  )
}