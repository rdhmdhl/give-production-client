import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import React from 'react';
import Profile from "./pages/profile/Profile";
import Settings from "./pages/profile/Settings";
import SinglePost from "./pages/singlepost/SinglePost";
import AcceptLink from "./pages/acceptlink/AcceptLink";
import Topbar from "./components/Topbar";
import Share from "./pages/sharepost/Share";
import WriteIcon from "./components/share/writeIcon";
import ReactLoading from 'react-loading';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate, 
} from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import { io } from "socket.io-client";

function App() {
  const {isLoading, user} = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  //  socket io for real-time notifications
  useEffect(() => {
    if (user && user._id) {
      const newSocket = io(process.env.REACT_APP_API_URL);
      newSocket.emit("newUser", user._id);
      setSocket(newSocket);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10rem', marginBottom: '20px' }}>
        <ReactLoading type={'balls'} color={'white'} height={'20%'} width={'20%'} />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="link/:linkId" 
          element={user ? <AcceptLink socket={socket} /> : <Navigate to="/login" />} 
        />
        {/* Allow any user (authenticated or not) to access the home page */}
        <Route path="/" element={
          <>
            <Topbar socket={socket} />
            <WriteIcon />
            <Home socket={socket} user={user}/>
          </>
        }/>

        {/* Redirect authenticated users from login to home page */}
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />

        {/* Redirect authenticated users from register to the home page */}
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

        {/* For all other routes, check the authentication inside each Route */}
        <Route path="share" element={user ? <Share /> : <Navigate to="/login" />} />
        <Route path="profile/:username" element={
          user ? (
            <>
              <Topbar socket={socket}/>
              <WriteIcon />
              <Profile />
            </>
          ) : <Navigate to="/login" />
        }/>
        <Route path="profile/:username/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
        <Route path=":postId" element={user ? <SinglePost socket={socket} /> : <Navigate to="/login" />} />
      </Routes>
  </Router>
  )
}

export default App;
