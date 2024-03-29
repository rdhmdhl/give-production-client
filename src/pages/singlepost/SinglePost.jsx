import React, {useEffect, useState} from 'react'
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Post from '../../components/post/Post';
import GiftSection from '../../components/post/GiftSection';
import './SinglePost.css';
import { IoArrowBackOutline } from "react-icons/io5";
import config from '../../config';
import Popup from '../../components/popup/Popup';

export default function SinglePost({socket}) {
    const { postId } = useParams();
    const [post, setPost] = useState({});
    const [givesCounter, setGivesCounter] = useState(0);
    const [isLoading, setIsLoading] = useState(true); 
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState(''); 
  
    // function to show popup used in the catch blocks
    const popupStatus = async (message) => {
      setPopupMessage(message);
      setShowPopup(true);
    }

    useEffect(() => {
        const fetchPost = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${config.apiUrl}/statuses/${postId}`);
                setPost(res.data);
            } catch (error) {
                popupStatus('An errror occured when trying to load this post. Please try again later.', "Close")
            }
            setIsLoading(false);
        }
        fetchPost();
    }, [postId]);

    if (isLoading) {
        return <div>Loading...</div>; // Or any other loading indicator
      }

  return (
    <div className='singlePost'>
      <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />
        <div className="top">
            <Link className='back-icon' to='/'>
            <IoArrowBackOutline />
            </Link>
                
            <h2>Post</h2>
        </div>        
      {post && <Post post={post} socket={socket} onGive={() => setGivesCounter(prev => prev + 1)} />}
      {post && <GiftSection post={post} givesCounter={givesCounter} />}
    </div>
  )
  }

  SinglePost.propTypes = {
    post: PropTypes.object,
    socket: PropTypes.object
  }