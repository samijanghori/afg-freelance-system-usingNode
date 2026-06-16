// models/helpers/validators.js

const validateEmail = (email) => {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
};

const validatePhoneNumber = (phone) => {
    const regex = /^\+?[0-9]{10,15}$/;
    return regex.test(phone);
};

const validateURL = (url) => {
    const regex = /^https?:\/\/.+/;
    return regex.test(url);
};

const validatePasswordStrength = (password) => {
    // حداقل ۸ کاراکتر، حداقل یک حرف بزرگ و یک عدد
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
};

module.exports = {
    validateEmail,
    validatePhoneNumber,
    validateURL,
    validatePasswordStrength
};