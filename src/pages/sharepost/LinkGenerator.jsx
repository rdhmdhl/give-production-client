import axios from 'axios';

const LinkGenerator = async (user, details) => {
    try {
      const response = await axios.post("api/create", {
        creatorUserId: user._id,
        details: details,
        used: false,
        expired: false,
      });
      console.log("details from link generator: ", details);
      return response.data.link;
    } catch (error) {
        // pass the error message to the frontend
        throw error.response.data.error;
    }
  };

export default LinkGenerator;