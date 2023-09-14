import axios from 'axios';
import config from '../../config';

const LinkGenerator = async (user, details) => {
    try {
      const response = await axios.post(`${config.apiUrl}/api/create`, {
        creatorUserId: user._id,
        details: details,
        used: false,
        expired: false,
      });
      console.log("details from link generator: ", response);
      return response.data.link;
    } catch (error) {
        // pass the error message to the frontend
        throw error.response.data.error;
    }
  };

export default LinkGenerator;