import './Post.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {format} from 'timeago.js';
import {Link} from 'react-router-dom'
import { useNavigate } from 'react-router';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FiShare, FiMoreHorizontal } from "react-icons/fi";
import { AiOutlineGift } from 'react-icons/ai';
import { BsCurrencyDollar } from "react-icons/bs";
import PropTypes from 'prop-types';
import React from 'react';
import Gift from './Gift';
import SharePostModal from '../post/sharepost/SharePostModal';
import CurrencyList from './CurrencyList';
import config from '../../config';

export default function Post({post, onGive, socket}) {
  
  const [itemGives, setItemGives] = useState(0);
  const [amount, setAmount] = useState(0);
  const [userGaveItem, setUserGaveItem] = useState(false);
  const [userGaveCurrency, setUserGaveCurrency] = useState(false);
  const [user, setUser] = useState({});
  const {user: currentUser} = useContext(AuthContext);

  // lower opacity for posts with disabled allowGifts setting
  // const disabledStyle = { opacity: 0.35 };
  // // highlight colors if a post is gave to by current user
  // const highlightGreen = { color: 'rgb(5, 255, 47)' };
  // const highlightPurple = { color: 'rgb(155, 5, 255)' };

  // share post logic
  const [isModalOpen, setIsModalOpen] = useState(false);
  const postUrl = `/${post._id}`;

  // used for redirecting to single post
  const navigate = useNavigate();

  const navigateToSinglePost = () => {
    navigate(`/${post._id}`, { state: { post } });
  };

// get user
  useEffect(() => {
    async function fetchUser(){
      const res = await axios.get(`${config.apiUrl}/api/users?userId=${post.userId}`);
      setUser(res.data)
    }
    fetchUser();
  },[post.userId])

  // get amount from status
  useEffect(() => {
    async function fetchAmount(){
      try {
        let body = {};
        if (currentUser && currentUser._id) {
          body = { userId: currentUser._id };
        }
        // get posts by post id
        const res = await axios.get(`${config.apiUrl}/statuses/${post._id}/gaveamount`, {
          params: body
        });

        setAmount(res.data.currencyAmount);
        setItemGives(res.data.itemCount);

        // check if a user gave to the post
        // then use it to conditionally render highlighted icon color
        setUserGaveCurrency(res.data.userGaveCurrency);
        setUserGaveItem(res.data.userGaveItem);
      } catch (error) {
        alert('An error occurred when trying to fetch post data. Please try again later.')
      }
    }
    fetchAmount();  
},[post._id])

  // run a function to highlight the icon immediately after giving to a post
  const [changeCurrencyColor, setChangeCurrencyColor] = useState(false);
  const [changeItemIconColor, setChangeItemIconColor] = useState(false);

  useEffect(() => {
    async function changeIconColor(){
      if (changeItemIconColor) {
        setUserGaveItem(true);
      } else if (changeCurrencyColor) {
        setUserGaveCurrency(true);
      }
    }
    changeIconColor();
  }, [changeCurrencyColor,changeItemIconColor])

  // use state for currency amounts popup
  const [seenGifts, setseenGifts] = useState(false);
  const [seenMoney, setSeenMoney] = useState(false);

  // function for popup
  const toggleGift = (event) => {
    event.stopPropagation();
    setseenGifts(!seenGifts);
    setSeenMoney(false); // Hide the other component
  };

  // function for popup
  const toggleAmounts = (event) => {
    event.stopPropagation();
    setSeenMoney(!seenMoney);
    setseenGifts(false); // Hide the other component
  };

  return (
    
    
    <div className='post linktosinglepost' onClick={navigateToSinglePost}>
        <div className="postWrapper">
            <Link 
            to={`/profile/${user.username}`}
            onClick={(event) => event.stopPropagation()}
            >
              <img className='postProfileImg' src={user.profilePicture ? user.profilePicture : "./assets/person/nopicture.png"} alt="" />
            </Link>
            <div className="postTop">
                <div className="postTopLeft">
                    <span className="postUsername">{user.username}</span>
                    <span className="postDate">{format(post.createdAt)}</span>
                </div>
                <div className="postTopRight">
                <FiMoreHorizontal/>
                </div>
            </div>
            
            <div className="postCenter">
              <span className="postText">{post.desc}</span>
              {post.img && (
                <img src={post.img} className="postImg" alt="" />
              )}
                {/* give amounts below post text, does not display for current user's post*/}
                {currentUser && currentUser._id !== post.userId && seenMoney && post.allowGifts &&
                <CurrencyList 
                  socket={socket}
                  post={post}  
                  setAmount={setAmount} 
                  currentUser={currentUser} 
                  onClick={(event) => event.stopPropagation()}
                  onGive={onGive}
                  setChangeCurrencyColor={setChangeCurrencyColor}
                />}

                {currentUser && currentUser._id !== post.userId && post.allowGifts ? (
                <div className='browseGifts' style={{display: seenGifts ? 'flex' : 'none'}}>
                  <Gift 
                  socket={socket}
                  post={post} 
                  setItemGives={setItemGives} 
                  onClick={(event) => event.stopPropagation()}
                  onGive={onGive}
                  setChangeItemIconColor={setChangeItemIconColor}
                  />
                </div>
                ) : null}
            </div>
            <div className="postBottom">

              <div className={`amountGave-container ${post.allowGifts ? '' : 'disabled'}`} >
              <BsCurrencyDollar 
                className={`currentcy-icon ${post.allowGifts && userGaveCurrency ? 'highlight-green' : ''}`} 
                onClick={(event) => toggleAmounts(event)}
              />
                <span className={`amountGave ${post.allowGifts && userGaveCurrency ? 'highlight-green' : ''}`}>{amount}</span>
              </div>

              <div className={`gifts-container ${post.allowGifts ? '' : 'disabled'}`}>

              <AiOutlineGift 
                className={`gifts-icon ${post.allowGifts && userGaveItem ? 'highlight-purple' : ''}`} 
                onClick={(event) => toggleGift(event)}
              />
                <span className={`gives ${post.allowGifts && userGaveItem ? 'highlight-purple' : '' }`}>{itemGives}</span>
              </div>

              <div className="share-icon" onClick={(event) => event.stopPropagation()}>
                <FiShare onClick={() => setIsModalOpen(true)}/>
                <SharePostModal
                isOpen={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
                postUrl={postUrl}
                />
              </div>
            </div>
        </div>
    </div>
  )
}
Post.propTypes = {
  post: PropTypes.object.isRequired,
  onGive: PropTypes.func,
  socket: PropTypes.object,
};