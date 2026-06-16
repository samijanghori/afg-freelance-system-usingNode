// models/helpers/validators.js

/**
 * اعتبارسنجی ایمیل
 */
const validateEmail = (email) => {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
};

/**
 * اعتبارسنجی شماره تلفن
 */
const validatePhoneNumber = (phone) => {
    const regex = /^\+?[0-9]{10,15}$/;
    return regex.test(phone);
};

/**
 * اعتبارسنجی URL
 */
const validateURL = (url) => {
    if (!url) return true;
    const regex = /^https?:\/\/.+/;
    return regex.test(url);
};

/**
 * اعتبارسنجی قدرت رمز عبور
 */
const validatePasswordStrength = (password) => {
    // حداقل ۸ کاراکتر، حداقل یک حرف بزرگ، یک حرف کوچک و یک عدد
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
};

/**
 * اعتبارسنجی تاریخ
 */
const validateDate = (date) => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
};

/**
 * اعتبارسنجی عدد مثبت
 */
const validatePositiveNumber = (num) => {
    return typeof num === 'number' && num >= 0;
};

module.exports = {
    validateEmail,
    validatePhoneNumber,
    validateURL,
    validatePasswordStrength,
    validateDate,
    validatePositiveNumber
};