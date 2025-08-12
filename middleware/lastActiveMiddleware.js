import UserSession from '../model/userSession.schema.js';

export const updateActivity = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  if (token) {
    try {
      await UserSession.findOneAndUpdate(
        { token },
        { lastActivity: new Date() },
      );
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  }
  next();
};
