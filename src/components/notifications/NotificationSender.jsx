import axios from 'axios';
import PropTypes from 'prop-types';
import config from '../../config';

// get online user from the database
const getOnlineUser = async (userId) => {
  try {
    const response = await axios.get(`${config.apiUrl}/api/onlineusers/${userId}`);
    if (response.status === 204) {
      return null; // user is offline
    } else {
      return response.data;
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null; // user not found
    } else {
      alert('An error occurred while checking the user status. Please try again later.');
      return null;
    }
  }
};

async function NotificationSender({socket, senderUserId, receiverUserId, amount, giveorreceive, linkorpost, type, relatedPostId, message, ebItemPhoto, ebItemTitle, ebItemId }){
  const createdAt = new Date().toISOString();
  try {
    
    // Save notification to DB
    await axios.post(`${config.apiUrl}/api/notifications`, {
      senderUserId,
      receiverUserId,
      amount,
      type,
      giveorreceive,
      linkorpost,
      relatedPostId,
      message,
      ebItemPhoto,
      ebItemTitle,
      ebItemId,
      read: false,
      createdAt,
    });

    // Check if user is online
    const onlineUser = await getOnlineUser(receiverUserId);
    
    // Emit Socket.io message if user is online
    if (socket && onlineUser) {
      
      socket.emit('sendMessage', {
        senderUserId,
        receiverUserId,
        amount,
        type,
        giveorreceive,
        linkorpost,
        relatedPostId,
        message,
        ebItemPhoto,
        ebItemTitle,
        ebItemId,
        read: false,
        createdAt,
      });
    } 

  } catch (error) {
    alert("Failed to send notification. Please try again later.");
  }

}

NotificationSender.propTypes = {
    socket: PropTypes.object, 
    receiverUserId: PropTypes.string,
    senderUserId: PropTypes.string, 
    amount: PropTypes.number,
    type: PropTypes.string,
    giveorreceive: PropTypes.string,
    linkorpost: PropTypes.string,
    relatedPostId: PropTypes.string,
    message: PropTypes.string,
    ebItemPhoto: PropTypes.string,
    ebItemTitle: PropTypes.string,
    ebItemId: PropTypes.string,

  };

export default NotificationSender;