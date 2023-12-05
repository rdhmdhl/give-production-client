import React, { useState } from "react";
import { FaCircle } from "react-icons/fa";
import { MdDownload } from "react-icons/md";
import config from "../../../config";
import PropTypes from "prop-types";
const ShareToInstagram = ({
  details,
  postUrl,
  linkGenerated,
  generatedLink,
  generatedImage,
  isLoadingImage,
  downloadImage,
}) => {
  const [showTwitterSteps, setshowTwitterSteps] = useState(true);

  const [currentStep, setCurrentStep] = useState(0);

  //   const [caution, setCaution] = useState(null);

  // useEffect(() => {
  //   try {
  //     shareToInstagramStory();
  //   } catch (error) {}
  // }, [shareToInstagramStory]);

  let peopleOrPerson;

  if (details.quantity > 1) {
    peopleOrPerson = "people";
  } else {
    peopleOrPerson = "person";
  }

  const shareToTwitter = () => {
    let text, url;
    // i guess this is used to conditionally render?
    setshowTwitterSteps(true);

    // increment step counter
    setCurrentStep((prev) => {
      const nextStep = prev + 1;
      return nextStep < stepInstructions.length ? nextStep : prev; // Prevent incrementing beyond array length
    });

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
      let textWithBreak = `${encodeURIComponent(text)}%0A%0A${encodeURIComponent(url)}`; // Adding two encoded newline characters

      const tweetUrl = `https://twitter.com/intent/tweet?text=${textWithBreak}`;
      

      if (currentStep === 1) {
        // Open the Twitter share dialog in a new window
        window.open(tweetUrl, "_blank");
      }
    }
  };

  const stepImages = [generatedImage, "/assets/step1.png"];

  //   const gifPositions = [
  //     { top: "0", left: "0", display: "none" }, // No display for step 1
  //     { top: "13.5rem", left: "-.15rem" }, // Position for step 2
  //   ];

  const stepInstructions = [
    "Optional: download image",
    "Click share, a tweet will be composed",
  ];

  return (
    <>
      {/* instagram steps */}
      {showTwitterSteps && !isLoadingImage && generatedImage && (
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
            {/* <img
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
            /> */}

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
  postUrl: PropTypes.string,
  linkGenerated: PropTypes.bool,
  generatedLink: PropTypes.string,
  generatedImage: PropTypes.string,
  isLoadingImage: PropTypes.bool,
  downloadImage: PropTypes.func,
};
