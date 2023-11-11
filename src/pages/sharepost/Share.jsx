import './Share.css'
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import { useContext, useRef, useState, useEffect } from 'react';
import { IoArrowBackOutline } from "react-icons/io5";
import SliderButton  from '../../components/share/SliderButton';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Gift from '../../components/post/Gift';
import CurrencyList from '../../components/post/CurrencyList';
import {IoIosArrowDropdown} from 'react-icons/io';
import SelectedItemDetails from './SelectedItemDetails';
import SelectedCurrencyDetails from './SelectedCurrencyDetails';
import SharePostModal from '../../components/post/sharepost/SharePostModal';
import Resizer from "react-image-file-resizer";
import config from "../../config";
import Popup from '../../components/popup/Popup';

export default function Share() {
const {user} = useContext(AuthContext)

const desc = useRef();
const [file, setFile] = useState(null);
const navigate = useNavigate();
// default gift and type dropdowns
const [transactionType, setTransactionType] = useState('');
const [selectionType, setSelectionType] = useState('');
// used to set each dropdown to open or closed
const [giftDropdownOpen, setGiftDropdownOpen] = useState(false);
const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
// used in the dropdown setting items
const [defaultGiftText, setDefaultGiftText] = useState("Select Gift");
const [defaultTypeText, setDefaultTypeText] = useState("Select Type");
// share post logic
const [isModalOpen, setIsModalOpen] = useState(false);

const [details, setDetails] = useState(null);

// used in the slider for allowing gifts
const [allowGifts, setAllowGifts] = useState(true);
const [showPopup, setShowPopup] = useState(false);
const [popupMessage, setPopupMessage] = useState(''); 

// function to show popup used in the catch blocks
const popupStatus = async (message) => {
setPopupMessage(message);
setShowPopup(true);
}

// used in the settings form
const handleSubmit = (e) => {
    // Prevent default form submission behavior
    e.preventDefault();
  
    if (givesState && transactionType && selectionType && (selectedItem || selectedAmount)) {
      // Check if the user has selected a quantity if the transaction type is "Give" and selection type is "Currency"
      if (transactionType === 'Give' && selectionType === 'Currency' && quantity === "") {
        popupStatus('Please enter how many times this link can be used', "Close")
        return;
      }
  
      // Update details that are used in the item popup modal
      const newDetails = updateDetails();
      setDetails(newDetails);
      setIsModalOpen(true);
    } else {
        popupStatus('Please select a gift type, gift, and to give or receive.', "Close")
        setIsModalOpen(false);
    }
  };


const submitHandler = async (e) => {
    e.preventDefault()
    const newPost = {
        userId: user._id,
        desc: desc.current.value,
        allowGifts: allowGifts
    };
    if (file) {
        try{
            const resizedFile = await resizeImage(file);
            const data = new FormData();
            data.append('file', resizedFile);
            //resopnse will have the file url 
            //which can be used to retrieve the uploaded file
            const response = await axios.post(`${config.apiUrl}/api/upload`, data);
            newPost.img = response.data.url;
        } catch (err) {
            popupStatus('An error occurred when trying to upload a file. Please try again later.', "Close")
        }
    }

    try {
        await axios.post(`${config.apiUrl}/statuses/api/statuses`, newPost);
        // navigate back to the previous page
        navigate(-1);
    } catch (err) {
        popupStatus('An error occured when trying to upload this post. Please try again later.', "Close")
    }
};

const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const maxWidth = 1000;
      const maxHeight = 1000;
      const compressFormat = "JPEG";
      const quality = 90;
      const rotation = 0;
      const outputType = "blob";
  
      Resizer.imageFileResizer(
        file,
        maxWidth,
        maxHeight,
        compressFormat,
        quality,
        rotation,
        (resizedFile) => {
          resolve(resizedFile);
        },
        outputType,
        null,
        null,
        (error) => {
          reject(error);
        }
      );
    });
};

// underline and post type logic 

// set the underline to posts or gives on profile 
const [isUnderlined, setIsUnderlined] = useState(true);

// slide to gives feed
const [givesState, setGivesState] = useState(false);
const hasToggled = () => {
    setGivesState(true);
    setIsUnderlined(false);
};

const resetHasToggled = () => {
  setGivesState(false);
  setIsUnderlined(true);
};

let togglePostType = givesState ? ' active' : '';

// resets toggle gives feed on reload
useEffect(() => {
  resetHasToggled();
}, []);


