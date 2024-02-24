import React, { useState, useEffect } from "react";
import { FaCircle } from "react-icons/fa";
import { MdDownload } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import PropTypes from "prop-types";
import { useNavigate } from 'react-router';

function ShareToMessages({  
    details,
    linkGenerated,
    generatedLink,
    generatedElements,
    isLoadingImage,
    selectedImageIndex,
    setSelectedImageIndex,
    setDownloadFunction
}) {

  const [showMessageSteps, setShowMessageSteps] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const navigate = useNavigate();
  const stepImages = [
    generatedElements.length > 0 ? generatedElements[selectedImageIndex] : null,
    "/assets/messages-step2.jpeg"
  ];

  const stepInstructions = [
    "Optional: download image",
    "Click share and go to messages",
  ];

  const handleDownload = (index) => {
    setDownloadFunction(index);
    setIsDownloaded(true);
    
    setTimeout(() => setIsDownloaded(false), 2000); // Reset after 2 seconds
  };

  // Handle sharing via text message
  const shareToTextMessage = () => {
    setShowMessageSteps(true);

    // increment step counter
    setCurrentStep((prev) => {
        const nextStep = prev + 1;
        return nextStep < stepInstructions.length ? nextStep : prev; // Prevent incrementing beyond array length
        });

    // Check if the link is generated or if a postURL is provided
    if (linkGenerated && generatedLink){
      // Create the message text
      let text;
      let urlToShare = generatedLink; 

      if (generatedLink && linkGenerated && details && currentStep === 1) {
        if (details.giveorreceive === "give" && details.type === "currency") {
          text = `Can I give you $${details.amount}? `;
        }
        if (
          details.giveorreceive === "receive" &&
          details.type === "currency"
        ) {
          text = `Wanna give me $${details.amount}? `;
        }
        if (details.giveorreceive === "give" && details.type === "item") {
          text = `Do you want this? -- ${details.title} 🎁 `;
        }
        if (details.giveorreceive === "receive" && details.type === "item") {
          text = `Send it! 💖 `;
        }
      }

      // Complete the message with the URL to share
      text += urlToShare;

      // Encode the text
      const encodedText = encodeURIComponent(text);

      if (currentStep === 1){
        navigate('/')
        // Open the text message app (this example is for iOS)
        window.location.href = `sms:?&body=${encodedText}`;

      }
    }
  };

  useEffect(() => {
    const container = document.querySelector('.image-selection-container');
    if (!container) return;
    let frameId = null; // To hold the requestAnimationFrame ID

    // Define the scroll event listener function
    const onScroll = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        let closestIndex = 0;
        let closestDistance = Infinity;
        const thumbnails = document.querySelectorAll('.thumbnail'); // Move inside the event listener if thumbnails might change
        
        thumbnails.forEach((thumbnail, index) => {
          const scrollPosition = container.scrollLeft + container.offsetWidth / 2;
          const thumbnailCenter = thumbnail.offsetLeft + thumbnail.offsetWidth / 2;
          const distance = Math.abs(scrollPosition - thumbnailCenter);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });
        
        thumbnails.forEach((thumbnail, index) => {
          if (index === closestIndex) {
            thumbnail.classList.add('active');
            setSelectedImageIndex(index)
          } else {
            thumbnail.classList.remove('active');
          }
        });
      })
    }

    // Add the event listener
    container.addEventListener('scroll', onScroll);

    return () => {
      container.removeEventListener('scroll', onScroll);
      if (frameId !== null){
        cancelAnimationFrame(frameId);
      }
    };
  }, [generatedElements]);

  
  return (
    <>
    {showMessageSteps && !isLoadingImage && generatedElements && (
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

        <div className="steps-and-images-container">
            {/* Overlay GIF for highlighting steps */}
            {/* <img
              className="overlay-gif"
              src="/assets/circle-gif.gif"
              style={{
                position: "absolute",
                top: gifPositions[currentStep]?.top || "0",
                left: gifPositions[currentStep]?.left || "0",
                display: gifPositions[currentStep]?.display || "block",
              }}
              alt="Highlight"
            /> */}

            <div className="image-row-container">

              {/* Selected Image */}
              {currentStep > 0 && (
                <div className="selected-image-container">
                  <img
                    className="step-image"
                    src={stepImages[currentStep]}
                    alt={`Step ${currentStep + 1} for posting on Instagram`}
                  />
                </div>
              )}

              {/* Thumbnails */}
              <div className={`image-selection-container ${currentStep === 0 ? 'with-padding' : ''}`}>
                {currentStep === 0 &&
                  generatedElements.length > 0 &&
                  generatedElements.map((element, index) => (
                    <div
                      key={index}
                      id={`thumbnail-container-${index}`}
                      className={`thumbnail ${
                        selectedImageIndex === index ? "active" : ""
                      }`}
                      onClick={() => {
                        setSelectedImageIndex(index)
                        // scrollToThumbnail(index)
                      }}
                    >
                      {element}
                    </div>
                  ))}
              </div>
            </div>
          </div>

        {/* download button */}
        <div className="download-button-cont">
          {currentStep === 0 && (
            isDownloaded ? 
              <FaCheckCircle className="download-success-icon" /> :
              <MdDownload onClick={() => handleDownload(selectedImageIndex)} />
          )}
        </div>

        {/* alert and button container */}
        <div className="alert-and-button">
          <button
            className="share-button"
            type="button"
            onClick={shareToTextMessage}
          >
            {currentStep === 1 ? "Share!" : "Next Step"}
          </button>
        </div>
      </div>
    )}
  </>
  );
}

export default ShareToMessages;

ShareToMessages.propTypes = {
    details: PropTypes.object,
    postUrl: PropTypes.string,
    linkGenerated: PropTypes.bool,
    generatedLink: PropTypes.string,
    generatedElements: PropTypes.array,
    isLoadingImage: PropTypes.bool,
    selectedImageIndex: PropTypes.number,
    setSelectedImageIndex: PropTypes.func,
    setDownloadFunction: PropTypes.func
  };
  