import React, { useContext, useState, useEffect } from "react";
// import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import 'font-awesome/css/font-awesome.min.css';
import './SharePostModal.css';
import useLinkGenerator from "../../../pages/sharepost/LinkGenerator";
import { AuthContext } from "../../../context/AuthContext";
import config from '../../../config';
import Popup from '../../popup/Popup';

const SharePostModal = ({ isOpen, closeModal, postUrl, details }) => {
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
    const linkGenerator = async (user) => {
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

  // const shareToInstagramStory = () => {
  //   // Handle sharing to Instagram Story
  // };

  const shareToTwitter = () => {
    let text, url;

    // used for post urls, not link urls
    if(postUrl) {
      // Handle sharing to Twitter
      text = "Check out this post on G-ve.";
      url = `${config.publicUrl}`+ postUrl; // Assuming generatedLink contains the URL you want to share
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  
      // Open the Twitter share dialog in a new window
      window.open(tweetUrl, '_blank');

      // if the user is sharing a link
    } else if (generatedLink && linkGenerated ) {
        if (details.giveorreceive === 'give' && details.type === 'currency') {
          text = `Who could use an extra $${details.amount} today? 🤑`
        }
        if (details.giveorreceive === 'receive' && details.type === 'currency') {
          text = `Give me $${details.amount} anonymously 💖`
        }
        if (details.giveorreceive === 'give' && details.type === 'item') {
          text = `Sending this out to someone anonymously -- ${details.title} 🎁`
        }
        if (details.giveorreceive === 'receive' && details.type === 'item') {
          text = `Send it anonymously and make my day! ${details.title} 💖`
        }
        
      // Handle sharing to Twitter  
      url = generatedLink; // Assuming generatedLink contains the URL you want to share
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  
      // Open the Twitter share dialog in a new window
      window.open(tweetUrl, '_blank');
    }
  };

  // const shareToFacebook = () => {
  //   // Handle sharing to Facebook
  // };

  const copyUrlToClipboard = async () => {
    try {
    // copy post url
    if (postUrl) {
      await navigator.clipboard.writeText(`${config.publicUrl}`+ postUrl)
      setCaution("Copied to clipboard!");
    }
    // copy link url
    if (linkGenerated && generatedLink) { 
      await navigator.clipboard.writeText(generatedLink)
      setCaution("Copied to clipboard!");
    }
    // clear alert after 3 seconds
    setTimeout(() => setCaution(null), 3000);
  } catch (error) {
    setCaution("An unexpected error occurred. Please try again later.");
  }
  };

  // Handle sharing via text message
  const shareToTextMessage = () => {
    // Check if the link is generated or if a postURL is provided
    if (linkGenerated && generatedLink || postUrl) {
      // Create the message text
      let text = "Check out this post on G-ve. It's a website where you can give and receive anonymously. ";
      let urlToShare = postUrl ? `${config.publicUrl}/${postUrl}` : generatedLink; // Use postURL if available, otherwise use generatedLink

      if (generatedLink && linkGenerated && details) {
        if (details.giveorreceive === 'give' && details.type === 'currency') {
          text = `I'll give you $${details.amount}. Check it out: `;
        }
        if (details.giveorreceive === 'receive' && details.type === 'currency') {
          text = `Checkout this new website, you can give me $${details.amount} anonymously. `;
        }
        if (details.giveorreceive === 'give' && details.type === 'item') {
          text = `Sending this out to someone anonymous -- ${details.title} 🎁 `
        }
        if (details.giveorreceive === 'receive' && details.type === 'item') {
          text = `Send it and make my day! ${details.title} 💖 `
        }
      }
  
      // Complete the message with the URL to share
      text += urlToShare;
  
      // Encode the text
      const encodedText = encodeURIComponent(text);
  
      // Open the text message app (this example is for iOS)
      window.location.href = `sms:?&body=${encodedText}`;
    }
  };

  const postOrLink = postUrl ? "Post" : "Link";

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`} onClick={closeModal}>
      <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />
      <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
        <h2 className="share-headline">Share {postOrLink}</h2>

        

        <ul className="share-options">
          {/* <li onClick={shareToInstagramStory}>
            <div className="icon-container"><i className="fa fa-instagram"></i></div>
            <span>Instagram</span>
          </li> */}
          {/* <li onClick={shareToFacebook}>
            <div className="icon-container"><i className="fa fa-facebook"></i></div>
            <span>Facebook</span>
          </li> */}
          <li onClick={(event) => { event.stopPropagation(); copyUrlToClipboard(); }}>
            <div className="icon-container"><i className="fa fa-link"></i></div>
            <span>Copy URL</span>
          </li>
          <li onClick={shareToTextMessage}>
            <div className="icon-container"><i className="fa fa-comment"></i></div>
            <span>Messages</span>
          </li>
          <li onClick={(event) => { event.stopPropagation(); shareToTwitter(); }}>
            <div className="icon-container"><i className="fa fa-twitter"></i></div>
            <span>Twitter</span>
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
    postUrl: PropTypes.string,
  };