// /* eslint-disable */
// console.log("Hola")
import '@babel/polyfill'
import { login, logout } from "./login";
import { displayMap } from './mapbox'; // A function (from mapbox.js) that displays a map with locations.
import {updateData} from './updateSettings';

// DOM Elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
// // const bookBtn = document.getElementById('book-tour');

// Delegation
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

// // DOMContentLoaded - Ensures the script runs after the page has fully loaded
if (loginForm)
    loginForm.addEventListener('submit', e => { // add sumbit listener to .form--login now loginForm
    e.preventDefault();

    // Gets the values from the email and password input fields.
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Pass data to login.js
    login(email, password);
});

if (logOutBtn) logOutBtn.addEventListener('click', logout)

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault()
    
    const name = document.getElementById('name').value
    const email = document.getElementById('email').value
    
    updateData(name, email)
})

