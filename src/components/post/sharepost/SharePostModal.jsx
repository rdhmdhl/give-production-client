// import { useNavigate } from 'react-router-dom';
// import useImageGenerator from "../../../pages/sharepost/ ImageGenerator";
import "./SharePostModal.css";
import "font-awesome/css/font-awesome.min.css";
import { AuthContext } from "../../../context/AuthContext";

import config from "../../../config";
import ImageTemplate from "../../../pages/sharepost/ImageTemplate";
import Popup from "../../popup/Popup";
import PropTypes from "prop-types";
import React, { useContext, useState, useEffect } from "react";
import useLinkGenerator from "../../../pages/sharepost/LinkGenerator";
import ShareToInstagram from "./ShareToInstagram";
import ShareToTwitter from "./ShareToTwitter";
import ShareToMessages from "./ShareToMessages";

// TODO:
// REMOVED postUrl, FROM PARAMETERS TEMPORARILY
const SharePostModal = ({ isOpen, closeModal, postUrl, details }) => {

  const [linkGenerated, setLinkGenerated] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [generatedImage, setGeneratedImage] = useState([]);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  // const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const generateLink = useLinkGenerator();
  // const generateImage = useImageGenerator();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  // const [stepsCompleted, setStepsCompleted] = useState(false);

  // used for selecting the social media icon
  const [selectedItem, setSelecteditem] = useState(0)

  // Array of objects representing each social media option and its corresponding Font Awesome class
  const socialOptions = [
    { name: "Instagram", iconClass: 'fa fa-instagram' },
    { name: "Twitter", iconClass: 'fa fa-twitter' },
    {name: "Messages", iconClass: 'fa fa-comment' },
    // {name: "Clipboard", iconClass: 'fa fa-clone' }
  ];
  
  // function to show popup used in the catch blocks
  const popupStatus = async (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  };

  // allow user to generate a new link if they change the details
  // also generate the image for users to download
  useEffect(() => {
    const linkGenerator = async (user) => {
      try {
        const link = await generateLink(user, details);
        setLinkGenerated(true);
        setGeneratedLink(`${config.publicUrl}/link/` + link);
      } catch (error) {
        popupStatus(
          "An error occurred when generating the link. Please try again later.",
          "Close"
        );
      }
    };
    if (isOpen && !linkGenerated) {
      linkGenerator(user, details); // Call linkGenerator with user, details, and dispatch
    }
  }, [details]);


// download image
// update to only run if user clicks on the download image button 
  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'image.png';  // or any other name you want
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // TODO: add share to snapchat function
  
  return (
    <div className={`modal ${isOpen ? "open" : ""}`} onClick={closeModal}>
      <Popup
        isPopupOpen={showPopup}
        message={popupMessage}
        button1Text="Close"
        button1Action={() => setShowPopup(false)}
      />
      <div
        className="modal-content-container"
        onClick={(e) => e.stopPropagation()}
      >
        <ul className="share-options">
          {socialOptions.map((option, index) => (
            <li
              key = {index}
              className={selectedItem === index ? "highlighted" : ""}
              onClick={() => {
                setSelecteditem(index);
                
              }}
            >
              <div className="icon-container">
                <i className={option.iconClass}></i>
              </div>
            </li>
          ))}
        </ul>

        <h2 className="share-headline">How to Share the Link</h2>

        {socialOptions[selectedItem]?.name === "Instagram" && (
          <ShareToInstagram
              linkGenerated={linkGenerated}
              generatedLink={generatedLink}
              generatedImage={generatedImage}
              isLoadingImage={isLoadingImage}
              downloadImage={downloadImage}
          />
        )}
        {socialOptions[selectedItem]?.name === "Twitter" && (
          <ShareToTwitter
            details={details}
            postUrl={postUrl}
            linkGenerated={linkGenerated}
            generatedLink={generatedLink}
            generatedImage={generatedImage}
            isLoadingImage={isLoadingImage}
            downloadImage={downloadImage}
        />
        )}
        {socialOptions[selectedItem]?.name === "Messages" && (
          <ShareToMessages
            details={details}
            postUrl={postUrl}
            linkGenerated={linkGenerated}
            generatedLink={generatedLink}
            generatedImage={generatedImage}
            isLoadingImage={isLoadingImage}
            downloadImage={downloadImage}
        />
        )}
      </div>

      <div className="offscreen">
        <ImageTemplate
          details={details}
          setGeneratedImage={setGeneratedImage}
          setIsLoadingImage={setIsLoadingImage}
        />
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
