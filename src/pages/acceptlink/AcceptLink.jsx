import React, {useEffect, useState, useContext} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IoArrowBackOutline } from "react-icons/io5";
import { AuthContext } from '../../context/AuthContext';
import './AcceptLink.css';
import axios from 'axios';

export default function AcceptLink() {

const { linkId } = useParams();
const [link, setLink] = useState({});
// const [used, setUsed] = useState();
const [linkUserData, setlinkUserData] = useState({});
const navigate = useNavigate();
const {user: currentUser} = useContext(AuthContext);
const [isUserLink, setisUserLink] = useState(false);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
    const fetchLink = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/api/${linkId}`);
            if (res.data.link.creatorUserId === currentUser._id) {
                // users cannot use their own link
                setisUserLink(true);
            }

            setLink(res.data.link);
            const user = await axios.get(`/api/users?userId=${res.data.link.creatorUserId}`);
            setlinkUserData(user.data);

        } catch (error) {
            alert("An error occured when fetching the link. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }
    fetchLink();
}, [linkId]);

if(isLoading) {
    return null;
}

const acceptorgive = async () => {
    try {
        const token = localStorage.getItem("token");
        await axios.put(`/api/accept-link/${linkId}`, {}, {
            headers: {
                'x-auth-token': token
            }
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
  
      {isUserLink
              ? <div className='own-link-container'>
                    <img className="profile-pic" src={linkUserData.profilePicture ? linkUserData.profilePicture : "./assets/person/nopicture.png"}/>
                <h3 className='own-link-message'>... you can`t use your own link</h3>
                </div> 
              : link.details 
                ? <div className="link-details">
                    <img className="profile-pic" src={linkUserData.profilePicture ? linkUserData.profilePicture : "./assets/person/nopicture.png"}
                    alt="link creator profile picture" />
                    {link.details.type === 'currency' && link.details.quantity > 0 
                        ? (
                            <>
                                <h3>{linkUserData.username} wants to give you ${link.details.amount}</h3>
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