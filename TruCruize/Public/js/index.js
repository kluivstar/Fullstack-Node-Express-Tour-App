// /* eslint-disable */
// console.log("Hola")
import '@babel/polyfill'
import { login, logout } from "./login";
import { displayMap } from './mapbox'; // A function (from mapbox.js) that displays a map with locations.
import { updateSettings } from './updateSettings';
import { bookTour } from './paystack'; // Ensure paystack.js is imported

// DOM Elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');


// ✅ Debugging: Check if book button exists
console.log("Book button element:", bookBtn);

// Mapbox Initialization
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

// Login Form
if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

// Logout
if (logOutBtn) logOutBtn.addEventListener('click', logout);

// User Data Update
if (userDataForm) {
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateSettings(form, 'data');
    });
}

// Password Update form Handler
if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {

        e.preventDefault();
        
        // Shows loading text
        document.querySelector('.btn--save-password').textContent = 'Updating...';

        //  Get password values from form fields
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        //  Call the update function
        // Sends the data to the server using an updateSettings helper.
        // The second argument 'password' likely tells the server which type of update this is.
        await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');


        //  Reset button and clear fields
        document.querySelector('.btn--save-password').textContent = 'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}

// ✅ Fix: Attach click event even if the button loads dynamically
// Ensure script runs after DOM is fully loaded
const waitForButton = setInterval(() => {
  const bookBtn = document.getElementById("book-tour");
  if (bookBtn) {
    console.log("✅ Book button found:", bookBtn); // Now only logs when button is found
    clearInterval(waitForButton); 

    bookBtn.addEventListener("click", async (e) => {
      console.log("✅ Button was clicked!");
      e.preventDefault();

      e.target.textContent = "Processing...";
      const tourId = e.target.dataset.tourId;

      if (!tourId) {
        console.error("⚠️ Tour ID not found");
        alert("An error occurred. Please try again.");
        e.target.textContent = "Book tour now!";
        return;
      }

      try {
        await bookTour(tourId);
      } catch (err) {
        console.error("⚠️ Payment error:", err);
        e.target.textContent = "Book tour now!";
      }
    });
  } else {
    console.log("⏳ Waiting for book button...");
  }
}, 500); // Check every 500ms

