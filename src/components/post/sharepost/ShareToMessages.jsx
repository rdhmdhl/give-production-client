import React, { useState } from "react";
import { FaCircle } from "react-icons/fa";
import { MdDownload } from "react-icons/md";
import config from "../../../config";
import PropTypes from "prop-types";

function ShareToMessages({  
    details,
    postUrl,
    linkGenerated,
    generatedLink,
    generatedImage,
    isLoadingImage,
    downloadImage,}) {

    const [showMessageSteps, setShowMessageSteps] = useState(true);

    const [currentStep, setCurrentStep] = useState(0);

// Handle sharing via text message
  const shareToTextMessage = () => {
    setShowMessageSteps(true);

    // increment step counter
    setCurrentStep((prev) => {
        const nextStep = prev + 1;
        return nextStep < stepInstructions.length ? nextStep : prev; // Prevent incrementing beyond array length
        });

    // Check if the link is generated or if a postURL is provided
    if ((linkGenerated && generatedLink) || postUrl && currentStep === 1) {
      // Create the message text
      let text;
      let urlToShare = postUrl
        ? `${config.publicUrl}/${postUrl}`
        : generatedLink; // Use postURL if available, otherwise use generatedLink

      if (generatedLink && linkGenerated && details && currentStep === 1) {
        if (details.giveorreceive === "give" && details.type === "currency") {
          text = `Can I give you $${details.amount}?`;
        }
        if (
          details.giveorreceive === "receive" &&
          details.type === "currency"
        ) {
          text = `Wanna give me $${details.amount}?`;
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
        // Open the text message app (this example is for iOS)
        window.location.href = `sms:?&body=${encodedText}`;

      }
    }
  };

  const stepImages = [generatedImage, "/assets/messages-step2.jpeg"];

  const stepInstructions = [
    "Optional: download image",
    "Click share and go to messages",
  ];

  
  
  return (
    <>
    {/* instagram steps */}
    {showMessageSteps && !isLoadingImage && generatedImage && (
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
            className="step-image"
            src={stepImages[currentStep]}
            alt={`Step ${currentStep + 1} for sharing via messenger`}
          />
          <div className="download-button-cont">
            {currentStep === 0 && <MdDownload onClick={downloadImage} />}
          </div>
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
    generatedImage: PropTypes.string,
    isLoadingImage: PropTypes.bool,
    downloadImage: PropTypes.func,
  };
  