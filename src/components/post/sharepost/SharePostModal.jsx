import React, { useContext, useState, useEffect } from "react";
// import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import 'font-awesome/css/font-awesome.min.css';
import './SharePostModal.css';
import useLinkGenerator from "../../../pages/sharepost/LinkGenerator";
import { AuthContext } from "../../../context/AuthContext";
import config from '../../../config';
import Popup from '../../popup/Popup';

const SharePostModal = ({ isOpen, closeModal, details }) => {
  const [caution, setCaution] = useState(null);
  const [linkGenerated, setLinkGenerated] = useState(false);  
  const [generatedLink, setGeneratedLink] = useState(null);
  // const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const generateLink = useLinkGenerator(); 
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState(''); 

  // function to show popup used in the catch blocks
  const popupStatus = async (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  }


  // allow user to generate a new link if they change the details
// allow user to generate a new link if they change the details
  useEffect(() => {
    const linkGenerator = async (user, details) => {
      try {
        const link = await generateLink(user, details);
        setLinkGenerated(true);
        setGeneratedLink(`${config.publicUrl}/link/` + link);
      } catch (error) {
        popupStatus('An error occurred when generating the link. Please try again later.', "Close")
      }
    }
    if (isOpen && !linkGenerated){
      linkGenerator(user, details ); // Call linkGenerator with user, details, and dispatch
    }
  }, [details]);

  const shareToInstagramStory = () => {
    // Handle sharing to Instagram Story
  };

  const shareToTwitter = () => {
    // Handle sharing to Twitter
  };

  const shareToFacebook = () => {
    // Handle sharing to Facebook
  };

  const copyUrlToClipboard = async () => {
    // only generate one link
    if (linkGenerated && generatedLink) {
      try {
        // copy to clipboard
        await navigator.clipboard.writeText(generatedLink)
        setCaution("Copied to clipboard!");

      } catch (error) {
        setCaution("An unexpected error occurred. Please try again later.");
      }
    } else {
      setCaution("Link is being generated, please wait.");
    }

    // clear alert after 3 seconds
    setTimeout(() => setCaution(null), 3000);
  };

  const shareToTextMessage = () => {
    // Handle sharing via text message
  };

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`} onClick={closeModal}>
      <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Share Post</h2>

        

        <ul className="share-options">
          <li onClick={shareToInstagramStory}>
            <div className="icon-container"><i className="fa fa-instagram"></i></div>
            <span>Instagram</span>
          </li>
          <li onClick={shareToTwitter}>
            <div className="icon-container"><i className="fa fa-twitter"></i></div>
            <span>Twitter</span>
          </li>
          <li onClick={shareToFacebook}>
            <div className="icon-container"><i className="fa fa-facebook"></i></div>
            <span>Facebook</span>
          </li>
          <li onClick={copyUrlToClipboard}>
            <div className="icon-container"><i className="fa fa-link"></i></div>
            <span>Copy URL</span>
          </li>
          <li onClick={shareToTextMessage}>
            <div className="icon-container"><i className="fa fa-comment"></i></div>
            <span>Messages</span>
          </li>
        </ul>
        <div className="alert-and-button">
        {caution && <div className="alert">{caution}</div>}
        <button type="button" onClick={closeModal}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default SharePostModal;

SharePostModal.propTypes = {
    details: PropTypes.object,
    isOpen: PropTypes.bool,
    closeModal: PropTypes.func,
  };