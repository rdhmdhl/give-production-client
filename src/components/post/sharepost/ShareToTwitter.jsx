import React, { useState, useEffect } from "react";
import { FaCircle } from "react-icons/fa";
import { MdDownload } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
const ShareToInstagram = ({
  details,
  linkGenerated,
  generatedLink,
  generatedElements,
  isLoadingImage,
  selectedImageIndex,
  setSelectedImageIndex,
  setDownloadFunction
}) => {
  const [showTwitterSteps, setshowTwitterSteps] = useState(true);

  const [currentStep, setCurrentStep] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);

  let peopleOrPerson;

  if (details.quantity > 1) {
    peopleOrPerson = "people";
  } else {
    peopleOrPerson = "person";
  }

  const stepImages = [
    generatedElements.length > 0 ? generatedElements[selectedImageIndex] : null, 
    "/assets/x-2-final.webp"
  ];

  const stepInstructions = [
    "Optional: download image",
    "Click share & a post will be composed",
  ];

  const handleDownload = (index) => {
    setDownloadFunction(index);
    setIsDownloaded(true);
    
    setTimeout(() => setIsDownloaded(false), 2000); // Reset after 2 seconds
  };

  const navigate = useNavigate();

  const shareToTwitter = () => {
    let text;
    // i guess this is used to conditionally render?
    setshowTwitterSteps(true);

    // increment step counter
    setCurrentStep((prev) => {
      const nextStep = prev + 1;
      return nextStep < stepInstructions.length ? nextStep : prev; // Prevent incrementing beyond array length
    });

    if (generatedLink && linkGenerated) {
      if (details.giveorreceive === "give" && details.type === "currency") {
        text = `I'm giving $${details.amount} to ${details.quantity} anonymous ${peopleOrPerson} today.`;
      }
      if (details.giveorreceive === "receive" && details.type === "currency") {
        text = `Make my day, send me $${details.amount} anonymously`;
      }
      if (details.giveorreceive === "give" && details.type === "item") {
        text = `Sending this out to someone anonymously`;
      }
      if (details.giveorreceive === "receive" && details.type === "item") {
        text = `Send me this anonymously and make my day`;
      }

      // Handle sharing to Twitter
      let url = generatedLink; // Assuming generatedLink contains the URL you want to share
      //   let encodedText = encodeURIComponent(text);
      let textWithBreak = `${encodeURIComponent(
        text
      )}%0A%0A${encodeURIComponent(url)}`; // Adding two encoded newline characters

      const tweetUrl = `https://twitter.com/intent/tweet?text=${textWithBreak}`;

      if (currentStep === 1) {
        // navigate back to home page 
        navigate("/");

        // Open the Twitter share dialog in a new window
        window.open(tweetUrl, "_blank");
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
      {showTwitterSteps && !isLoadingImage && generatedElements && (
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
              onClick={shareToTwitter}
            >
              {currentStep === 1 ? "Share!" : "Next Step"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareToInstagram;

ShareToInstagram.propTypes = {
  details: PropTypes.object,
  linkGenerated: PropTypes.bool,
  generatedLink: PropTypes.string,
  generatedElements: PropTypes.array,
  isLoadingImage: PropTypes.bool,
  selectedImageIndex: PropTypes.number,
  setSelectedImageIndex: PropTypes.func,
  setDownloadFunction: PropTypes.func
};
