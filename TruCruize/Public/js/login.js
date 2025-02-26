/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/users/login',
            data: { // Sends a POST request using Axios with the provided credentials.
                email,
                password
            }
        })

        if (res.data.status === 'success'){
            showAlert('success', 'Logged in successfully')
            window.setTimeout(() => {
                location.assign('/')
            }, 1500);
        }
        console.log(res)
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

