// import { useNavigate } from 'react-router-dom';
// import useImageGenerator from "../../../pages/sharepost/ ImageGenerator";
import "./SharePostModal.css";
import "font-awesome/css/font-awesome.min.css";
import { AuthContext } from "../../../context/AuthContext";
import { FaCircle } from "react-icons/fa";
import { MdDownload } from "react-icons/md";
// import { toPng } from 'html-to-image';
import config from "../../../config";
import ImageTemplate from "../../../pages/sharepost/ImageTemplate";
import Popup from "../../popup/Popup";
import PropTypes from "prop-types";
import React, { useContext, useState, useEffect } from "react";
import useLinkGenerator from "../../../pages/sharepost/LinkGenerator";

const SharePostModal = ({ isOpen, closeModal, postUrl, details }) => {
  const [caution, setCaution] = useState(null);
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
  const [showInstaSteps, setShowInstaSteps] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
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

  // useEffect(() => {
  //   if (isOpen && details) {
  //     setIsLoadingImage(true);
  //     const element = document.querySelector('.offscreen');
  //     toPng(element)
  //       .then((dataUrl) => {
  //         setGeneratedImage(dataUrl);
  //         setIsLoadingImage(false);
  //       })
  //       .catch((error) => {
  //         console.error('Could not generate image:', error);
  //         setIsLoadingImage(false);
  //       });
  //   }
  // }, [isOpen, details]);

  // const convertToImage = async () => {
  //   const element = document.querySelector('.image-template');
  //   try {
  //     const imageDataUrl = await toPng(element);
  //     // You can set this URL to state for showing in the modal, or trigger a download
  //   } catch (error) {
  //     console.error('Could not convert to image:', error);
  //   }
  // };

  const shareToInstagramStory = async () => {
    // Handle sharing to Instagram Story
    // set variable to show the steps for posting on insta story
    setShowInstaSteps(true);

    // increment step counter
    setCurrentStep((prev) => {
      const nextStep = prev + 1;
      return nextStep < gifPositions.length ? nextStep : prev; // Prevent incrementing beyond array length
    });

    try {
      // copy link url
      if (linkGenerated && generatedLink && generatedImage) {
        if (currentStep === 2) {
          await navigator.clipboard.writeText(generatedLink);
          setCaution("Link copied to clipboard!");
          // clear alert after 3 seconds
          setTimeout(() => setCaution(null), 3000);
        }
        // if the user is on step 4, send them to instagram
        if (currentStep === 3) {
          const instaUrl = "https://instagram.com/";
          // Open the Twitter share dialog in a new window
          window.open(instaUrl, "_blank");
        }
      }
    } catch (error) {
      setCaution("An unexpected error occurred. Please try again later.");
    }
  };

  const stepImages = [
    generatedImage,
    "/assets/step1.png",
    "/assets/step2.png",
    "/assets/paste-link.gif",
  ];

  const gifPositions = [
    { top: "0", left: "0", display: "none" }, // No display for step 1
    { top: "13.5rem", left: "-.15rem" }, // Position for step 2
    { top: "15.75rem", left: "-3rem" }, // Position for step 3
    { top: "0", left: "0", display: "none" }, // No display for step 4
  ];

  const stepInstructions = [
    "Optional: download image",
    "Create a story, click the sticker button",
    "Add a link",
    "Paste your link",
  ];

  const shareToTwitter = () => {
    let text, url;

    // used for post urls, not link urls
    if (postUrl) {
      // Handle sharing to Twitter
      text = "Check out this post on G-ve.";
      url = `${config.publicUrl}` + postUrl; // Assuming generatedLink contains the URL you want to share
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`;

      // Open the Twitter share dialog in a new window
      window.open(tweetUrl, "_blank");

      // if the user is sharing a link
    } else if (generatedLink && linkGenerated) {
      if (details.giveorreceive === "give" && details.type === "currency") {
        text = `Who could use an extra $${details.amount} today? 🤑`;
      }
      if (details.giveorreceive === "receive" && details.type === "currency") {
        text = `Give me $${details.amount} anonymously 💖`;
      }
      if (details.giveorreceive === "give" && details.type === "item") {
        text = `Sending this out to someone anonymously -- ${details.title} 🎁`;
      }
      if (details.giveorreceive === "receive" && details.type === "item") {
        text = `Send it anonymously and make my day! ${details.title} 💖`;
      }

      // Handle sharing to Twitter
      url = generatedLink; // Assuming generatedLink contains the URL you want to share
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`;

      // Open the Twitter share dialog in a new window
      window.open(tweetUrl, "_blank");
    }
  };

  // const shareToFacebook = () => {
  //   // Handle sharing to Facebook
  // };

  const copyUrlToClipboard = async () => {
    try {
      // copy post url
      if (postUrl) {
        await navigator.clipboard.writeText(`${config.publicUrl}` + postUrl);
        setCaution("Copied to clipboard!");
      }
      // copy link url
      if (linkGenerated && generatedLink) {
        await navigator.clipboard.writeText(generatedLink);
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
    if ((linkGenerated && generatedLink) || postUrl) {
      // Create the message text
      let text =
        "Check out this post on G-ve. It's a website where you can give and receive anonymously. ";
      let urlToShare = postUrl
        ? `${config.publicUrl}/${postUrl}`
        : generatedLink; // Use postURL if available, otherwise use generatedLink

      if (generatedLink && linkGenerated && details) {
        if (details.giveorreceive === "give" && details.type === "currency") {
          text = `I'll give you $${details.amount}. Check it out: `;
        }
        if (
          details.giveorreceive === "receive" &&
          details.type === "currency"
        ) {
          text = `Checkout this new website, you can give me $${details.amount} anonymously. `;
        }
        if (details.giveorreceive === "give" && details.type === "item") {
          text = `Sending this out to someone anonymous -- ${details.title} 🎁 `;
        }
        if (details.giveorreceive === "receive" && details.type === "item") {
          text = `Send it and make my day! ${details.title} 💖 `;
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
          {/* <li onClick={shareToFacebook}>
            <div className="icon-container"><i className="fa fa-facebook"></i></div>
            <span>Facebook</span>
          </li> */}
          <li onClick={shareToInstagramStory}>
            <div className="icon-container">
              <i className="fa fa-instagram"></i>
            </div>
          </li>
          <li
            onClick={(event) => {
              event.stopPropagation();
              shareToTwitter();
            }}
          >
            <div className="icon-container">
              <i className="fa fa-twitter"></i>
            </div>
          </li>
          <li onClick={shareToTextMessage}>
            <div className="icon-container">
              <i className="fa fa-comment"></i>
            </div>
          </li>
          <li
            onClick={(event) => {
              event.stopPropagation();
              copyUrlToClipboard();
            }}
          >
            <div className="icon-container">
              <i className="fa fa-clone"></i>
            </div>
          </li>
        </ul>

        <h2 className="share-headline">How to Share the Link</h2>

        {/* instagram steps */}
        {showInstaSteps && !isLoadingImage && generatedImage && (
          <>
            <div className="insta-steps-container">
              <div className="progress-circles-container">
                {stepImages.map((_, index) => (
                  <FaCircle
                    key={index}
                    className={`circle-icon ${
                      index <= currentStep ? "active" : ""
                    }`}
                    onClick={() => setCurrentStep(index)}
                  />
                ))}
              </div>
              <div className="step-descriptions-container">
                <p>{stepInstructions[currentStep]}</p>
              </div>
              <div className="steps-container">
                <img
                  className="overlay-gif"
                  src="/assets/circle-gif.gif"
                  style={{
                    position: "absolute",
                    top:
                      (gifPositions[currentStep] &&
                        gifPositions[currentStep].top) ||
                      "0",
                    left:
                      (gifPositions[currentStep] &&
                        gifPositions[currentStep].left) ||
                      "0",
                    display:
                      (gifPositions[currentStep] &&
                        gifPositions[currentStep].display) ||
                      "block",
                  }}
                  alt="Highlight"
                />

                <img
                  className="step-image"
                  src={stepImages[currentStep]}
                  alt={`Step ${currentStep + 1} for posting on Instagram`}
                />
                <div className="download-button-cont">
                  {currentStep === 0 && <MdDownload onClick={downloadImage} />}
                </div>
              </div>
            </div>
            {/* alert and button container */}
            <div className="alert-and-button">
              {caution && <div className="alert">{caution}</div>}
              <button
                className="share-button"
                type="button"
                onClick={shareToInstagramStory}
              >
                {currentStep === 3 ? "Share!" : "Next Step"}
              </button>
            </div>
          </>
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
