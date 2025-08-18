// Validation middleware for authentication requests
const validateRegister = (req, res, next) => {
  const { name, email, password, role, graduationYear, major } = req.body;

  // Check required fields
  if (!name || !email || !password || !role) {
    return res.status(400).json({ 
      message: 'Please provide name, email, password, and role' 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email' });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ 
      message: 'Password must be at least 6 characters long' 
    });
  }

  // Validate role
  if (!['alumni', 'student'].includes(role)) {
    return res.status(400).json({ 
      message: 'Role must be either alumni or student' 
    });
  }

  // Validate graduation year and major for alumni/student
  if (role === 'alumni' || role === 'student') {
    if (!graduationYear || !major) {
      return res.status(400).json({ 
        message: 'Graduation year and major are required for alumni and students' 
      });
    }

    // Validate graduation year
    const currentYear = new Date().getFullYear();
    if (graduationYear < 1950 || graduationYear > currentYear + 10) {
      return res.status(400).json({ 
        message: 'Please provide a valid graduation year' 
      });
    }
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  // Check required fields
  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Please provide email and password' 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email' });
  }

  next();
};

const validateApproval = (req, res, next) => {
  const { isApproved } = req.body;

  // Check if isApproved is provided
  if (typeof isApproved !== 'boolean') {
    return res.status(400).json({ 
      message: 'isApproved must be a boolean value' 
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateApproval
};
