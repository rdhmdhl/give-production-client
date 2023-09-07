import React, { useState, useContext }from 'react';
import propTypes from 'prop-types';
import {AiOutlineClose} from 'react-icons/ai';
import { FiSettings } from "react-icons/fi";
import axios from 'axios';
import './AccountBalanceModal.css';
import { AuthContext } from '../context/AuthContext';
import config from '../config';

function AccountBalanceModal({isModalOpen, closeModal, balance }) {

const [addFundsClicked, setAddFundsClicked] = useState(false);
const [withdrawalClicked, setWithdrawalClicked] = useState(false);
const [value, setValue] = useState('');

const { user, dispatch } = useContext(AuthContext);

const editBalance = async () => {
  try {
    // if add funds button is clicked
    if (addFundsClicked) {
      if (value > 0 & value < 1000000) {
        setValue(value);
        const updateBalance = {
          userId: user._id,
          balance: value
        }
        const token = localStorage.getItem("token");
        const response = await axios.post(`${config.apiUrl}/api/billing-settings-deposit`, updateBalance, {
          headers: {
            'x-auth-token': token
          }
        });
        // Dispatch the UpdateBalance action with the new balance
        dispatch({type: "UPDATE_BALANCE", payload: response.data.new_balance}); // Replace 'new_balance' with the actual property name in the response

        closeModal();
    
      }
      else {
        alert("Please enter a valid amount");
      }
  }
  // if withdrawal button is clicked
  if (withdrawalClicked) {
    if (value > 0 & value < 1000000) {
      setValue(value);
      const updateBalance = {
        userId: user._id,
        balance: value
      }
      const token = localStorage.getItem("token");
      const response = await axios.post(`${config.apiUrl}/api/billing-settings-withdrawal`, updateBalance, {
        headers: {
          'x-auth-token': token
        }
      });

      // Dispatch the UpdateBalance action with the new balance
      dispatch({type: "UPDATE_BALANCE", payload: response.data.new_balance}); // Replace 'new_balance' with the actual property name in the response

      closeModal();
    }
    else {
      alert("Please enter a valid amount");
    }

  }

  } catch (error) {
    alert("You cannot withdraw more than what is in your account."); 
  }
}

  return (
    <div className={`modal ${isModalOpen ? 'open' : ''}`} onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="top-left-icons">
            <AiOutlineClose className='close-icon' onClick={closeModal}/>
            <FiSettings className='' onClick={closeModal}/>
            </div>
            <h2>Account balance: ${balance.toFixed(2)}</h2>
            <div className="balance-buttons">
                <button 
                  type="button" 
                  onClick={() => {
                    setAddFundsClicked(true)
                    setWithdrawalClicked(false)
                  }}>
                  Add Funds
                </button>

                <button 
                  type="button" 
                  onClick={() => {
                      setAddFundsClicked(false)
                      setWithdrawalClicked(true)
                    }}>
                  Withdrawal
                </button>
            </div>
            
            {addFundsClicked || withdrawalClicked ? 
            <div className='input-container'>
              <label htmlFor="value"></label>
              <input 
                className='input-element'
                type="number"
                id="value"
                name="value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                min="1"
                step="1"
                placeholder='value'
              />
              <button 
                type="button" 
                className='add-button' 
                onClick={editBalance}>
                {addFundsClicked === true ? 'Add' : 'Withdrawal'}
              </button>
            </div>
            
              : null}
              
        </div>
    </div>
  )
}

export default AccountBalanceModal

AccountBalanceModal.propTypes = {
    isModalOpen: propTypes.bool,
    closeModal: propTypes.func,
    balance: propTypes.number,
    // setupdateAmount: propTypes.func
}