/* eslint-disable */

export const hideAlert = () => {
    const x = document.querySelector('alert')
    if (x) x.parentElement.removeChild(x)
}

export const showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup)
    window.setTimeout(hideAlert, 5000)
}