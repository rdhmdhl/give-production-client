import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./ImageTemplate.css";
import { toPng } from "html-to-image";

const ImageTemplate = ({ details, setIsLoadingImage, setGeneratedImage }) => {
  const [imageLoaded, setImageLoaded] = useState(true);

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
    if (details) {
      if (details.type === "item" && details.photo) {
        // reset for new image
        setImageLoaded(false);
      } else {
        // no image to load
        setImageLoaded(true);
      }

      setIsLoadingImage(true);
      const element = document.querySelector(".image-template");

      if (imageLoaded){
        toPng(element)
          .then((dataUrl) => {
            setGeneratedImage(dataUrl);
            setIsLoadingImage(false);
          })
          .catch((error) => {
            console.error("Could not generate image:", error);
            setIsLoadingImage(false);
          });
      }
    }
  }, [details, imageLoaded]);

  return (
    <div className="image-template">
      {details.type === "item" && (
        <>
          <div className="cta-headline-container">
            <h3 className="cta-headline">{cta}</h3>
          </div>
          <div className="img-container">
            <img
              src={details.photo}
              alt=""
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
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
      {/* {details.photo && <img src={details.photo} alt="Item" />} */}
      {/* Additional styling and layout */}
    </div>
  );
};

export default ImageTemplate;

ImageTemplate.propTypes = {
  setIsLoadingImage: PropTypes.func,
  setGeneratedImage: PropTypes.func,
  details: PropTypes.shape({
    type: PropTypes.string,
    title: PropTypes.string,
    amount: PropTypes.number,
    giveorreceive: PropTypes.string,
    quantity: PropTypes.number,
    photo: PropTypes.string,
  }),
};
