// import { useNavigate } from 'react-router-dom';
// import useImageGenerator from "../../../pages/sharepost/ ImageGenerator";
import "./SharePostModal.css";
import "font-awesome/css/font-awesome.min.css";
import { AuthContext } from "../../../context/AuthContext";

// import { toPng } from 'html-to-image';
import config from "../../../config";
import ImageTemplate from "../../../pages/sharepost/ImageTemplate";
import Popup from "../../popup/Popup";
import PropTypes from "prop-types";
import React, { useContext, useState, useEffect } from "react";
import useLinkGenerator from "../../../pages/sharepost/LinkGenerator";
import ShareToInstagram from "./ShareToInstagram";
import ShareToTwitter from "./ShareToTwitter";

// TODO:
// REMOVED postUrl, FROM PARAMETERS TEMPORARILY
const SharePostModal = ({ isOpen, closeModal, postUrl, details }) => {

  const [linkGenerated, setLinkGenerated] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  // const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const generateLink = useLinkGenerator();
  // const generateImage = useImageGenerator();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  // const [stepsCompleted, setStepsCompleted] = useState(false);

  const [selectedItem, setSelecteditem] = useState(0)

  // Array of objects representing each social media option and its corresponding Font Awesome class
  const socialOptions = [
    { name: "Instagram", iconClass: 'fa fa-instagram' },
    { name: "Twitter", iconClass: 'fa fa-twitter' },
    {iconClass: 'fa fa-comment' },
    {iconClass: 'fa fa-clone' }
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

  

  // const shareToFacebook = () => {
  //   // Handle sharing to Facebook
  // };

  // const copyUrlToClipboard = async () => {
  //   try {
  //     // copy post url
  //     if (postUrl) {
  //       await navigator.clipboard.writeText(`${config.publicUrl}` + postUrl);
  //       // setCaution("Copied to clipboard!");
  //     }
  //     // copy link url
  //     if (linkGenerated && generatedLink) {
  //       await navigator.clipboard.writeText(generatedLink);
  //       // setCaution("Copied to clipboard!");
  //     }
  //     // clear alert after 3 seconds
  //     // setTimeout(() => setCaution(null), 3000);
  //   } catch (error) {
  //     // setCaution("An unexpected error occurred. Please try again later.");
  //   }
  // };

  // Handle sharing via text message
  // const shareToTextMessage = () => {
  //   // Check if the link is generated or if a postURL is provided
  //   if ((linkGenerated && generatedLink) || postUrl) {
  //     // Create the message text
  //     let text =
  //       "Check out this post on G-ve. It's a website where you can give and receive anonymously. ";
  //     let urlToShare = postUrl
  //       ? `${config.publicUrl}/${postUrl}`
  //       : generatedLink; // Use postURL if available, otherwise use generatedLink

  //     if (generatedLink && linkGenerated && details) {
  //       if (details.giveorreceive === "give" && details.type === "currency") {
  //         text = `I'll give you $${details.amount}. Check it out: `;
  //       }
  //       if (
  //         details.giveorreceive === "receive" &&
  //         details.type === "currency"
  //       ) {
  //         text = `Checkout this new website, you can give me $${details.amount} anonymously. `;
  //       }
  //       if (details.giveorreceive === "give" && details.type === "item") {
  //         text = `Sending this out to someone anonymous -- ${details.title} 🎁 `;
  //       }
  //       if (details.giveorreceive === "receive" && details.type === "item") {
  //         text = `Send it and make my day! ${details.title} 💖 `;
  //       }
  //     }

  //     // Complete the message with the URL to share
  //     text += urlToShare;

  //     // Encode the text
  //     const encodedText = encodeURIComponent(text);

  //     // Open the text message app (this example is for iOS)
  //     window.location.href = `sms:?&body=${encodedText}`;
  //   }
  // };

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
