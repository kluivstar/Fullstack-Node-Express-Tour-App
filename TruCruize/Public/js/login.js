/* eslint-disable */
import axios from 'axios'; // A promise-based HTTP client for making requests.
import { showAlert } from './alerts';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/users/login',
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
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}


export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/users/logout'
        })

        if ((res.data.status == 'success')) location.reload(true)
    } catch (err) {
        showAlert('error', 'Error logging out, Try again')
    }
}