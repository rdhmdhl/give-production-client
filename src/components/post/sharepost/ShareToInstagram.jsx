import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCircle } from "react-icons/fa";
import { MdDownload } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
// import createScrollSnap from "scroll-snap";
import PropTypes from "prop-types";
const ShareToInstagram = ({
  linkGenerated,
  generatedLink,
  generatedElements,
  isLoadingImage,
  selectedImageIndex,
  setSelectedImageIndex,
  setDownloadFunction,
  sharedFile
}) => {
  const [showInstaSteps, setShowInstaSteps] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [caution, setCaution] = useState(null);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const navigate = useNavigate();

  let shareData = {
    url: "https://g-ve.com",
    files: [sharedFile]
  };

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
      if (linkGenerated && generatedLink && generatedElements) {
        if (currentStep === 2) {
          console.log("generated link: ", generatedLink);
          await navigator.clipboard.writeText(generatedLink);
          setCaution("Link copied to clipboard!");
          // clear alert after 3 seconds
          setTimeout(() => setCaution(null), 3000);
        }
        // if the user is on step 4, send them to instagram
        if (currentStep === 3) {
          try {
            console.log("shareData: ", shareData);
            console.log("sharedFile: ", sharedFile);
            // console.log("shareData.files: ", shareData.files);

            if (navigator.canShare && navigator.canShare(shareData)) {
              await navigator.share(shareData);
              // navigate back to the home page
              navigate("/");
            } else {
              console.log("cannot share via api");
              // Provide feedback or confirmation before redirecting
              // navigate back to the home page
              navigate("/");
              const instaUrl = "https://instagram.com/";
              // Open the Instagram page in a new window
              window.open(instaUrl, "_blank");
            }
          } catch (error) {
            console.error('Sharing failed', error);
            // Provide feedback to the user about the failure
          }
        }
      }
    } catch (error) {
      setCaution("An unexpected error occurred. Please try again later.");
    }
  };

  const stepImages = [
    generatedElements.length > 0 ? generatedElements[selectedImageIndex] : null,
    "/assets/step1.png",
    "/assets/step2.png",
    "/assets/paste-link.gif",
  ];

  const gifPositions = [
    { top: "0", left: "0", display: "none" }, // No display for step 1
    { top: "12rem", left: "-.15rem" }, // Position for step 2
    { top: "14.25rem", left: "-3rem" }, // Position for step 3
    { top: "0", left: "0", display: "none" }, // No display for step 4
  ];

  const stepInstructions = [
    "Optional: download image",
    "Create a story, click the sticker button",
    "Add a link",
    "Paste your link",
  ];


  const handleDownload = (index) => {
    setDownloadFunction(index);
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 2000); // Reset after 2 seconds
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
      {/* Instagram steps */}
      {showInstaSteps && !isLoadingImage && generatedElements && (
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

          <div className="download-button-cont">
            {currentStep === 0 && (
              isDownloaded ? 
                <FaCheckCircle className="download-success-icon" /> :
                <MdDownload onClick={() => handleDownload(selectedImageIndex)} />
            )}
          </div>

          {/* Alert and button container */}
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
        </div>
      )}
    </>
  );
};

export default ShareToInstagram;

ShareToInstagram.propTypes = {
  linkGenerated: PropTypes.bool,
  generatedLink: PropTypes.string,
  generatedElements: PropTypes.array,
  isLoadingImage: PropTypes.bool,
  downloadImage: PropTypes.func,
  selectedImageIndex: PropTypes.number,
  setSelectedImageIndex: PropTypes.func,
  setDownloadFunction: PropTypes.func,
  sharedFile: PropTypes.object
};
