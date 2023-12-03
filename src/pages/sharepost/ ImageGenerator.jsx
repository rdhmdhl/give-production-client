// import React, { useContext, useState, useEffect } from "react";

const useImageGenerator = () => {

    const generatedImage = async (user, details, setGeneratedImage, setIsLoadingImage) => {
        setIsLoadingImage(true); // Set loading to true at the start

        try {
            return new Promise((resolve, reject) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
            
                // Set canvas size
                canvas.width = 800;
                canvas.height = 600;
            
                // Add your drawing logic here
                // For example, drawing text:
                ctx.fillStyle = 'black';
                ctx.font = '20px Arial';
                if(details.type === "currency") {
                    ctx.fillText(`Amount: ${details.amount}`, 20, 60);
                    if(details.giveorreceive === "give") {
                        ctx.fillText(`Links available: ${details.quantity}`, 20, 90);
                    }
                } else {
                    ctx.fillText(`Title: ${details.title}`, 20, 30);
                }
            
                // Load and draw the image
                if (details.photo) {
                    const image = new Image();
                    image.crossOrigin = "anonymous";
                    image.onload = () => {
                        ctx.drawImage(image, 20, 120); // Adjust position as needed

                        let imageDataUrl = canvas.toDataURL();
                        setGeneratedImage(imageDataUrl);
                        setIsLoadingImage(false);
                        resolve(imageDataUrl);
                    };
                    image.onerror = () => {
                        setIsLoadingImage(false);
                        reject('Image load error');
                      };
                      image.src = details.photo;
                } else {
                    // If there's no item image, generate the download link immediately
                    let imageDataUrl = canvas.toDataURL();
                    setGeneratedImage(imageDataUrl);
                    setIsLoadingImage(false);
                    resolve(imageDataUrl);
                }

            })
            
        } catch (error) {
            console.log("error in the image generator: ", error);
            setIsLoadingImage(false);
        }
    }
    return generatedImage;
}

// const generateDownloadLink = (canvas) => {
//     const imageURL = canvas.toDataURL();

//     const downloadLink = document.createElement('a');
//     downloadLink.href = imageURL;
//     downloadLink.download = 'link-image.png';
//     document.body.appendChild(downloadLink);
//     downloadLink.click();
//     document.body.removeChild(downloadLink);
//   };

export default useImageGenerator;