/* eslint-disable */

const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/users/login',
            data: { // Sends a POST request using Axios with the provided credentials.
                email,
                password
            }
        })

        // if (res.data.status === 'success'){
        //     showAlert('success', 'Logged in successfully')
        //     window.setTimeout(() => {
        //         location.assign('/')
        //     }, 1500);
        // }
        console.log(res)
    } catch (err) {
        console.error("Error", err.response.data);
    }
}
// DOMContentLoaded - Ensures the script runs after the page has fully loaded
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.form').addEventListener('submit', e => {
        e.preventDefault();  // Prevents default form submission
        
        // Gets the values from the email and password input fields.
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        login(email, password); // Call login function
    });
});

