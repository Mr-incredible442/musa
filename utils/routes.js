import usersRoutes from '../routes/users.js';
import shopCRoutes from '../routes/shopC.js';
import bomaStoreRoutes from '../routes/bomaStore.js';
import bomaRegisterRoutes from '../routes/bomaRegister.js';

import { verifyToken } from '../middleware/authMiddlleware.js';
import { updateActivity } from '../middleware/lastActiveMiddleware.js';

export default function mountRoutes(app) {
  app.use('/api/users', usersRoutes);
  app.use('/api/shopc', verifyToken, updateActivity, shopCRoutes);

  app.use('/api/boma/store', verifyToken, updateActivity, bomaStoreRoutes);
  app.use(
    '/api/boma/register',
    verifyToken,
    updateActivity,
    bomaRegisterRoutes,
  );
}
