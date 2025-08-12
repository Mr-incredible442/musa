import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();

import Shift from '../model/Chansa.schema.js';

// get all shifts
router.get('/shifts', async (req, res) => {
  try {
    const shift = await Shift.find();

    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get shifts for a specific month in a year or the latest month
router.get('/paginatedshifts/:year?/:month?', async (req, res) => {
  try {
    const { year, month } = req.params;

    if (year && month) {
      // Retrieve shifts for the specified month in the given year
      const startOfMonth = `${year}-${month}-01`;
      const lastDay = new Date(year, month, 0);

      const endOfMonth = `${lastDay.getFullYear()}-${(lastDay.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${lastDay.getDate().toString().padStart(2, '0')}`;

      const shifts = await Shift.find({
        date: { $gte: startOfMonth, $lte: endOfMonth },
      });

      // Aggregate to get distinct years and months in the database
      const distinctYearsMonths = await Shift.aggregate([
        {
          $match: {
            date: { $ne: '' }, // Exclude documents where 'date' is an empty string
          },
        },
        {
          $addFields: {
            date: { $toDate: '$date' }, // Convert 'date' string to a date type
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
          },
        },
        {
          $project: {
            _id: 0,
            year: '$_id.year',
            month: '$_id.month',
          },
        },
        {
          $sort: {
            year: 1,
            month: 1,
          },
        },
        {
          $sort: {
            year: -1, // Sort in descending order by year
            month: -1, // Sort in descending order by month
          },
        },
      ]);

      res.json({ current: `${year}/${month}`, distinctYearsMonths, shifts });
    } else {
      const today = new Date();

      const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
      const currentYear = today.getFullYear();

      const startOfMonth = `${currentYear}-${currentMonth}-01`;
      const lastDay = new Date(currentYear, currentMonth, 0);

      const endOfMonth = `${lastDay.getFullYear()}-${(lastDay.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${lastDay.getDate().toString().padStart(2, '0')}`;

      const shifts = await Shift.find({
        date: { $gte: startOfMonth, $lte: endOfMonth },
      });

      // Aggregate to get distinct years and months in the database
      const distinctYearsMonths = await Shift.aggregate([
        {
          $match: {
            date: { $ne: '' }, // Exclude documents where 'date' is an empty string
          },
        },
        {
          $addFields: {
            date: { $toDate: '$date' }, // Convert 'date' string to a date type
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
          },
        },
        {
          $project: {
            _id: 0,
            year: '$_id.year',
            month: '$_id.month',
          },
        },
        {
          $sort: {
            year: 1,
            month: 1,
          },
        },
        {
          $sort: {
            year: -1, // Sort in descending order by year
            month: -1, // Sort in descending order by month
          },
        },
      ]);

      res.json({
        current: `${currentYear}/${currentMonth}`,
        distinctYearsMonths,
        shifts,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get the current shift
router.get('/', async (req, res) => {
  try {
    const shift = await Shift.findOne().sort({ _id: -1 }).limit(1);

    res.json(shift);
    req.app.get('io').emit('chansarestaurant', shift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get a single shift
router.get('/:id', async (req, res) => {
  try {
    const shift = await Shift.findOne({ _id: req.params.id });

    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add a new product
router.post('/:id/addtostock', async (req, res) => {
  try {
    const { id } = req.params;
    const { price, name, section } = req.body;

    const maxCodeResult = await Shift.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(id) } },
      { $unwind: '$stock' },
      { $group: { _id: null, maxCode: { $max: '$stock.code' } } },
    ]);

    const generatedCode = maxCodeResult[0].maxCode + 1;

    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      {
        $push: {
          stock: {
            _id: mongoose.Types.ObjectId(),
            code: generatedCode,
            price: Number(price),
            name: name.toLowerCase(),
            ostock: 0,
            received: 0,
            damage: 0,
            cstock: 0,
            section: section.toLowerCase(),
          },
        },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (updatedShift.status === 'current') {
      req.app.get('io').emit('chansarestaurant', updatedShift);
    }
    res.json(updatedShift);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// edit a product's stock
router.post('/:shiftId/editstock/:stockId', async (req, res) => {
  try {
    const { shiftId, stockId } = req.params;
    const { ostock, damage, cstock } = req.body;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: shiftId, 'stock._id': mongoose.Types.ObjectId(stockId) },
      {
        $set: {
          'stock.$.ostock': Number(ostock),
          'stock.$.damage': Number(damage),
          'stock.$.cstock': Number(cstock),
        },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Shift or stock item not found' });
    }

    if (updatedShift.status === 'current') {
      req.app.get('io').emit('chansarestaurant', updatedShift);
    }
    res.json(updatedShift);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// edit a product's name
router.post('/:shiftId/editname/:stockId', async (req, res) => {
  try {
    const { shiftId, stockId } = req.params;
    const { name, price } = req.body;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: shiftId, 'stock._id': mongoose.Types.ObjectId(stockId) },
      {
        $set: {
          'stock.$.price': Number(price),
          'stock.$.name': name.toLowerCase(),
        },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Shift or stock item not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// delete a product
router.delete('/:id/deletestock/:productId', async (req, res) => {
  try {
    const { id, productId } = req.params;

    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      {
        $pull: {
          stock: { _id: mongoose.Types.ObjectId(productId) },
        },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// add received
router.post('/:id/addtoreceived', async (req, res) => {
  try {
    const { code, name, amount } = req.body;
    const { id } = req.params;

    const newReceivedObject = {
      _id: mongoose.Types.ObjectId(),
      code: Number(code),
      name: name.toLowerCase(),
      amount: Number(amount),
    };
    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      {
        $push: { received: newReceivedObject },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete received
router.delete('/:shiftId/deletereceived/:receivedId', async (req, res) => {
  try {
    const { shiftId, receivedId } = req.params;

    const updatedShift = await Shift.findByIdAndUpdate(
      shiftId,
      {
        $pull: { received: { _id: mongoose.Types.ObjectId(receivedId) } },
      },
      { new: true }, // This option returns the modified document
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add credit
router.post('/:id/addtocredit', async (req, res) => {
  try {
    const { description, amount } = req.body;
    const { id } = req.params;

    const newCreditObject = {
      _id: mongoose.Types.ObjectId(),
      description: description.toLowerCase(),
      amount: Number(amount),
    };

    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      {
        $push: { credit: newCreditObject },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete credit
router.delete('/:shiftId/deletecredit/:creditId', async (req, res) => {
  try {
    const { shiftId, creditId } = req.params;

    const updatedShift = await Shift.findByIdAndUpdate(
      shiftId,
      {
        $pull: { credit: { _id: mongoose.Types.ObjectId(creditId) } },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add bus
router.post('/:id/addtobus', async (req, res) => {
  try {
    const { name, driver, status, amount } = req.body;
    const { id } = req.params;

    const newBusObject = {
      _id: mongoose.Types.ObjectId(),
      name: name.toLowerCase(),
      driver: driver.toLowerCase(),
      status: status.toLowerCase(),
      amount: Number(amount),
    };

    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      {
        $push: { bus: newBusObject },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete bus
router.delete('/:shiftId/deletebus/:busId', async (req, res) => {
  try {
    const { shiftId, busId } = req.params;

    const updatedShift = await Shift.findByIdAndUpdate(
      shiftId,
      {
        $pull: { bus: { _id: mongoose.Types.ObjectId(busId) } },
      },
      { new: true }, // This option returns the modified document
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add topup
router.post('/:id/addtotopup', async (req, res) => {
  try {
    const { name, amount } = req.body;
    const { id } = req.params;

    const newTopupObject = {
      _id: mongoose.Types.ObjectId(),
      name: name.toLowerCase(),
      amount: Number(amount),
    };

    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      {
        $push: { topup: newTopupObject },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete topup
router.delete('/:shiftId/deletetopup/:topupId', async (req, res) => {
  try {
    const { shiftId, topupId } = req.params;

    const updatedShift = await Shift.findByIdAndUpdate(
      shiftId,
      {
        $pull: { topup: { _id: mongoose.Types.ObjectId(topupId) } },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add cash
router.post('/:id/addtocash', async (req, res) => {
  try {
    const { amount } = req.body;
    const { id } = req.params;

    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      {
        $push: { cash: Number(amount) },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete cash
router.delete('/:id/deletecash/:amount', async (req, res) => {
  try {
    const { id, amount } = req.params;

    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      {
        $pull: {
          cash: {
            $elemMatch: { $eq: Number(amount) },
          },
        },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Get the index of the first matching element
    const indexToRemove = updatedShift.cash.findIndex(
      (el) => el === Number(amount),
    );

    // Remove the first matching element using the positional $ operator
    if (indexToRemove !== -1) {
      updatedShift.cash.splice(indexToRemove, 1);
    }

    // Save the updated document
    await updatedShift.save();

    res.json(updatedShift);

    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// add change
router.post('/:id/addtochange', async (req, res) => {
  try {
    const { amount } = req.body;
    const { id } = req.params;

    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      {
        $push: { change: Number(amount) },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete change
router.delete('/:shiftId/deletechange/:amount', async (req, res) => {
  try {
    const { shiftId, amount } = req.params;

    const updatedShift = await Shift.findByIdAndUpdate(
      shiftId,
      {
        $pull: {
          change: {
            $elemMatch: { $eq: Number(amount) },
          },
        },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Get the index of the first matching element
    const indexToRemove = updatedShift.change.findIndex(
      (el) => el === Number(amount),
    );

    // Remove the first matching element using the positional $ operator
    if (indexToRemove !== -1) {
      updatedShift.change.splice(indexToRemove, 1);
    }

    // Save the updated document
    await updatedShift.save();

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// add cashier
router.post('/:id/addcashier', async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: id },
      {
        $push: { cashier: name },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// remove cashier
router.post('/:id/removecashier', async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      {
        $pull: { cashier: name },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add date
router.post('/:id/adddate', async (req, res) => {
  try {
    const { date } = req.body;
    const { id } = req.params;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: id },
      {
        date: date,
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete date
router.post('/:id/deletedate', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: id },
      {
        date: '',
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add shift
router.post('/:id/addshift', async (req, res) => {
  try {
    const { shift } = req.body;
    const { id } = req.params;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: id },
      {
        shift: shift,
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete shift
router.post('/:id/deleteshift', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: id },
      {
        shift: '',
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add accountant
router.post('/:id/addaccountant', async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: id },
      {
        acountant: name,
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    //only send through socket if updatedShift.status is === to current

    req.app.get('io').emit('chansarestaurant', updatedShift);

    res.json(updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// remove accountant
router.post('/:id/removeaccountant', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: id },
      {
        acountant: '',
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansarestaurant', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// create new shift
router.post('/newshift', async (req, res) => {
  try {
    const lastShift = await Shift.findOne().sort({ _id: -1 }).limit(1);

    if (!lastShift) {
      return res
        .status(404)
        .json({ message: 'No shifts found in the collection' });
    }

    // Update status of lastShift to 'previous'
    lastShift.status = 'previous';
    await lastShift.save();

    const clonedShift = {
      ...lastShift.toObject(),
      _id: mongoose.Types.ObjectId(),
      date: '',
      shift: '',
      cashier: [],
      credit: [],
      cash: [],
      change: [],
      bus: [],
      topup: [],
      received: [],
      acountant: '',
      status: 'current',
    };

    // Set cstock value to ostock for each stock item and reset received and damage to 0
    clonedShift.stock = clonedShift.stock.map((stockItem) => ({
      ...stockItem,
      ostock: stockItem.cstock,
      cstock: 0,
      received: 0,
      damage: 0,
    }));

    // Save the cloned shift
    const newShift = new Shift(clonedShift);
    await newShift.save();

    res.json(newShift);
    req.app.get('io').emit('chansarestaurant', newShift);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// delete shift
router.delete('/:id', async (req, res) => {
  try {
    const deletedShift = await Shift.findByIdAndDelete(req.params.id);

    if (!deletedShift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    const lastShift = await Shift.findOne().sort({ _id: -1 }).limit(1);
    if (lastShift) {
      lastShift.status = 'current';
      await lastShift.save();
      req.app.get('io').emit('chansarestaurant', lastShift);
    }

    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
