import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import { toJpeg } from 'html-to-image';

const DownloadImage = ({ details, template, downloadFunction }) => {

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


    // Function to download the image with a white background
    const downloadImageWithBackground = () => {
        // const elementId = `image-template-${index}`;
        const element = document.getElementsByClassName("download-image-container")[0];

            toJpeg(element, {quality: 0.97})
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'image.jpeg';
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.log("error downloading image", err);
            })
        }

    useEffect(() => {
        if(downloadFunction !== null){
        downloadImageWithBackground(downloadFunction);
        }
    }, [downloadFunction])

    return (
        <div className={`download-image-container ${templates[template]}`} >
            <div className='downloaded-image'>
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
        </div>
    )
    };

export default DownloadImage

DownloadImage.propTypes = {
    // ImageTemplate: PropTypes.element,
    downloadFunction: PropTypes.number,
    template: PropTypes.number,
    details: PropTypes.shape({
        type: PropTypes.string,
        title: PropTypes.string,
        amount: PropTypes.number,
        giveorreceive: PropTypes.string,
        quantity: PropTypes.number,
        photo: PropTypes.string,
      }),
};