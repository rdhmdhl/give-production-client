import { useContext, useRef } from 'react';
import './Login.css'
import { loginCall } from '../../apiCalls';
import {AuthContext} from '../../context/AuthContext';
import { CircularProgress } from '@mui/material';
import React from 'react';

export default function Login() {
  const email = useRef();
  const password = useRef();
  const {isFetching, dispatch} = useContext(AuthContext);
  
  const handleClick = (e) => {
    console.log("handleclick");
    e.preventDefault();
    loginCall({email:email.current.value, password:password.current.value},
      dispatch
    );
  };

  return (
    <div className="login-container">
        <div className="loginWrapper">
          <p className='loginDesc'>Welcome! Please log in.</p>
          <form className="loginBox" onSubmit={handleClick}>
            <input 
              placeholder='Email'
              type='email'  
              className="loginInput" 
              ref={email} required/>
            <input 
              placeholder='Password' 
              type='password' 
              minLength={6} 
              className="loginInput" 
              ref={password}
              required 
            />
            {/* <span className="loginForgot">Forgot Password?</span> */}
            <div className="login-button-container">
              <button className="loginButton" type="Submit" disabled={isFetching}>
                {isFetching ? <CircularProgress size="20px"/> : "Log In"}
              </button>
            </div>
          </form>
        </div>
    </div>
  )
}
