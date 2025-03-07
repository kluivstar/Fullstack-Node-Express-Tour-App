/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateData = async (name, email) => {
  try {
    // Making the request
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/users/updateMe',
      data: {
        name, email
      } // Holds name, email... or passwordCurrent, password, passwordConfirm
    });

    if (res.data.status === 'success') {
      showAlert('success', `updated successfully!`);
    }
  } catch (err) {
    console.error('Error:', err); // Debugging statement
    showAlert('error', err.response.data.message);
  }
};