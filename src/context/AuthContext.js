import {createContext, useReducer} from 'react';
import AuthReducer from './AuthReducer';
import React, {useEffect, useState} from 'react';
import {getUser} from '../apiCalls';
import PropTypes from 'prop-types';
import axios from 'axios';
import config from '../config';
import CallbackPopup from '../components/popup/CallbackPopup';

const INITIAL_STATE = {
    user: null,
    balance: 0,
    updateBalance: () => {},
    isFetching:false,
    error:false,
    isLoading: true
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('Log in or Register to Gain Full Access to all Features.');

    const showErrorPopup = (message) => {
      setPopupMessage(message);
      setShowPopup(true);
    };

    useEffect(() => {
      // When the user is fetched, set isLoading to false
      const fetchUser = async () => {
        await getUser(dispatch, showErrorPopup);
        dispatch({ type: 'SET_LOADING', payload: false });  // Add this line
      };
      fetchUser();
    }, []);

    const [balance, setNewBalance] = useState(0);

    // this doesn't really update the balance, it just retreives the balance.
    const updateBalance = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setNewBalance(0); // set balance to 0 with no token
        return;
      }
    try {
      const response = await axios.get(`${config.apiUrl}/api/billing-settings-balance`, {
        headers: {
          "x-auth-token": token,
        },
      });

      let newBalance = parseFloat(response.data.balance);

      if (isNaN(newBalance)) {
        newBalance = 0;
      }

      setNewBalance(newBalance);

    } catch (error) {
      alert("Error fetching user balance.");
    }
};


return (
  <AuthContext.Provider 
    value={{
      user:state.user, 
      balance: balance,
      updateBalance: updateBalance,
      isFetching:state.isFetching,
      error:state.error,
      isLoading: state.isLoading,
      dispatch,
    }}
  >
    {showPopup && <CallbackPopup message={popupMessage} onClose={() => setShowPopup(false)} />}
    {children}
  </AuthContext.Provider>
);
};

AuthContextProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired
};