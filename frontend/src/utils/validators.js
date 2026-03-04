// Centralized validation utility functions

export const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

export const isNIC = (val) => /^(\d{9}[vVxX]|\d{12})$/.test(val?.trim());

export const isPhoneNumber = (val) => /^\d{10}$/.test(val?.trim());

export const isStrongPassword = (val) => val && val.length >= 8;

export const isYearInRange = (val) => {
    const y = Number(val);
    return !isNaN(y) && y >= 1920 && y <= 2026;
};

export const isFutureDate = (val) => {
    if (!val) return false;
    return new Date(val) >= new Date(new Date().toDateString());
};

export const isPositiveNumber = (val) => {
    const n = Number(val);
    return !isNaN(n) && n > 0;
};

export const isNonNegativeNumber = (val) => {
    const n = Number(val);
    return !isNaN(n) && n >= 0;
};

export const passwordStrength = (val) => {
    if (!val || val.length < 4) return { score: 0, label: 'Too short', color: '#ef4444' };
    if (val.length < 8) return { score: 1, label: 'Weak', color: '#f59e0b' };
    const hasUpper = /[A-Z]/.test(val);
    const hasLower = /[a-z]/.test(val);
    const hasNum = /\d/.test(val);
    const hasSpec = /[^A-Za-z0-9]/.test(val);
    const score = [hasUpper, hasLower, hasNum, hasSpec].filter(Boolean).length;
    if (score <= 2) return { score: 2, label: 'Fair', color: '#f59e0b' };
    if (score === 3) return { score: 3, label: 'Good', color: '#3b82f6' };
    return { score: 4, label: 'Strong', color: '#10b981' };
};

export const validateLoginForm = ({ username, password }) => {
    const errors = {};
    if (!username || username.trim().length < 3) errors.username = 'Username must be at least 3 characters';
    if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';
    return errors;
};

export const validateRegisterForm = (formData) => {
    const errors = {};
    if (!formData.username || formData.username.trim().length < 3)
        errors.username = 'Username must be 3+ characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username))
        errors.username = 'Username: letters, numbers and _ only';
    if (!formData.email || !isEmail(formData.email))
        errors.email = 'Enter a valid email address';
    if (!formData.password || !isStrongPassword(formData.password))
        errors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword)
        errors.confirmPassword = 'Passwords do not match';
    if (!formData.nic || !isNIC(formData.nic))
        errors.nic = 'Enter a valid Sri Lanka NIC (e.g. 199012345678 or 901234567V)';
    if (!formData.fullName || formData.fullName.trim().length < 2)
        errors.fullName = 'Full name is required';
    if (formData.phone && !isPhoneNumber(formData.phone))
        errors.phone = 'Enter a valid 10-digit phone number';
    return errors;
};

export const validateAddVehicleStep1 = (data) => {
    const errors = {};
    if (!data.make || data.make.trim().length < 2) errors.make = 'Make is required (min 2 chars)';
    if (!data.model || data.model.trim().length < 1) errors.model = 'Model is required';
    if (!isYearInRange(data.year)) errors.year = 'Enter a year between 1920 and 2026';
    if (!data.condition) errors.condition = 'Please select a condition';
    return errors;
};

export const validateAddVehicleStep2 = (data) => {
    const errors = {};
    if (!isNonNegativeNumber(data.mileage)) errors.mileage = 'Enter a valid mileage (≥ 0)';
    if (!data.fuelType) errors.fuelType = 'Please select fuel type';
    if (!data.category) errors.category = 'Please select a category';
    if (!isPositiveNumber(data.basePrice)) errors.basePrice = 'Enter a valid price greater than 0';
    if (!data.description || data.description.trim().length < 20)
        errors.description = 'Description must be at least 20 characters';
    return errors;
};

export const validateBidAmount = (amount, currentBid, minIncrement = 500) => {
    if (!amount || isNaN(Number(amount))) return 'Enter a valid bid amount';
    if (Number(amount) <= currentBid) return `Bid must be higher than current bid (LKR ${currentBid.toLocaleString()})`;
    if (Number(amount) < currentBid + minIncrement) return `Minimum increment is LKR ${minIncrement.toLocaleString()}`;
    return null;
};