// use state for currency amounts popup
const [seenGifts, setseenGifts] = useState(false);
const [seenMoney, setSeenMoney] = useState(false);

// function for gift item popup
const toggleGift = () => {
    if (!seenGifts) {
        setseenGifts(!seenGifts);
        setSeenMoney(false); // Hide the other component
    }};

// function for give currency popup
const toggleAmounts = () => {
    if (!seenMoney) {
        setSeenMoney(!seenMoney);
        setseenGifts(false); // Hide the other component
    } else if (seenMoney) {
        setSeenMoney(false);
    }

};


/* SELECTED ITEM HANDLING LOGIC BELOW */    

// used for the selected item
const [selectedItem, setSelectedItem] = useState(null);
const [showItem, setShowItem] = useState(false);

const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowItem(true);
    setseenGifts(false); // used to hide the item list when a selection is made

};

// used for exiting the item
const clearSelectedItem = () => {
    setSelectedItem(null);
    setShowItem(false);
    setseenGifts(true); // used to hide the item list when a selection is made
};

/* CURRENCY AMOUNT HANDLING LOGIC BELOW */

// used for the selected currency amount
const [selectedAmount, setSelectedAmount] = useState(null);
const [showCurrency, setShowCurrency] = useState(false);
const [quantity, setQuanity ] = useState('');

const handleCurrencyClick = (amount) => {
    setSelectedAmount(amount);
    setShowCurrency(true);
    setSeenMoney(false); // used to hide the currency list when a selection is made
    setseenGifts(false); // used to hide the item list when a selection is made
};

// used for exiting the currency amount
const clearSelectedCurrency = () => {
    setSelectedAmount(null);
    setShowCurrency(false);
    setSeenMoney(true);
    setseenGifts(false);
};

    // used to set the details of the link model
    // used in the link generator component
    // used in the selected item details component
    const updateDetails = () => {
        let newDetails = {
            type: selectionType.toLowerCase(),
            amount: selectedAmount,
            giveorreceive: transactionType.toLowerCase(),
            quantity: quantity || 1,
            title: selectedItem?.title || null,
            photo: selectedItem?.image.imageUrl || null,
            itemId: selectedItem?.itemId || null,
        };

        // If it's a currency, update the amount and set the other fields to null
        if (selectionType === "Currency") {
            newDetails.amount = selectedAmount;
            newDetails.quantity = quantity || 1;
            newDetails.title = null;
            newDetails.photo = null;
            newDetails.itemId = null;
        }

        // If it's an item, update the title, photo, and itemId
        if (selectionType === "Item") {
            let itemAmount = 0;

            if (selectedItem.price) {
                itemAmount += Number(selectedItem.price.value);
            }
            
            if (selectedItem.shippingOptions && selectedItem.shippingOptions.length > 0) {
                itemAmount += Number(selectedItem.shippingOptions[0].shippingCost.value);
            }
            
            newDetails.amount = itemAmount;
            newDetails.title = selectedItem.title;
            newDetails.photo = selectedItem.image.imageUrl;
            newDetails.itemId = selectedItem.itemId;
        }
        return newDetails;
    };

    // used to set the "allow gifts" setting for the post
    const handleSliderChanges = (isChecked) => {
        setAllowGifts(isChecked);
    };

