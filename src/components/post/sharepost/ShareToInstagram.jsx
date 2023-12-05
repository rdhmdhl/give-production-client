import React, { useState } from "react";
import { FaCircle } from "react-icons/fa";
import { MdDownload } from "react-icons/md";
import PropTypes from "prop-types";
const ShareToInstagram = ({
  linkGenerated,
  generatedLink,
  generatedImage,
  isLoadingImage,
  downloadImage
}) => {
  const [showInstaSteps, setShowInstaSteps] = useState(true);

  const [currentStep, setCurrentStep] = useState(0);

  const [caution, setCaution] = useState(null);

  //   useEffect(() => {
  //     try {
  //       shareToInstagramStory();
  //     } catch (error) {}
  //   }, [shareToInstagramStory]);

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

  return (
    <>
      {/* instagram steps */}
      {showInstaSteps && !isLoadingImage && generatedImage && (
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
        </div>
      )}
    </>
  );
};

export default ShareToInstagram;

ShareToInstagram.propTypes = {
    linkGenerated: PropTypes.bool,
    generatedLink: PropTypes.string,
    generatedImage: PropTypes.string,
    isLoadingImage: PropTypes.bool,
    downloadImage: PropTypes.func
}