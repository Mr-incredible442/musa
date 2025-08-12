import usersRoutes from '../routes/users.js';
import suppliersRoutes from '../routes/supplier.js';
import restaurantRoutes from '../routes/restaurant.js';
import storeRoutes from '../routes/store.js';
import employeeRoutes from '../routes/employee.js';
import shopA1Routes from '../routes/shopA1.js';
import shopA2Routes from '../routes/shopA2.js';
import shopBRoutes from '../routes/shopB.js';
import shopWRoutes from '../routes/shopW.js';
import shopCRoutes from '../routes/shopC.js';
import registerRoutes from '../routes/register.js';
import creditRoutes from '../routes/credit.js';
import ordersRoutes from '../routes/orders.js';

// chinsali
import chinsaliRestaurantRoutes from '../routes/chinsaliRestaurant.js';
import chinsaliStoreRoutes from '../routes/chinsaliStore.js';
import chinsaliRegisterRoutes from '../routes/chinsaliRegister.js';

// chansa
import chansaRestaurantRoutes from '../routes/chansaRestaurant.js';
import chansaStoreRoutes from '../routes/chansaStore.js';
import chansaRegisterRoutes from '../routes/chansaRegister.js';
import lusakaShopRoutes from '../routes/lusakaShop.js';

//Boma
import bomaStoreRoutes from '../routes/bomaStore.js';
import bomaRegisterRoutes from '../routes/bomaRegister.js';

import logsRoutes from '../routes/logs.js';
import { verifyToken } from '../middleware/authMiddlleware.js';
import { updateActivity } from '../middleware/lastActiveMiddleware.js';

export default function mountRoutes(app) {
  // serenje
  app.use('/api/users', usersRoutes);
  app.use('/api/shopc', verifyToken, updateActivity, shopCRoutes);
  // app.use('/api/goat', verifyToken, updateActivity, suppliersRoutes);
  // app.use('/api/restaurant', verifyToken, updateActivity, restaurantRoutes);
  // app.use('/api/store', verifyToken, updateActivity, storeRoutes);
  // app.use('/api/employee', verifyToken, updateActivity, employeeRoutes);
  // app.use('/api/shopa1', verifyToken, updateActivity, shopA1Routes);
  // app.use('/api/shopa2', verifyToken, updateActivity, shopA2Routes);
  // app.use('/api/shopb', verifyToken, updateActivity, shopBRoutes);
  // app.use('/api/shopw', verifyToken, updateActivity, shopWRoutes);
  // app.use('/api/register', verifyToken, updateActivity, registerRoutes);
  // app.use('/api/credit', verifyToken, updateActivity, creditRoutes);
  // app.use('/api/orders', verifyToken, updateActivity, ordersRoutes);

  // // chinsali
  // app.use(
  //   '/api/chinsali/restaurant',
  //   verifyToken,
  //   updateActivity,
  //   chinsaliRestaurantRoutes,
  // );
  // app.use(
  //   '/api/chinsali/store',
  //   verifyToken,
  //   updateActivity,
  //   chinsaliStoreRoutes,
  // );
  // app.use(
  //   '/api/chinsali/register',
  //   verifyToken,
  //   updateActivity,
  //   chinsaliRegisterRoutes,
  // );

  // // chansa
  // app.use(
  //   '/api/chansa/restaurant',
  //   verifyToken,
  //   updateActivity,
  //   chansaRestaurantRoutes,
  // );
  // app.use('/api/chansa/store', verifyToken, updateActivity, chansaStoreRoutes);
  // app.use(
  //   '/api/chansa/register',
  //   verifyToken,
  //   updateActivity,
  //   chansaRegisterRoutes,
  // );
  // app.use('/api/lusaka/shop', verifyToken, updateActivity, lusakaShopRoutes);

  // boma
  app.use('/api/boma/store', verifyToken, updateActivity, bomaStoreRoutes);
  app.use(
    '/api/boma/register',
    verifyToken,
    updateActivity,
    bomaRegisterRoutes,
  );

  // logs
  app.use('/api/logs', verifyToken, updateActivity, logsRoutes);
}
