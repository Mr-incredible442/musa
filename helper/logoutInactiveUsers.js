import UserSession from '../model/userSession.schema.js';
import User from '../model/Users.schema.js';
import blacklistSchema from '../model/blacklist.schema.js';

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

const logoutInactiveUsers = async (io) => {
  try {
    const now = Date.now();
    const inactiveSessions = await UserSession.find({
      lastActivity: { $lt: new Date(now - INACTIVITY_LIMIT) },
    });

    if (inactiveSessions.length > 0) {
      const inactiveUserIds = inactiveSessions.map((session) => session.userId);
      await UserSession.deleteMany({
        userId: { $in: inactiveUserIds },
      });
      await blacklistSchema.insertMany(
        inactiveSessions.map((session) => ({ token: session.token })),
      );

      // Broadcast updated logged-in user list
      const users = await User.find().select('-password');
      const loggedInUsers = await UserSession.find();
      const loggedInUserIds = new Set(
        loggedInUsers.map((session) => session.userId.toString()),
      );
      const usersWithLoginStatus = users.map((user) => ({
        ...user._doc,
        isLoggedIn: loggedInUserIds.has(user._id.toString()),
      }));

      io.emit('allLoggedInUsers', usersWithLoginStatus);
    }
  } catch (error) {
    console.error('Error during logoutInactiveUsers execution:', error);
  }
};

// Export the function
export default logoutInactiveUsers;
