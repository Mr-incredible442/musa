import jwt from 'jsonwebtoken';
import blacklistSchema from '../model/blacklist.schema.js';
import User from '../model/Users.schema.js';

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  if (!token) {
    return res.status(401).json({ msg: 'Access denied' });
  }

  try {
    const isBlacklisted = await blacklistSchema.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ msg: 'Token is invalid or expired' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.active) {
      return res
        .status(403)
        .json({ msg: 'Your account is inactive. Please contact the admin.' });
    }
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};
