import React, {useEffect, useState} from 'react'
import axios from 'axios';
import { useParams, useLocation, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Post from '../../components/post/Post';
import GiftSection from '../../components/post/GiftSection';
import './SinglePost.css';
import { IoArrowBackOutline } from "react-icons/io5";

export default function SinglePost({socket}) {
    const { postId } = useParams();
    const location = useLocation();
    const [post, setPost] = useState(location.state?.post || {});
    const [givesCounter, setGivesCounter] = useState(0);

  
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`statuses/${postId}`);
                setPost(res.data);
            } catch (error) {
                alert('An errror occured when trying to load this post. Please try again later.');
            }
        }
        fetchPost();
    }, [postId]);

  return (
    <div className='singlePost'>
        <div className="top">
            <Link className='back-icon' to='/'>
            <IoArrowBackOutline />
            </Link>
                
            <h2>Post</h2>
        </div>        
        <Post post={post} socket={socket} onGive={() => setGivesCounter(prev => prev + 1)}/>
        <GiftSection post={post} givesCounter={givesCounter} />
    </div>
  )
  }

  SinglePost.propTypes = {
    post: PropTypes.object,
    socket: PropTypes.object
  }