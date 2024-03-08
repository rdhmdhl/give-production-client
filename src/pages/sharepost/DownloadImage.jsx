import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import { toBlob } from 'html-to-image';

const DownloadImage = ({ details, template, downloadFunction }) => {
    if (!details) {
        return null;
    }
    let cta = "";
    // define different image styles
    const templates = [
        "standard",
        "purple-gradient",
        "green-gradient",
        "blue-gradient",
        "orange-gradient",
    ];

    if (details.giveorreceive === "give") {
        cta = "Let me make your day. Accept anonymously.";
    }
    if (details.giveorreceive === "receive") {
        cta = "Make my day, anonymously.";
    }

    // Function to download the image with a white background
    const downloadImageWithBackground = async () => {
        const element = document.getElementsByClassName("download-image-container")[0];
        if (!element) {
            console.error("Element not found");
            return;
        }
        try {
            const blob = await toBlob(element, {quality: 0.97});
            const file = new File([blob], "image.jpeg", { type: 'image/jpeg' });

             if (blob && file) {
                const shareData = {files: [file]}; 
                // if share api cannot be used, download file to download folder
                if (navigator.canShare && navigator.canShare(shareData)) {
                    // The browser supports the Web Share API and can share the file
                    try {
                      await navigator.share(shareData);
                    } catch (error) {
                      console.error("Error sharing the image");
                    }
                  } else {
                    // Fallback to downloading the file if sharing isn't supported
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = 'image.jpeg';
                    link.href = url;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }
            }
        } catch (err) {
            console.error("Error downloading image:", err);
        }
    }

    useEffect(() => {
        if(downloadFunction !== null){
        downloadImageWithBackground();
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