return (

    <div className='share'>
        <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />
        <div className="back-button-container">
            <Link to="/">
                <IoArrowBackOutline className='backButton' />
            </Link>
        </div>
        <div className="postOrLinkContainer">
            <p 
                style={{ textDecoration: isUnderlined ? 'underline' : 'none' }}
                onClick={resetHasToggled}
                >Post
            </p>
            <p 
                style={{ textDecoration: isUnderlined ? 'none' : 'underline' }}
                onClick={hasToggled}
                >Link
            </p>

        </div>
        <div className={`shareWrapper${togglePostType}`}>
            <div className="shareTop">

                <img className='shareProfileImg' 
                src={
                    user.profilePicture ? 
                    user.profilePicture : 
                    "/assets/person/nopicture.png"} 
                    alt="" />
                <input 
                placeholder= 'How are you feeling today?' 
                className='shareInput'
                ref={desc}
                />
            </div>
                
            <div className="shareOptions">
            {file && (
                <div className="shareImgContainer">
                    <img src={URL.createObjectURL(file)} alt="" className="shareImg" />
                    <CancelIcon className='shareCancelImg' onClick={() => setFile(null)}/>
                </div>
            )}
            <form onSubmit={submitHandler}>
            <hr className='shareHR'/>
                
                <div className="toggleandPhoto">

                    <div className="sliderContainer">
                        <SliderButton onChange={handleSliderChanges}/>
                        <p>Allow Gifts</p>
                    </div>

                    <label htmlFor='file' className="shareOption">
                        <AddPhotoAlternateOutlinedIcon className='shareIcon'/>
                        <p className='shareOptionText'>Add Photo</p>
                        <input style={{display:'none'}} type="file" id="file" accept='.png,.jpeg,.jpg' onChange={(e) => setFile(e.target.files[0])} />
                    </label>
                    
                </div>
                    <div className="shareButtonContainer">
                        <button className='shareButton' type='submit'>Share</button>
                    </div>
            </form>
            </div>
        </div> 
       
        <div className={`createLinkWrapper${togglePostType}`}>
            <div className="top-card">

                <div className="linkOptions">
                    <div className="shareTop">
                        {/* <img 
                            className='shareProfileImg' 
                            src={
                                user.profilePicture ? 
                                user.profilePicture : 
                                "/assets/person/nopicture.png"} 
                                alt="" 
                        /> */}
                    </div>
                </div>

                <div className="gift-selected-item">
                    {seenGifts && <Gift onItemClick={handleItemClick} />}
                    {showItem && !seenGifts && !seenMoney &&
                    <SelectedItemDetails 
                        item={selectedItem}
                        clearSelectedItem={clearSelectedItem}/>}
                
                    {seenMoney && <CurrencyList onAmountClick={handleCurrencyClick}/>}
                    {showCurrency && !seenGifts && !seenMoney && 
                    <SelectedCurrencyDetails 
                        amount={selectedAmount} 
                        giveorreceive={transactionType}
                        clearSelectedCurrency={clearSelectedCurrency}/>
                    }
                </div>
            <div className="settings-form-container">

                <form className='settingsForm' onSubmit={handleSubmit}>
                    <div className='radioContainer'>
                    <div className="left-side-settings">
                        <div className='giveOrReceive'>
                            <div className="customDropdown" onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}>
                                    {defaultTypeText}
                                    <IoIosArrowDropdown className='dropdownIcon'/>
                                <span>{transactionType}</span>
                                {typeDropdownOpen && (
                                    <ul className="dropdownOptions">
                                    <li 
                                    onClick={() => {
                                        setDefaultTypeText(""); // Clear the default text
                                        setTransactionType("Give")
                                        }}
                                        >Give</li>
                                    <li onClick={() => {
                                        setDefaultTypeText(""); // Clear the default text
                                        setTransactionType("Receive")
                                        }}
                                        >Receive</li>
                                    </ul>
                                )}
                            </div>
                        </div>
                        
                            <div className='itemOrCurrency'>
                                <div className="customDropdown" onClick={() => setGiftDropdownOpen(!giftDropdownOpen)}>
                                    {defaultGiftText}
                                    <IoIosArrowDropdown className='dropdownIcon'/>
                                <span>{selectionType}</span>
                                {giftDropdownOpen && (
                                    <ul className="dropdownOptions">
                                    <li 
                                    onClick={() => {
                                        setDefaultGiftText(""); // Clear the default text
                                        setSelectionType("Item")
                                        toggleGift()}}
                                        >Item</li>
                                    <li onClick={() => {
                                        setDefaultGiftText(""); // Clear the default text
                                        setSelectionType("Currency")
                                        toggleAmounts()}}
                                        >Currency</li>
                                    </ul>
                                )}
                                </div>
                            </div>
                            { details && isModalOpen && (
                                <SharePostModal 
                                isOpen={isModalOpen} 
                                closeModal={() => setIsModalOpen(false)} 
                                details={details} />
                            )}

                    </div>
                        <div className="bottom-row-container">
                            {/* quantity of currency gifts */}
                            { selectionType === "Currency" && transactionType === "Give" &&
                                <div className="numberInputContainer">
                                    <label htmlFor="quantity"></label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        name="quantity"
                                        value={quantity}
                                        onChange={(e) => setQuanity(e.target.value)}
                                        min="1"
                                        step="1"
                                        placeholder='Quantity'
                                    />
                                </div>
                            }

                    </div>
                    </div>
                </form>
            </div>
        </div>
        <div className="instructions-middle-card">
            <p>Creating a link will adjust your account balance. Unused links will refund the balance after 24 hours.</p>
        </div>
        <div className="shareButtonContainer">
            <button className="shareButton" type="submit">Create</button>
        </div>
    </div>
</div>
)}