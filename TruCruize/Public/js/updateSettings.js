/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// Type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    console.log('Sending request:', data, type);
    const url =
      type === 'password'
        ? '/users/updatePassword'
        : '/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    console.log('Response:', res.data);
    if (res.data.status === 'success') {
      console.log('Success:', res.data);
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

