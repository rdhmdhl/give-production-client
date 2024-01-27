import React, { useEffect } from "react";
import PropTypes from "prop-types";
import "./ImageTemplate.css";
// import { toPng } from "html-to-image";

// Generate an array of react components that will be rendered as image thumbails for
// the user to download!

const ImageTemplate = ({ 
  details, 
  setIsLoadingImage, 
  setGeneratedElements }) => {
  // USED FOR GENERATING IMAGES FOR DOWNLOADING AND POSTING ON SOCIALS
  // const [loadedImage1, setLoadedImage1] = useState(false);
  // const [loadedImage2, setLoadedImage2] = useState(false);
  // const [loadedImage3, setLoadedImage3] = useState(false);
  // const [loadedImage4, setLoadedImage4] = useState(false);
  // const [loadedImage5, setLoadedImage5] = useState(false);

  // define different image styles
  const templates = [
    "standard",
    "purple-gradient",
    "green-gradient",
    "blue-gradient",
    "orange-gradient",
  ];

  let cta = "";

  if (!details) {
    return null;
  }

  if (details.giveorreceive === "give") {
    cta = "Let me make your day. Accept anonymously.";
  }
  if (details.giveorreceive === "receive") {
    cta = "Make my day, anonymously.";
  }

  useEffect(() => {
    // Create an array of React components for each template
    const elements = templates.map((template, index) => (
      <div key={index} className={`image-template ${template}`}>
        {details.type === "item" && (
          <>
            <div className="cta-headline-container">
              <h3 className="cta-headline">{cta}</h3>
            </div>
            <div className="img-container">
              <img src={details.photo} alt="" />
            </div>
            <div className="item-details-container">
              <h3 className="item-details-img-temp">{details.title}</h3>
            </div>
          </>
        )}
        {details.type === "currency" && (
          <>
            <div className="cta-headline-container">
              <h3 className="currency-cta-headline">{cta}</h3>
            </div>
            <div className="currency-amount">
              <h4>${details.amount}</h4>
            </div>
            {details.giveorreceive === "give" && (
              <div className="currency-details-container">
                <p>{details.quantity} available</p>
              </div>
            )}
          </>
        )}
      </div>
    ));

    // Pass these elements to the parent component
    setGeneratedElements(elements);
    setIsLoadingImage(false);
  }, [details, setGeneratedElements]);

  // Render nothing as these elements are handled by the parent
  return null;
};

export default ImageTemplate;

ImageTemplate.propTypes = {
  setIsLoadingImage: PropTypes.func,
  setGeneratedElements: PropTypes.func,
  details: PropTypes.shape({
    type: PropTypes.string,
    title: PropTypes.string,
    amount: PropTypes.number,
    giveorreceive: PropTypes.string,
    quantity: PropTypes.number,
    photo: PropTypes.string,
  }),
};
