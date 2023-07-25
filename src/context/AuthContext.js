import {createContext, useReducer} from 'react';
import AuthReducer from './AuthReducer';
import React, {useEffect, useState} from 'react';
import {getUser} from '../apiCalls';
import PropTypes from 'prop-types';
import axios from 'axios';

const INITIAL_STATE = {
    user: null,
    balance: 0,
    updateBalance: () => {},
    isFetching:false,
    error:false
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

    useEffect(() => {
      getUser(dispatch);
    }, []);

    const [balance, setNewBalance] = useState(0);

    const updateBalance = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setNewBalance(0); // set balance to 0 with no token
        return;
      }
    try {
      const response = await axios.get("/api/billing-settings-balance", {
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
                dispatch
             }}
             >
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