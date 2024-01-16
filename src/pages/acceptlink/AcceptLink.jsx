import React, {useEffect, useState, useContext} from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import NotificationSender from '../../components/notifications/NotificationSender';
import './AcceptLink.css';
import axios from 'axios';
import config from '../../config';
import PropTypes from 'prop-types';
import Popup from '../../components/popup/Popup';

export default function AcceptLink({ socket }) {
const { linkId } = useParams();
const [link, setLink] = useState({});
const [linkUserData, setlinkUserData] = useState({});
const navigate = useNavigate();
const {user: currentUser, updateBalance} = useContext(AuthContext);
const [isUserLink, setisUserLink] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const [hasUserResponded, setHasUserResponded] = useState(false);
const [showPopup, setShowPopup] = useState(false);
const [popupMessage, setPopupMessage] = useState('');

const popupStatus = async (message) => {
  setPopupMessage(message);
  setShowPopup(true);
}

useEffect(() => {
    const fetchLink = async () => {
        try {
            const res = await axios.get(`${config.apiUrl}/links/${linkId}`);
            if (res.data.link.creatorUserId === currentUser._id) {
                // users cannot use their own link
                setisUserLink(true);
            }
            setLink(res.data.link);
            const user = await axios.get(`${config.apiUrl}/api/users?userId=${res.data.link.creatorUserId}`);
            setlinkUserData(user.data);

        } catch (error) {
            await popupStatus("An error occurred when searching for an item. Please try again later.")
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
                await popupStatus("An error occurred. Please try again later.")
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
        let receiverUserId = link.creatorUserId;
        let amount = link.details.amount;
        let type = link.details.type;
        let giveorreceive = link.details.giveorreceive;
        let linkorpost = "link";
        let relatedPostId = linkId;
        let message = "interacted with your link"
        let ebItemPhoto = link.details.photo;
        let lastMessage;

        if (link.details.type === "currency") {
            if (giveorreceive === "give") {
                lastMessage = `User gave you $${amount}`;
            }
            else {
                lastMessage = `You gave user $${amount}`
            }
        } else {
            if (giveorreceive === "give") {
                lastMessage = `User gave you ${link.details.title}`
            } else { 
                lastMessage = `You gave user ${link.details.title}`
            }
        }

        // accepts link and update's both of the user's balances on the server
        // also creates a conversation between the two users if there is not one already
        // if conversation already exists, it updates the last message in the convo
        let res = await axios.put(`${config.apiUrl}/api/accept-link/${linkId}`, {
            'lastMessage': lastMessage
        }, {
            headers: {
                'x-auth-token': token
            }
        });
            // update context to call the latest user balance
            // so that the ui matches the server data
            updateBalance()
    
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

            navigate(`/messages/${res.data.conversationId}`);
        
    } catch (error) {
        await popupStatus("An error occured when trying to use this link. Please try again later.", "Close")
        console.log("error from accept link: ", error);
    }
}

return (
    <div className="link-page-container">
        <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />
  
      {hasUserResponded
        ?
        <div className='own-link-container'>
        <img className="profile-pic" src={currentUser.profilePicture ? currentUser.profilePicture : "/assets/person/nopicture.png"}/>
    <h3 className='own-link-message'>... you can`t use this link more than once</h3>
    </div> :
        isUserLink
                ? <div className='own-link-container'>
                        <img className="profile-pic" src={linkUserData.profilePicture ? linkUserData.profilePicture : "/assets/person/nopicture.png"}/>
                    <h3 className='own-link-message'>... you can`t use your own link</h3>
                    </div> 
                : link.details 
                    ? <div className="link-details">
                        {link.details.type === 'currency' && link.details.quantity > 0 
                            ? (
                                <>
                                    <h3 className='link-title-and-details'>
                                        User 
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
                                    <div className="image-description-amount">

                                        <div className="image-amount-container">
                                            <img src={link.details.photo}/>
                                            <div className="link-right-side-container">
                                                <h3 className='link-creator-and-title'>User wants to {link.details.giveorreceive}: {link.details.title}</h3>
                                                <p className='amount'>${link.details.amount}</p> 
                                            </div>
                                        </div>

                                        <div className="CTA-button-container">
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