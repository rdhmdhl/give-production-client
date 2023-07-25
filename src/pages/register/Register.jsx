import axios from 'axios';
import { useRef } from 'react';
import './Register.css'
import {useNavigate} from 'react-router-dom';
import React from 'react';

export default function Register() {

  const username = useRef();
  const email = useRef();
  const password = useRef();
  const passwordAgain = useRef();
  const navigate = useNavigate();


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
        await axios.post('api/auth/register', user);
        navigate('/login')
      } catch (err) {
        alert("An error occured when trying to register. Please try again later.");
      }
    }
  };

  return (
    <div className="login">
          <img
          className='loginImg'
          src={process.env.PUBLIC_URL + 'assets/login-background.webp'}
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
