import axios from 'axios';
import config from './config'

export const loginCall = async (userCredentials, dispatch) => {
    dispatch({type: "LOGIN_START"});
    try {
        const res = await axios.post(`${config.apiUrl}/api/auth/login`, userCredentials, {
          withCredentials: true
        });
        // extract the token from the response
        const token = res.data.token;
        
        // store the token in the local storage
        localStorage.setItem("token", token);
        
        // continue with the dispatch
        dispatch({ type: "LOGIN_SUCCESS", payload: res.data.user, token: res.data.token });
      } catch (err) {
        dispatch({ type: "LOGIN_FAILURE", payload: err });
      }
};

export const getUser = async (dispatch) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    try {
      const res = await axios.get(`${config.apiUrl}/api/auth/me`, {
        headers: {
            "x-auth-token": token,
          },
      });
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
    } catch (error) {
      alert('Log in or register to gain access to all features')
    }
  };

  export const getBalance = async (dispatch) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return Promise.resolve(0); // return a promise that resolves to 0
    }
    try {
      const res = await axios.get(`${config.apiUrl}/api/billing-settings-balance`, {
        headers: {
            "x-auth-token": token,
          },
      });
      dispatch({ type: "UPDATE_BALANCE", payload: res.data.balance });
    } catch (error) {
      alert('An unexpected error occurred when fetch your balance. Please try again later.')
    }
  };