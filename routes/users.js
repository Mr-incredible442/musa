import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';

import User from '../model/Users.schema.js';
import UserSession from '../model/userSession.schema.js';
import blacklistSchema from '../model/blacklist.schema.js';

import { verifyToken } from '../middleware/authMiddlleware.js';

const router = express.Router();

// login route
router.post('/login', async (req, res) => {
  const { number, password, turnstileToken } = req.body;

  if (!turnstileToken) {
    return res.status(400).json({ msg: 'CAPTCHA verification failed' });
  }

  try {
    // Verify Turnstile token with Cloudflare
    const verifyResponse = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET,
        response: turnstileToken,
      }),
    );

    if (!verifyResponse.data.success) {
      return res.status(400).json({ msg: 'CAPTCHA verification failed' });
    }

    if (!number || !password) {
      return res.status(400).json({ msg: 'All fields must be filled' });
    }

    const user = await User.findOne({ number });
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }
    if (!user.active) {
      return res
        .status(403)
        .json({ msg: 'Your account is inactive. Please contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate a JWT
    const token = jwt.sign(
      {
        firstName: user.firstName,
        lastName: user.lastName,
        number: user.number,
        role: user.role,
        id: user._id,
      },
      process.env.JWT_ACCESS_SECRET,
      // { expiresIn: process.env.JWT_EXPIRES_IN }, // Options
    );

    const existingSession = await UserSession.findOne({ userId: user._id });
    if (existingSession) {
      await blacklistSchema.create({ token: existingSession.token });
      await existingSession.deleteOne();
    }

    // Save the JWT in the database
    await UserSession.create({
      userId: user._id,
      token,
      createdAt: new Date(),
    });
    const { password: _, ...userWithoutPassword } = user._doc;

    const users = await User.find().select('-password');
    const loggedInUsers = await UserSession.find();
    const loggedInUserIds = new Set(
      loggedInUsers.map((session) => session.userId.toString()),
    );
    const usersWithLoginStatus = users.map((user) => ({
      ...user._doc,
      isLoggedIn: loggedInUserIds.has(user._id.toString()),
    }));

    req.app.get('io').emit('allLoggedInUsers', usersWithLoginStatus);
    res.status(200).json({ accessToken: token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

//logout route
router.post('/logout', verifyToken, async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization.split(' ')[1];

  try {
    if (!token) {
      return res.status(400).json({ msg: 'No token provided' });
    }

    const userSession = await UserSession.findOne({ token });
    if (!userSession) {
      return res.status(400).json({ msg: 'User not found' });
    }

    const userId = userSession.userId;

    // Invalidate all sessions for the user
    const userSessions = await UserSession.find({ userId });
    await Promise.all(
      userSessions.map(async (session) => {
        await blacklistSchema.create({ token: session.token });
        await session.deleteOne();
      }),
    );

    const users = await User.find().select('-password');
    const loggedInUsers = await UserSession.find();
    const loggedInUserIds = new Set(
      loggedInUsers.map((session) => session.userId.toString()),
    );
    const usersWithLoginStatus = users.map((user) => ({
      ...user._doc,
      isLoggedIn: loggedInUserIds.has(user._id.toString()),
    }));

    req.app.get('io').emit('allLoggedInUsers', usersWithLoginStatus);
    res.status(200).json({ msg: 'User logged out' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// logout all users
router.post('/logoutall', verifyToken, async (req, res) => {
  try {
    // Blacklist all tokens
    const AllLoggedInUsers = await UserSession.find();
    await Promise.all(
      AllLoggedInUsers.map(async (user) => {
        await blacklistSchema.create({ token: user.token });
        await user.deleteOne();
      }),
    );

    await UserSession.deleteMany();

    const users = await User.find().select('-password');
    const loggedInUsers = await UserSession.find();
    const loggedInUserIds = new Set(
      loggedInUsers.map((session) => session.userId.toString()),
    );
    const usersWithLoginStatus = users.map((user) => ({
      ...user._doc,
      isLoggedIn: loggedInUserIds.has(user._id.toString()),
    }));
    req.app.get('io').emit('allLoggedInUsers', usersWithLoginStatus);
    res.status(200).json({ msg: 'All users logged out' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

//admin logout a user
router.post('/logout/:id', verifyToken, async (req, res) => {
  const userId = req.params.id;

  try {
    const userSession = await UserSession.findOne({ userId });
    if (!userSession) {
      return res.status(400).json({ msg: 'User not found' });
    }

    await blacklistSchema.create({ token: userSession.token });
    await userSession.deleteOne();

    const users = await User.find().select('-password');
    const loggedInUsers = await UserSession.find();
    const loggedInUserIds = new Set(
      loggedInUsers.map((session) => session.userId.toString()),
    );
    const usersWithLoginStatus = users.map((user) => ({
      ...user._doc,
      isLoggedIn: loggedInUserIds.has(user._id.toString()),
    }));

    req.app.get('io').emit('allLoggedInUsers', usersWithLoginStatus);
    res.status(200).json({ msg: 'User logged out' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// admin toggle user active status
router.patch('/toggleuser/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.active = !user.active;
    await user.save();

    // remove all sessions for the user and blacklist the tokens
    const userSessions = await UserSession.find({ userId });
    await Promise.all(
      userSessions.map(async (session) => {
        await blacklistSchema.create({ token: session.token });
        await session.deleteOne();
      }),
    );

    const users = await User.find().select('-password');
    const loggedInUsers = await UserSession.find();
    const loggedInUserIds = new Set(
      loggedInUsers.map((session) => session.userId.toString()),
    );
    const usersWithLoginStatus = users.map((user) => ({
      ...user._doc,
      isLoggedIn: loggedInUserIds.has(user._id.toString()),
    }));

    const status = user.active ? 'activated' : 'deactivated';
    req.app.get('io').emit('allLoggedInUsers', usersWithLoginStatus);
    res.status(200).json({ msg: `User has been ${status}` });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

//signup route
router.post('/signup', verifyToken, async (req, res) => {
  const { firstName, lastName, number, password, role } = req.body;

  try {
    if (!firstName || !lastName || !number || !password || !role) {
      return res.status(400).json({ msg: 'All fields must be filled' });
    }

    const userExists = await User.findOne({ number });
    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      number,
      password: hashedPassword,
      role,
    });

    const users = await User.find().select('-password');
    const loggedInUsers = await UserSession.find();
    const loggedInUserIds = new Set(
      loggedInUsers.map((session) => session.userId.toString()),
    );
    const usersWithLoginStatus = users.map((user) => ({
      ...user._doc,
      isLoggedIn: loggedInUserIds.has(user._id.toString()),
    }));

    req.app.get('io').emit('allLoggedInUsers', usersWithLoginStatus);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

//get all users
router.get('/', verifyToken, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const loggedInUsers = await UserSession.find();
    const loggedInUserIds = new Set(
      loggedInUsers.map((session) => session.userId.toString()),
    );
    const usersWithLoginStatus = users.map((user) => ({
      ...user._doc,
      isLoggedIn: loggedInUserIds.has(user._id.toString()),
    }));

    req.app.get('io').emit('allLoggedInUsers', usersWithLoginStatus);
    res.status(200).json({ users: usersWithLoginStatus });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

//delete a user
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const userSessions = await UserSession.find({ userId: req.params.id });
    await Promise.all(
      userSessions.map(async (session) => {
        await blacklistSchema.create({ token: session.token });
        await session.deleteOne();
      }),
    );

    await User.findByIdAndDelete(req.params.id);

    const users = await User.find().select('-password');
    const loggedInUsers = await UserSession.find();
    const loggedInUserIds = new Set(
      loggedInUsers.map((session) => session.userId.toString()),
    );
    const usersWithLoginStatus = users.map((user) => ({
      ...user._doc,
      isLoggedIn: loggedInUserIds.has(user._id.toString()),
    }));

    req.app.get('io').emit('allLoggedInUsers', usersWithLoginStatus);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

export default router;
