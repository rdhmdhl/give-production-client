import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./ImageTemplate.css";
import { toPng } from "html-to-image";

const ImageTemplate = ({ details, setIsLoadingImage, setGeneratedImage }) => {
  // USED FOR GENERATING IMAGES FOR DOWNLOADING AND POSTING ON SOCIALS
  const [loadedImage1, setLoadedImage1] = useState(false);
  const [loadedImage2, setLoadedImage2] = useState(false);
  const [loadedImage3, setLoadedImage3] = useState(false);
  const [loadedImage4, setLoadedImage4] = useState(false);
  const [loadedImage5, setLoadedImage5] = useState(false);

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
    console.log("useEffect hook is called");
    // Check if all images have been loaded
    const allImagesLoaded =
      loadedImage1 &&
      loadedImage2 &&
      loadedImage3 &&
      loadedImage4 &&
      loadedImage5;

    if (details && allImagesLoaded) {
      // setIsLoadingImage(true);
      setIsLoadingImage(true);
      console.log("details and all imagesloaded are valid");
      // generate images for each template
      Promise.all(
        templates.map((template, index) => {
          return new Promise((resolve, reject) => {
            const element = document.getElementById(`image-template-${index}`);

            if (element) {
              toPng(element)
                .then((dataUrl) => {
                  resolve(dataUrl);
                })
                .catch((err) => {
                  console.error(err);
                  reject(err);
                });
            } else {
              resolve(null); // resolve with if element is not found
            }
          });
        })
      )
        .then((images) => {
          console.log("generated images: ", images);
          setGeneratedImage(images);
          setIsLoadingImage(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoadingImage(false);
        });
          // Reset image loaded states after generation is done
          setLoadedImage1(false);
          setLoadedImage2(false);
          setLoadedImage3(false);
          setLoadedImage4(false);
          setLoadedImage5(false);
    }
  }, [details,  loadedImage1, loadedImage2, loadedImage3, loadedImage4, loadedImage5]);

  // render each template
  return (
    <>
      {templates.map((template, index) => (
        <div
          key={index}
          id={`image-template-${index}`}
          className={`image-template ${template}`}
        >
          {details.type === "item" && (
            <>
              <div className="cta-headline-container">
                <h3 className="cta-headline">{cta}</h3>
              </div>
              <div className="img-container">
                <img
                  src={details.photo}
                  alt=""
                  onLoad={() => {
                    if (index === 0) setLoadedImage1(true);
                    if (index === 1) setLoadedImage2(true);
                    if (index === 2) setLoadedImage3(true);
                    if (index === 3) setLoadedImage4(true);
                    if (index === 4) setLoadedImage5(true);
                  }}
                  onError={() => {
                    if (index === 0) setLoadedImage1(true);
                    if (index === 1) setLoadedImage2(true);
                    if (index === 2) setLoadedImage3(true);
                    if (index === 3) setLoadedImage4(true);
                    if (index === 4) setLoadedImage5(true);
                  }}
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
        </div>
      ))}
    </>
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
