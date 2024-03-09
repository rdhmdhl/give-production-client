import './Profile.css'
import ProfileFeed from '../../components/feed/ProfileFeed';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { useEffect, useState } from 'react';
import axios from 'axios';
// import {Link} from 'react-router-dom'
import { useParams } from 'react-router';
// import { useContext } from 'react';
// import { AuthContext } from '../../context/AuthContext';
import { PiLinkSimple } from "react-icons/pi";
import config from '../../config';
import React from 'react';

export default function Profile() {
  const [user, setUser] = useState({});
  // const {user: currentUser} = useContext(AuthContext)
  const username = useParams().username;
  const [userActiveLinks, setuserActiveLinks] = useState(0);

  useEffect(() => {
      async function fetchUser(){
        const res = await axios.get(`${config.apiUrl}/api/users?username=${username}`);
        setUser(res.data);

      }

      async function fetchNumberOfActiveLinks(){
        const res = await axios.get(`${config.apiUrl}/links/active-links/${username}`)
        const length = res.data;
        setuserActiveLinks(length);
      }

      fetchNumberOfActiveLinks();
      fetchUser();
    },[username])
    


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
                : "/assets/person/no-profile-pic.webp"} 
              alt="No Profile Picture" />
        </div>
        <div className="profileInfo">
            <h4 className='profileInfoName'>{user.displayName}</h4>
            <span className='profileUserName'>@{user.username}</span>
            <span className='profileInfoDesc'>{user.bio}</span>
            {/* render icon if location exists */}
            {user.location && (
              <div className="locationContainer">
                  <LocationOnOutlinedIcon className='locationIcon'/>
                  <span className='profileLocation'>{user.location}</span>
              </div>
            )}
            <div className="profileGiveData">
                <div className="profileGives"><PiLinkSimple/></div>
                <div className="profileGivesNumber">{userActiveLinks}</div>
            </div>
        </div>
        <hr className='profileHR'/>
    </div>
</div>

<div className="profileFeeds">

  <div className="postsFeed">
    {userActiveLinks > 0 &&
      <ProfileFeed username={username}/>
    }
    {userActiveLinks === 0 &&
      <p className='no-active-links'>Active links will show here</p>
    }
  </div>

</div>

</>
  )
}