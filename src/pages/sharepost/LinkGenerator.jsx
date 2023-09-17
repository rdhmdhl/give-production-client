import { useContext } from "react";
import axios from 'axios';
import config from '../../config';
import { AuthContext } from '../../context/AuthContext';
// import { UpdateBalance } from '../../context/AuthActions';


// LinkGenerator.jsx
const useLinkGenerator = () => {
  const { dispatch, balance } = useContext(AuthContext);

  const generateLink = async (user, details) => {
    try {
      const response = await axios.post(`${config.apiUrl}/api/create`, {
        creatorUserId: user._id,
        details: details,
        used: false,
        expired: false,
      });

      const totalAmount = details.amount * Number(details.quantity);
      const newBalance = balance - totalAmount;

      if (details.giveorreceive === 'give') {
        dispatch({ type: "UPDATE_BALANCE", payload: newBalance });
      }

      return response.data.link;
    } catch (error) {
      throw error.response.data.error;
    }
  };

  return generateLink;
};

export default useLinkGenerator;