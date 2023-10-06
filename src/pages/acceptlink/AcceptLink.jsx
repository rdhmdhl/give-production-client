import React, {useEffect, useState, useContext} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IoArrowBackOutline } from "react-icons/io5";
import { AuthContext } from '../../context/AuthContext';
import NotificationSender from '../../components/notifications/NotificationSender';
import './AcceptLink.css';
import axios from 'axios';
import config from '../../config';
import PropTypes from 'prop-types';

export default function AcceptLink({ socket }) {
const { linkId } = useParams();
const [link, setLink] = useState({});
const [linkUserData, setlinkUserData] = useState({});
const navigate = useNavigate();
const {user: currentUser} = useContext(AuthContext);
const [isUserLink, setisUserLink] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const { dispatch, user } = useContext(AuthContext);
const [hasUserResponded, setHasUserResponded] = useState(false);

useEffect(() => {
    const fetchLink = async () => {
        try {
            const res = await axios.get(`${config.apiUrl}/api/${linkId}`);
            if (res.data.link.creatorUserId === currentUser._id) {
                // users cannot use their own link
                setisUserLink(true);
            }
            setLink(res.data.link);
            const user = await axios.get(`${config.apiUrl}/api/users?userId=${res.data.link.creatorUserId}`);
            setlinkUserData(user.data);

        } catch (error) {
            alert("An error occured when fetching the link. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }
    // check if current user has responded to the link already
    const fetchLinkTransactions = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.get(`${config.apiUrl}/api/user-respond/${linkId}`, {
                headers: {
                    'x-auth-token': token
                }
            });
            setHasUserResponded(false)

        } catch (error) {
            if (error.response && error.response.status === 400) {
                setHasUserResponded(true);  // User has already responded
            } else {
                alert("An error occurred. Please try again later.");
            }
        }
    }
    fetchLink();
    fetchLinkTransactions();
}, [linkId]);

if(isLoading) {
    return null;
}

const acceptorgive = async () => {
    try {
        const token = localStorage.getItem("token");
        await axios.put(`${config.apiUrl}/api/accept-link/${linkId}`, {}, {
            headers: {
                'x-auth-token': token
            }
        });

        // Update the balance in the context after successfully accepting/giving
        // link creator is receiving from current user
        // don't need to account for 'give' becuase ???
        // TODO:
        if (link.details.giveorreceive === 'receive') {
            dispatch({ type: "UPDATE_BALANCE", payload: 
            user.balance - link.details.amount });
        }

        let receiverUserId = link.creatorUserId;
        let amount = link.details.amount;
        let type = link.details.type;
        let giveorreceive = link.details.giveorreceive;
        let linkorpost = "link";
        let relatedPostId = linkId;
        let message = "interacted with your link"
        let ebItemPhoto = link.details.photo;

        await NotificationSender({
            socket,
            receiverUserId,
            amount,
            linkorpost,
            giveorreceive,
            type, 
            relatedPostId, 
            message,
            ebItemPhoto
        });

        navigate('/');
    } catch (error) {
        alert("An error occured when trying to use this link. Please try again later.");
    }
};

return (
    <div className="link-page-container">
      <div className="top">
        <Link className='back-icon' to='/'>
          <IoArrowBackOutline />
        </Link>
        <h2>Link</h2>
      </div>
  
      {hasUserResponded
        ?
        <div className='own-link-container'>
        <img className="profile-pic" src={linkUserData.profilePicture ? linkUserData.profilePicture : "/assets/person/nopicture.png"}/>
    <h3 className='own-link-message'>... you can`t use this link more than once</h3>
    </div> :
        isUserLink
                ? <div className='own-link-container'>
                        <img className="profile-pic" src={linkUserData.profilePicture ? linkUserData.profilePicture : "/assets/person/nopicture.png"}/>
                    <h3 className='own-link-message'>... you can`t use your own link</h3>
                    </div> 
                : link.details 
                    ? <div className="link-details">
                        <img className="profile-pic" src={linkUserData.profilePicture ? linkUserData.profilePicture : "/assets/person/nopicture.png"}
                        alt="link creator profile picture" />
                        {link.details.type === 'currency' && link.details.quantity > 0 
                            ? (
                                <>
                                    <h3>
                                        {linkUserData.username} 
                                        {link.details.giveorreceive === "give" ? " wants to give you " : " would like "} 
                                        ${link.details.amount}
                                    </h3>

                                    {link.details.giveorreceive === "give" && 
                                        <button className='give-or-accept-button' onClick={() => acceptorgive()}>Accept</button>
                                    }
                                    {link.details.giveorreceive === "receive" && 
                                        <button className='give-or-accept-button' onClick={() => acceptorgive()}>Give</button>
                                    }
                                </>
                            ) 
                            : link.details.type === 'item' && link.details.quantity > 0 
                            ? (
                                <>   
                                    <h3 className='link-creator-and-title'>{linkUserData.username} wants to {link.details.giveorreceive}: {link.details.title}</h3>
                                    <div className="image-quantity-button">
                                    <img src={link.details.photo}/>
                                    <div className="bottom-right-container">
                                        <p className='amount'>${link.details.amount}</p> 
                                        {link.details.giveorreceive === "give" && 
                                            <button className='give-or-accept-button' onClick={() => acceptorgive()}>Accept</button>
                                        }
                                        {link.details.giveorreceive === "receive" && 
                                            <button className='give-or-accept-button' onClick={() => acceptorgive()}>Give</button>
                                        }
                                    </div>
                                    </div>
                                </>
                            )
                            : <p>Link is no longer available.</p>
                        }
                    </div>
                    : <p>Link not found</p> 
            }
    </div>
  )
}

AcceptLink.propTypes = {
    socket: PropTypes.object, 
  };