import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models';
import { sendEmail } from '../utils/sendEmail';

interface AuthRequest extends Request {
  user?: User;
}

// Generate JWT Token
const generateToken = (id: number): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, bio } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(20).toString('hex');
    const emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      bio,
      role: 'artist',
      isActive: false,
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpire
    });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}`;
    const message = `
      Welcome to Dulcinea Art!
      
      Please click the link below to verify your email address:
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      Best regards,
      Dulcinea Art Team
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification - Dulcinea Art',
        message
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified
          }
        }
      });
    } catch (error) {
      // If email fails, delete the user
      await User.destroy({ where: { id: user.id } });
      return res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.'
      });
    }
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    console.log("req", req.body)
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address before logging in'
      });
    }

    // Check if account is activated (for artists)
    if (user.role === 'artist' && !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account is pending activation by an administrator'
      });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          bio: user.bio
        }
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user!.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      bio: req.body.bio,
      contactInfo: req.body.contactInfo
    };

    await User.update(fieldsToUpdate, {
      where: { id: req.user!.id }
    });

    const user = await User.findByPk(req.user!.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Forgot password - Send 6-digit code
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'There is no user with that email'
      });
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.update(
      {
        resetPasswordCode: resetCode,
        resetPasswordCodeExpire: resetCodeExpire
      },
      { where: { id: user.id } }
    );

    const message = `
      You requested a password reset for your Dulcinea Art account.
      
      Your reset code is: ${resetCode}
      
      This code will expire in 10 minutes.
      
      If you didn't request this, please ignore this email.
      
      Best regards,
      Dulcinea Art Team
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Code - Dulcinea Art',
        message
      });

      res.json({
        success: true,
        message: 'Reset code sent to your email'
      });
    } catch (error) {
      console.log("error", error)
      await User.update(
        {
          resetPasswordCode: undefined,
          resetPasswordCodeExpire: undefined
        },
        { where: { id: user.id } }
      );

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reset password with 6-digit code
// @route   PUT /api/auth/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, password } = req.body;

    const user = await User.findOne({
      where: {
        email,
        resetPasswordCode: code,
        resetPasswordCodeExpire: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Set new password and clear reset code
    await User.update(
      {
        password: hashedPassword,
        resetPasswordCode: undefined,
        resetPasswordCodeExpire: undefined
      },
      { where: { id: user.id } }
    );

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpire: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified
    await User.update(
      {
        isEmailVerified: true,
        emailVerificationToken: undefined,
        emailVerificationExpire: undefined
      },
      { where: { id: user.id } }
    );

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
