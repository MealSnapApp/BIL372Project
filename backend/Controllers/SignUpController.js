const UserService = require('../services/userService/UserService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "default";


exports.signup = async (req, res) => {
  try {
    // Destructure new fields from request body
    const { 
      Name, Surname, Username, Email, Password,
      BirthDate, Sex, TargetWeight, TargetCalorie, ActivityLevel 
    } = req.body;

    // Password comes hashed from frontend, so we store it directly
    const user = await UserService.createUser({ 
      Name, Surname, Username, Email, Password,
      BirthDate, Sex, TargetWeight, TargetCalorie, ActivityLevel
    });

    // user is now a plain object, not a Postgres result with .rows
    const token = jwt.sign({ id: user.user_id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 3600000 // 1 hour
    });
  
    res.status(201).send("The user has been created successfully!");
  } catch (err) {
    console.error("Signup Error:", err);

    // Handle Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
        const fields = err.errors.map(e => e.path);
        if (fields.includes('username') && fields.includes('email')) {
            return res.status(409).send("This username and email are already exists!");
        }
        if (fields.includes('username')) {
            return res.status(409).send("This username is already exists!");
        }
        if (fields.includes('email')) {
            return res.status(409).send("This email is already exists!");
        }
    }

    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: "Validation error", errors: err.errors.map(e => e.message) });
    }

    res.status(500).json({ message: "The user could not be created.", error: err.message });
  }
};