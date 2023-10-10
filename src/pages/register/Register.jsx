import axios from 'axios';
import { useRef, useState } from 'react';
import './Register.css'
import {useNavigate} from 'react-router-dom';
import React from 'react';
import config from '../../config';
import Popup from '../../components/popup/Popup';

export default function Register() {

  const username = useRef();
  const email = useRef();
  const password = useRef();
  const passwordAgain = useRef();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const popupStatus = async (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  }


  const handleClick = async (e) => {
    e.preventDefault();
    if(passwordAgain.current.value !== password.current.value){
      passwordAgain.current.setCustomValidity("passwords do not match");
    } else {
      const user = {
        username: username.current.value,
        email: email.current.value,
        password: password.current.value,
      };
      try{
        await axios.post(`${config.apiUrl}/api/auth/register`, user);
        navigate('/login')
      } catch (err) {
        await popupStatus('An error occured when trying to register. Please try again later.', "Close")
      }
    }
  };

  return (
    <div className="login">
        <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />
        <img
        className='loginImg'
        src={'/assets/login-background.webp'}
        alt='login-background'
        />
        <div className="registerWrapper">
                <form className="registerBox" onSubmit={handleClick}>
                    <input placeholder='Username' required ref={username} className="registerInput" />
                    <input placeholder='Email' required ref={email} className="registerInput" type="email" />
                    <input placeholder='Password' required ref={password} className="registerInput" type="password" minLength='6' />
                    <input placeholder='Confirm Password' required ref={passwordAgain} className="registerInput" type="password" minLength='6'/>
                    <button className="signUpButton" type='submit'>Sign Up</button>
                </form>
           
        </div>
    </div>
  )
}
