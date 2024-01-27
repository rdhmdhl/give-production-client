import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCircle } from "react-icons/fa";
import { MdDownload } from "react-icons/md";
import createScrollSnap from "scroll-snap";
import PropTypes from "prop-types";
const ShareToInstagram = ({
  linkGenerated,
  generatedLink,
  generatedElements,
  isLoadingImage,
  // downloadImage,
  selectedImageIndex,
  setSelectedImageIndex,
  setDownloadFunction
}) => {
  const [showInstaSteps, setShowInstaSteps] = useState(true);

  const [currentStep, setCurrentStep] = useState(0);

  const [caution, setCaution] = useState(null);


  
  const [isLastThumbnail, setIsLastThumbnail] = useState(false);
  const navigate = useNavigate();

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
          await navigator.clipboard.writeText(generatedLink);
          setCaution("Link copied to clipboard!");
          // clear alert after 3 seconds
          setTimeout(() => setCaution(null), 3000);
        }
        // if the user is on step 4, send them to instagram
        if (currentStep === 3) {
          // navigate back to the home page
          navigate("/");

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

  useEffect(() => {
    const container = document.querySelector(".image-selection-container");
    if (!container) return;
    
    // Function to calculate the average width of thumbnails
    const calculateAverageThumbnailWidth = () => {
      const thumbnails = container.querySelectorAll(".thumbnail");
      if (thumbnails.length === 0) return 0;
      
      const totalWidth = Array.from(thumbnails).reduce((total, thumbnail) => {
        const width = thumbnail.offsetWidth; // width with padding
        return total + (width);
      }, 0);

      return totalWidth / thumbnails.length;
    };

    // fucntion to determine and update the active thumbnail
    const updateActiveThumbnail = () => {
      const thumbnails = container.querySelectorAll(".thumbnail");
      let minDistance = Infinity;
      let closestIndex = -1;

      setIsLastThumbnail(selectedImageIndex === thumbnails.length - 1);

      // Use the scrollLeft as the reference point
      const referencePoint = container.scrollLeft;

      thumbnails.forEach((thumbnail, index) => {

        const thumbnailRect = thumbnail.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Calculate the start position of the thumbnail relative to the container's viewport
        const thumbnailStart = thumbnailRect.left - containerRect.left + container.scrollLeft;

        // find distance of the thumbnails center from the container's start
        const distance = Math.abs(thumbnailStart - referencePoint);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      if (closestIndex !== -1) {
        // update the active thumbnail based on the closest thumbnail
        setSelectedImageIndex(closestIndex);
      }
    };

    const handleScroll = () => {
      // Timeout should be greater than the scroll-snap duration
      setTimeout(updateActiveThumbnail, 350);
    };

    // Calculate average thumbnail width
    const averageThumbnailWidth = calculateAverageThumbnailWidth();
    const { bind, unbind } = createScrollSnap(
      container,
      {
        snapDestinationX: isLastThumbnail ? 'start' : `${averageThumbnailWidth}px`, // Snap to the width of each thumbnail
        snapDestinationY: "0%",
        timeout: 100,
        duration: 300,
        threshold: 0.2,
        snapStop: true, // Stop at each thumbnail without skipping
        easing: (t) => t, // Customize the easing function as needed
      },
      handleScroll
    );

    bind(); // attach the scroll snap behavior

    return () => {
      unbind(); // clean up scroll snap behavior
    };
  }, [generatedElements]);

  // Function to scroll to a specific thumbnail
const scrollToThumbnail = (index) => {
  const container = document.querySelector(".image-selection-container");
    if (!container) return;

  const thumbnails = container.querySelectorAll(".thumbnail");
  if (index < 0 || index >= thumbnails.length) return;

  const selectedThumbnail = thumbnails[index];

  let scrollPosition;
  if (index === thumbnails.length){
    // For the last thumbnail, scroll just enough to bring it into view
    scrollPosition = selectedThumbnail.offsetLeft - container.scrollLeft + selectedThumbnail.offsetWidth - container.offsetWidth;
  } else {
    // For other thumbnails, center them in the view
    scrollPosition = selectedThumbnail.offsetLeft - (container.offsetWidth - selectedThumbnail.offsetWidth) / 2;
  }

  container.scrollTo({
    left: scrollPosition,
    behavior: 'smooth'
  });
}

// Use the download function passed from ImageTemplate
// const handleDownloadClick = (index) => {
//   if (downloadFunction){
//     downloadFunction(index)
//   } else {
//     console.log("download function not available")
//   }
// };


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
                        scrollToThumbnail(index)
                      }}
                    >
                      {element}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="download-button-cont">
            {currentStep === 0 && <MdDownload onClick={() => setDownloadFunction(selectedImageIndex)} />}
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
  setDownloadFunction: PropTypes.func
};
