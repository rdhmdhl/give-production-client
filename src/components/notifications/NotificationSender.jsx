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

async function NotificationSender({socket, receiverUserId, amount, giveorreceive, linkorpost, type }){
  
  try {
    const message = 'interacted with your link'
    // Save notification to DB
    await axios.post(`${config.apiUrl}/api/notifications`, {
      receiverUserId,
      amount,
      type,
      message,
      read: false,
    });

    // Check if user is online
    const onlineUser = await getOnlineUser(receiverUserId);

    // Emit Socket.io message if user is online
    if (socket && onlineUser) {
      const createdAt = new Date().toISOString();
      socket.emit('sendMessage', {
        receiverUserId,
        amount,
        type,
        giveorreceive,
        linkorpost,
        message,
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
    giveorreceive: PropTypes.string,
    linkorpost: PropTypes.string,
    type: PropTypes.string,
  };

export default NotificationSender;