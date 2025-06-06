/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// Sends a PATCH request to update either the user's profile or password depending on the type passed in.
export const updateSettings = async (data, type) => {
  try {
    console.log('Sending request:', data, type);
    const url =
      type === 'password' // Choose the correct endpoint
        ? '/users/updatePassword' 
        : '/users/updateMe';

    // Send PATCH request using Axios
    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    console.log('Response:', res.data);
    

    // If successful, show success alert
    if (res.data.status === 'success') {
      console.log('Success:', res.data);
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

