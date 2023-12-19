import "./Share.css";
import { useState, useEffect } from "react";
// import { AuthContext } from '../../context/AuthContext';
// import axios from 'axios';
import React from "react";
import Gift from "../../components/post/Gift";
import CurrencyList from "../../components/post/CurrencyList";
import { IoIosArrowDropdown } from "react-icons/io";
import SelectedItemDetails from "./SelectedItemDetails";
import SelectedCurrencyDetails from "./SelectedCurrencyDetails";
import SharePostModal from "../../components/post/sharepost/SharePostModal";
// import Resizer from "react-image-file-resizer";
// import config from "../../config";
import Popup from "../../components/popup/Popup";
// import { AuthContext } from '../../context/AuthContext';
export default function Share() {
  // const {user} = useContext(AuthContext)

  // const desc = useRef();
  // const navigate = useNavigate();
  // default gift and type dropdowns
  const [transactionType, setTransactionType] = useState("");
  const [selectionType, setSelectionType] = useState("");
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
  // const [allowGifts, setAllowGifts] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // function to show popup used in the catch blocks
  const popupStatus = async (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  };

  // used in the settings form
  const handleSubmit = (e) => {
    // Prevent default form submission behavior
    e.preventDefault();

    if (transactionType && selectionType && (selectedItem || selectedAmount)) {
      // Check if the user has selected a quantity if the transaction type is "Give" and selection type is "Currency"
      if (
        transactionType === "Give" &&
        selectionType === "Currency" &&
        quantity === ""
      ) {
        popupStatus(
          "Please enter how many times this link can be used",
          "Close"
        );
        return;
      }

      // Update details that are used in the item popup modal
      const newDetails = updateDetails();
      setDetails(newDetails);
      setIsModalOpen(true);
    } else {
      popupStatus(
        "Please select give or receive, item or currency, and the item or currency amount.",
        "Close"
      );
      setIsModalOpen(false);
    }
  };

  // resets details on selection type
  useEffect(() => {
    setDetails(null);
    setSelectedAmount(null);
    setSelectedItem(null);
    console.log("reseting the details");
  }, [selectionType]);

  // use state for currency amounts popup
  const [seenGifts, setseenGifts] = useState(false);
  const [seenMoney, setSeenMoney] = useState(false);

  // function for gift item popup
  const toggleGift = () => {
    if (!seenGifts) {
      setseenGifts(!seenGifts);
      setSeenMoney(false); // Hide the other component
    }
  };

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

  /* CURRENCY AMOUNT HANDLING LOGIC BELOW */
  // used for the selected currency amount
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [showCurrency, setShowCurrency] = useState(false);
  const [quantity, setQuanity] = useState("");

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowItem(true);
    setseenGifts(false); // used to hide the item list when a selection is made
    setSelectedAmount(null);
  };

  // used for exiting the item
  const clearSelectedItem = () => {
    setSelectedItem(null);
    setShowItem(false);
    setseenGifts(true); // used to hide the item list when a selection is made
  };

  const handleCurrencyClick = (amount) => {
    setSelectedAmount(amount);
    setShowCurrency(true);
    setSeenMoney(false); // used to hide the currency list when a selection is made
    setseenGifts(false); // used to hide the item list when a selection is made
    setSelectedItem(null);
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
    const imageUrl = selectedItem?.thumbnailImages?.[0]?.imageUrl || null;
    const lowerResolutionUrl = imageUrl
      ? imageUrl.replace(/s-l\d+\.jpg$/, "s-l800.jpg")
      : null;

    let newDetails = {
      type: selectionType.toLowerCase(),
      amount: null,
      giveorreceive: transactionType.toLowerCase(),
      quantity: null,
      title: null,
      photo: null,
      itemId: null,
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

      if (
        selectedItem.shippingOptions &&
        selectedItem.shippingOptions.length > 0
      ) {
        itemAmount += Number(
          selectedItem.shippingOptions[0].shippingCost.value
        );
      }

      newDetails.amount = itemAmount;
      newDetails.quantity = 1;
      newDetails.title = selectedItem.title;
      (newDetails.photo =
        selectedItem?.thumbnailImages?.length > 0 ? lowerResolutionUrl : null),
        (newDetails.itemId = selectedItem?.itemId || null);
    }
    console.log(newDetails);
    return newDetails;
  };

  return (
    <div className="share">
      <Popup
        isPopupOpen={showPopup}
        message={popupMessage}
        button1Text="Close"
        button1Action={() => setShowPopup(false)}
      />

      <div className="createLinkWrapper">
        <div className="top-card">
          <div className="linkOptions">
            <div className="shareTop"></div>
          </div>

          <div className="gift-selected-item">
            {seenGifts && <Gift onItemClick={handleItemClick} />}
            {showItem && !seenGifts && !seenMoney && (
              <SelectedItemDetails
                item={selectedItem}
                clearSelectedItem={clearSelectedItem}
              />
            )}

            {seenMoney && <CurrencyList onAmountClick={handleCurrencyClick} />}
            {showCurrency && !seenGifts && !seenMoney && (
              <SelectedCurrencyDetails
                amount={selectedAmount}
                giveorreceive={transactionType}
                clearSelectedCurrency={clearSelectedCurrency}
              />
            )}
          </div>
          <div className="settings-form-container">
            <form className="settingsForm" onSubmit={handleSubmit}>
              <div className="radioContainer">
                <div className="left-side-settings">
                  <div className="giveOrReceive">
                    <div
                      className="customDropdown"
                      onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                    >
                      {defaultTypeText}
                      <IoIosArrowDropdown className="dropdownIcon" />
                      <span>{transactionType}</span>
                      {typeDropdownOpen && (
                        <ul className="dropdownOptions">
                          <li
                            onClick={() => {
                              setDefaultTypeText(""); // Clear the default text
                              setTransactionType("Give");
                            }}
                          >
                            Give
                          </li>
                          <li
                            onClick={() => {
                              setDefaultTypeText(""); // Clear the default text
                              setTransactionType("Receive");
                            }}
                          >
                            Receive
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="itemOrCurrency">
                    <div
                      className="customDropdown"
                      onClick={() => setGiftDropdownOpen(!giftDropdownOpen)}
                    >
                      {defaultGiftText}
                      <IoIosArrowDropdown className="dropdownIcon" />
                      <span>{selectionType}</span>
                      {giftDropdownOpen && (
                        <ul className="dropdownOptions">
                          <li
                            onClick={() => {
                              setDefaultGiftText(""); // Clear the default text
                              setSelectionType("Item");
                              setQuanity(1); // reset quantity to 1 when selecting
                              toggleGift();
                            }}
                          >
                            Item
                          </li>
                          <li
                            onClick={() => {
                              setDefaultGiftText(""); // Clear the default text
                              setSelectionType("Currency");
                              toggleAmounts();
                            }}
                          >
                            Currency
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                  {details && isModalOpen && (
                    <SharePostModal
                      isOpen={isModalOpen}
                      closeModal={() => setIsModalOpen(false)}
                      details={details}
                    />
                  )}
                </div>
                <div className="bottom-row-container">
                  {/* quantity of currency gifts */}
                  {selectionType === "Currency" &&
                    transactionType === "Give" && (
                      <div className="numberInputContainer">
                        <label htmlFor="quantity"></label>
                        <input
                          type="number"
                          id="quantity"
                          name="quantity"
                          value={quantity}
                          onChange={(e) => setQuanity(Number(e.target.value))}
                          min="1"
                          step="1"
                          placeholder="Quantity"
                        />
                      </div>
                    )}
                </div>
              </div>
              <div className="instructions-middle-card">
                <p>
                  Creating a link will adjust your account balance. Unused links
                  will refund the balance after 24 hours.
                </p>
              </div>
              {/* submit button */}
              <div className="shareButtonContainer">
                <button className="shareButton" type="submit">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
