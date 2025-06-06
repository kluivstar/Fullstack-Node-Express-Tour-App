/* eslint-disable */
import axios from 'axios'; // A promise-based HTTP client for making requests.
import { showAlert } from './alerts';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/users/login',
            data: { // Sends a POST request using Axios with the provided credentials to RHF
                email,
                password
            }
        })
        // RHF checks if user and password exists and send a response which is res.data.status
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
            url: '/users/logout' // Call Logout RHF - Middleware
        })

        if ((res.data.status == 'success')) location.reload(true)
    } catch (err) {
        showAlert('error', 'Error logging out, Try again')
    }
}