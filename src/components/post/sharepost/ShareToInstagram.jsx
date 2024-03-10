import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCircle } from "react-icons/fa";
import { MdDownload } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import ReactLoading from 'react-loading';
import PropTypes from "prop-types";
const ShareToInstagram = ({
  linkGenerated,
  generatedLink,
  generatedElements,
  isLoadingImage,
  selectedImageIndex,
  setSelectedImageIndex,
  // setDownloadFunction,
  setDownloadViaShareAPI,
  loadingShareAPI
}) => {

  const [showInstaSteps, setShowInstaSteps] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [caution, setCaution] = useState(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const navigate = useNavigate();

  const shareToInstagramStory = async () => {
    // Handle sharing to Instagram Story
    // set variable to show the steps for posting on insta story
    setShowInstaSteps(true);

    // increment step counter
    setCurrentStep((prev) => {
      const nextStep = prev + 1;
      return nextStep < stepImages.length ? nextStep : prev; // Prevent incrementing beyond array length
    });

    try {
      // copy link url
      if (linkGenerated && generatedLink && generatedElements) {
        if (currentStep === 2) {
          await navigator.clipboard.writeText(generatedLink);
          setCaution("Link copied to clipboard!");
          // clear alert after 3 seconds
          setTimeout(() => setCaution(null), 3000);
        }
        // if the user is on step 4, send them to instagram
        if (currentStep === 3) {
          try {
              // navigate back to the home page
              navigate("/");
              const instaUrl = "https://instagram.com/";
              // Open the Instagram page in a new window
              window.open(instaUrl, "_blank");
          } catch (error) {
            console.error('could not open window to instagram', error);
            // Provide feedback to the user about the failure
          }
        }
      }
    } catch (error) {
      setCaution("Could not copy link. Please try again later.");
      setTimeout(() => setCaution(null), 3000);
    }
  };

  const stepImages = [
    generatedElements.length > 0 ? generatedElements[selectedImageIndex] : null,
    "/assets/ig-1-final.gif",
    "/assets/ig-2-final.gif",
    "/assets/ig-3-final.gif",
  ];

  const stepInstructions = [
    "Optional: download image",
    "Create a story, then click the sticker button",
    "Add a link sticker",
    "Paste your link and post",
  ];


  const handleDownload = (index) => {
    if(currentStep === 0) {
      // use share api in the sharepostmodal component to download image
      // hook will determine if the api is useable
      setDownloadViaShareAPI(index)
    } 
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
          {/* download section */}
          <div className="download-button-cont">
            {currentStep === 0 && loadingShareAPI && (
                <ReactLoading type={'balls'} color={'white'} height={'15%'} width={'15%'} />
            )}

            {currentStep === 0 && !loadingShareAPI && ( // ensure this section is not shown if share API is working 
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
  // setDownloadFunction: PropTypes.func,
  setDownloadViaShareAPI: PropTypes.func,
  loadingShareAPI: PropTypes.bool,
};
