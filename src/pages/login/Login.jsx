import { useContext, useRef } from 'react';
import './Login.css'
import { loginCall } from '../../apiCalls';
import {AuthContext} from '../../context/AuthContext';
import { CircularProgress } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const email = useRef();
  const password = useRef();
  const {isFetching, dispatch} = useContext(AuthContext);
  const navigate = useNavigate();

  
  const handleClick = (e) => {
    e.preventDefault();
    loginCall({email:email.current.value, password:password.current.value},
      dispatch
    );
  };
    
  const register = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <img
        className='loginImg'
        src={"/assets/login-background.png"}
        alt='login-background'
      />
        <div className="loginWrapper">
          
                <h3 className="loginLogo">G_VE</h3>
                <form className="loginBox" onSubmit={handleClick}>
                    <input placeholder='Email' type='email'  className="loginInput" ref={email} required/>
                    <input placeholder='Password' 
                    type='password' 
                    minLength={6} 
                    className="loginInput" 
                    ref={password}
                    required 
                    />
                    <button className="loginButton" type="Submit" disabled={isFetching}>
                      {isFetching ? <CircularProgress size="20px"/> : "Log In"}
                    </button>
                    {/* <span className="loginForgot">Forgot Password?</span> */}
                    <button className="createaccount" onClick={register}>
                    {isFetching ? <CircularProgress size="20px"/> : "Create Account"}
                    </button>
                </form>
        </div>
    </div>
  )
}
