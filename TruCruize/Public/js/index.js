// /* eslint-disable */
// console.log("Hola")
import '@babel/polyfill'
import { login, logout } from "./login";
import { displayMap } from './mapbox'; // A function (from mapbox.js) that displays a map with locations.
import {updateSettings} from './updateSettings';

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
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);

    updateSettings(form, 'data');
})

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });