import React from 'react'
import './Settings.css'
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EditableLabel from '../../components/EditableLabel';
import { FiLogOut } from "react-icons/fi";
import { TbCameraPlus } from 'react-icons/tb';
import Resizer from "react-image-file-resizer";
import axios from 'axios';
import config from '../../config';
import Popup from '../../components/popup/Popup';

export default function Settings() {
  const [file, setFile] = useState(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const { user, socket_context, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const popupStatus = async (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  }

  // Handle the form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    let profilePicture;
    let coverPicture;

    // function to resize the image using canvas
    const resizeImage = (file) => {
      return new Promise((resolve, reject) => {
        const maxWidth = 1000;
        const maxHeight = 1000;
        const compressFormat = 'JPEG';
        const quality = 90;
        const rotation = 0;
        const outputType = 'blob';
    
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

    // If the user has uploaded a new profile picture
    if (file) {
      try {
        // resize the image
        const resizedFile = await resizeImage(file)

        // Upload the resized file to the server
        const data = new FormData();
        data.append('file', resizedFile);
        // upload the file to s3
        const s3Upload = await axios.post(`${config.apiUrl}/api/upload`, data);

        // Get the URL of the uploaded file
        profilePicture = s3Upload.data.url;
        
      } catch (error) {
        await popupStatus('Failed to upload image, try a smaller file.', "Close")
      }
    }

    if (coverPhotoFile) {
      try {
        // resize the image
        const resizedCoverFile = await resizeImage(coverPhotoFile)

        // Upload the resized file to the server
        const data = new FormData();
        data.append('file', resizedCoverFile);
        // upload the file to s3
        const s3CoverUpload = await axios.post(`${config.apiUrl}/api/upload`, data);

        // get the url of the uploaded file
        coverPicture = s3CoverUpload.data.url;

      } catch (error) {
        await popupStatus('Failed to upload image, try a smaller file.', "Close")
      }

    }

    const userData = {...user, userId: user._id};

    if (profilePicture) {
      userData.profilePicture = profilePicture;
    }

    if (coverPicture) {
      userData.coverPicture = coverPicture;
    }

    // Submit the updated user information to the database using axios.patch
    axios.patch(`${config.apiUrl}/api/users/${user._id}`, userData)
      .then(response => {
        // get the updated fields from the response
        const updatedFields = response.data;

        // combined the user data in the context and local storage with the updated fields
        const updatedUser = { ...user, ...updatedFields };

        // Dispatch an action to the reducer to update the user data in the context
        dispatch({ type: "UPDATE_USER", payload: updatedUser });
        // store the user info in local storage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // dispatch({ type: "UPDATE_CACHE_BREAKER", payload: Date.now() }); 
        navigate(`/profile/${user.username}`);
      })
      .catch(() => {
        // Handle any errors
        popupStatus('Failed to upload image, try a smaller file.', "Close")
      });
  };

  const handleValueChange = (field, newValue) => {
    // Convert username and email to lowercase before updating
    const updatedValue = (field === 'username' || field === 'email') ? newValue.toLowerCase() : newValue;
  
    // Update the specific field of the user data with the new value
    const updatedUser = { ...user, [field]: updatedValue };
    
    // Dispatch an action to the reducer to update the user data in the context
    dispatch({ type: "UPDATE_USER", payload: updatedUser });
  };

  const handleLogout = () => {
    if (socket_context) {
      socket_context.disconnect();
      dispatch({ type: 'REMOVE_SOCKET' });
    }
    // remove the jwt token from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Dispatch an action to the reducer to update the user data in the context
    dispatch({ type: "LOGOUT" });
    // navigate to the login page
    navigate('/login');
  };


  return (
    <>

    {/* <Topbar/> */}
      <div className='settingsWrapper'>
      <Popup isPopupOpen={showPopup} message={popupMessage} button1Text="Close" button1Action={() => setShowPopup(false)} />
        <div className="profile-images">
          {/* COVER PHOTO */}
          <label htmlFor='coverFile' className="shareOption">
            <TbCameraPlus className='cover-camera-icon'/>
            <input style={{display:'none'}} type="file" id="coverFile" accept='.png,.jpeg,.jpg' onChange={(e) => setCoverPhotoFile(e.target.files[0])} />
          </label>
            <img 
              className='profileCoverImg' 
              src={coverPhotoFile ? 
                  URL.createObjectURL(coverPhotoFile) : 
                  user.coverPicture ? user.coverPicture :
                  "/assets/person/nocover.png"} 
              alt="" />
            {/* PROFILE PICTURE */}
            <div className="profile-pic-container">
              <label htmlFor='file' className="shareOption">
                <TbCameraPlus className='camera-icon'/>
                <input style={{display:'none'}} type="file" id="file" accept='.png,.jpeg,.jpg' onChange={(e) => setFile(e.target.files[0])} />
              </label>
              <img 
                className='profileUserImg-settings' 
                src={file ? 
                    URL.createObjectURL(file) : 
                    user.profilePicture ? user.profilePicture : 
                    "/assets/no-profile-pic.webp"} 
                alt="" />
            </div>
        </div>
    
          <form onSubmit={handleSubmit} >
            
            <EditableLabel 
              label="Username"
              value={user.username}
              onValueChange={newValue => handleValueChange('username', newValue)}
            />
            <hr className='line-break'/>
            <EditableLabel 
              label="Display Name"
              value={user.displayName}
              onValueChange={newValue => handleValueChange('displayName', newValue)}
            />
            <hr className='line-break'/>
            <EditableLabel 
              label="Email"
              value={user.email}
              onValueChange={newValue => handleValueChange('email', newValue)}
            />
            <hr className='line-break'/>
            <EditableLabel 
              label="Bio"
              value={user.bio}
              onValueChange={newValue => handleValueChange('bio', newValue)}
            />
            <hr className='line-break'/>
            <EditableLabel 
              label="Location"
              value={user.location}
              onValueChange={newValue => handleValueChange('location', newValue)}
            />
            <hr className='line-break'/>
            <EditableLabel 
              label="Password"
              value="Reset Password"
              onValueChange={newValue => handleValueChange('password', newValue)}
            />
            <hr className='line-break'/>
            <div className="logout-container">
              <p>Logout</p>
              <FiLogOut className='logout-icon' onClick={handleLogout}/>
            </div>

            <div className="save-button-containter">
              <button className='saveButton' type="submit">Save Changes</button>
            </div>
          </form>
            
      </div>
      </>
  );
}