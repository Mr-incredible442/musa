import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();

import Store from '../model/ChansaStore.schema.js';

router.get('/', async (req, res) => {
  try {
    const store = await Store.findOne().sort({ _id: -1 }).limit(1);

    res.json(store);
    req.app.get('io').emit('chansastore', store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// new shift
router.post('/newshift', async (req, res) => {
  try {
    const lastShift = await Store.findOne().sort({ _id: -1 }).limit(1);

    if (!lastShift) {
      return res
        .status(404)
        .json({ message: 'No shifts found in the collection' });
    }

    const clonedShift = {
      ...lastShift.toObject(),
      _id: mongoose.Types.ObjectId(),
      date: '',
      accountant: '',
      checkedBy: '',
      keeper: '',
      issued: [],
      received: [],
    };

    const receivedSum = lastShift.received.reduce((acc, item) => {
      if (acc[item.code]) {
        acc[item.code] += item.quantity;
      } else {
        acc[item.code] = item.quantity;
      }
      return acc;
    }, {});

    const issuedSum = lastShift.issued.reduce((acc, item) => {
      if (acc[item.code]) {
        acc[item.code] += item.quantity;
      } else {
        acc[item.code] = item.quantity;
      }
      return acc;
    }, {});

    clonedShift.stock = clonedShift.stock.map((stockItem) => {
      const stockCode = stockItem.code;
      const receivedQuantity = receivedSum[stockCode] || 0;
      const issuedQuantity = issuedSum[stockCode] || 0;
      const damageQuantity = stockItem.damage || 0;

      const positiveNumbers = stockItem.ostock + receivedQuantity;
      const negativeNumbers = issuedQuantity + damageQuantity;

      const newOstock = positiveNumbers - negativeNumbers;

      return {
        ...stockItem,
        ostock: newOstock < 0 ? 0 : newOstock,
        cstock: 0,
        received: 0,
        issued: 0,
        damage: 0,
      };
    });

    const newShift = new Store(clonedShift);
    newShift.save();

    res.status(201).json(newShift);
    req.app.get('io').emit('chansastore', newShift);
  } catch (error) {
    res.status(500).json({ error });
  }
});

// get all store shfts
router.get('/shifts', async (req, res) => {
  try {
    const shifts = await Store.find();

    res.json(shifts);
  } catch {
    res.status(500).json({ message: error.message });
  }
});

// get a single shift
router.get('/:id', async (req, res) => {
  try {
    const shift = await Store.findOne({ _id: req.params.id });

    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete a shift
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedShift = await Store.findByIdAndDelete(id);

    if (!deletedShift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// create a stock item
router.post('/:id/addtostock', async (req, res) => {
  try {
    const { id } = req.params;
    const { price, name, section, ostock } = req.body;

    const ostockValue = ostock !== undefined ? ostock : 0;

    // Find the latest code and increment it by 1
    const maxCodeResult = await Store.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(id) } },
      { $unwind: '$stock' },
      { $group: { _id: null, maxCode: { $max: '$stock.code' } } },
    ]);
    const generatedCode = (maxCodeResult[0]?.maxCode || 19999) + 1;

    const updatedShift = await Store.findByIdAndUpdate(
      id,
      {
        $push: {
          stock: {
            _id: mongoose.Types.ObjectId(),
            code: generatedCode,
            price: Number(price),
            name: name.toLowerCase(),
            ostock: Number(ostockValue),
            damage: 0,
            received: 0,
            issued: 0,
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

    res.json(updatedShift);
    req.app.get('io').emit('chansastore', updatedShift);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//update a stock item
router.post('/:id/updatename/:stockId', async (req, res) => {
  try {
    const { id, stockId } = req.params;
    const { price, name } = req.body;

    const updatedShift = await Store.findOneAndUpdate(
      { _id: id, 'stock._id': mongoose.Types.ObjectId(stockId) },
      {
        $set: {
          'stock.$.price': Number(price),
          'stock.$.name': name.toLowerCase(),
        },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansastore', updatedShift);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//update  ostock  and damage
router.post('/:id/updatestock/:stockId', async (req, res) => {
  try {
    const { id, stockId } = req.params;
    const { ostock, damage } = req.body;

    const updatedShift = await Store.findOneAndUpdate(
      { _id: id, 'stock._id': mongoose.Types.ObjectId(stockId) },
      {
        $set: {
          'stock.$.ostock': Number(ostock),
          'stock.$.damage': Number(damage),
        },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansastore', updatedShift);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//delete a stock item
router.post('/:id/deleteStock/:stockId', async (req, res) => {
  try {
    const { id, stockId } = req.params;

    const updatedShift = await Store.findOneAndUpdate(
      { _id: id },
      { $pull: { stock: { _id: mongoose.Types.ObjectId(stockId) } } },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansastore', updatedShift);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//add date to shift
router.post('/:id/adddate', async (req, res) => {
  try {
    const { date } = req.body;
    const { id } = req.params;

    const updatedShift = await Store.findOneAndUpdate(
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
    req.app.get('io').emit('chansastore', updatedShift);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//delete date from shift
router.post('/:id/deletedate', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedShift = await Store.findOneAndUpdate(
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
    req.app.get('io').emit('chansastore', updatedShift);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//add a keeper
router.post('/:id/addkeeper', async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const updatedShift = await Store.findOneAndUpdate(
      { _id: id },
      {
        keeper: name,
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansastore', updatedShift);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//delete a keeper
router.post('/:id/deletekeeper', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedShift = await Store.findOneAndUpdate(
      { _id: id },
      {
        keeper: '',
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansastore', updatedShift);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//add accountant
router.post('/:id/addaccountant', async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const updatedShift = await Store.findOneAndUpdate(
      { _id: id },
      {
        accountant: name,
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansastore', updatedShift);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//delete accountant
router.post('/:id/deleteaccountant', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedShift = await Store.findOneAndUpdate(
      { _id: id },
      {
        accountant: '',
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansastore', updatedShift);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//add checkedBy
router.post('/:id/addcheckedby', async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const updatedShift = await Store.findOneAndUpdate(
      { _id: id },
      {
        checkedBy: name,
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansastore', updatedShift);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//delete checkedBy
router.post('/:id/deletecheckedby', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedShift = await Store.findByIdAndUpdate(
      id,
      {
        checkedBy: '',
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansastore', updatedShift);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//add received
router.post('/:id/addreceived', async (req, res) => {
  try {
    const { name, code, quantity } = req.body;
    const { id } = req.params;

    const newReceivedObject = {
      _id: mongoose.Types.ObjectId(),
      code: Number(code),
      name: name.toLowerCase(),
      quantity: Number(quantity),
    };

    const updatedShift = await Store.findByIdAndUpdate(
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
    req.app.get('io').emit('chansastore', updatedShift);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//delete received
router.post('/:id/deletereceived/:receivedId', async (req, res) => {
  try {
    const { id, receivedId } = req.params;

    const updatedShift = await Store.findByIdAndUpdate(
      id,
      {
        $pull: { received: { _id: mongoose.Types.ObjectId(receivedId) } },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansastore', updatedShift);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//add issued
router.post('/:id/addissued', async (req, res) => {
  try {
    const { name, code, to, quantity } = req.body;
    const { id } = req.params;

    const newIssuedObject = {
      _id: mongoose.Types.ObjectId(),
      code: Number(code),
      name: name.toLowerCase(),
      to: to.toLowerCase(),
      quantity: Number(quantity),
      approved: false,
    };

    const updatedShift = await Store.findByIdAndUpdate(
      id,
      {
        $push: { issued: newIssuedObject },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansastore', updatedShift);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//delete issued
router.post('/:id/deleteissued/:issuedId', async (req, res) => {
  try {
    const { id, issuedId } = req.params;

    const updatedShift = await Store.findByIdAndUpdate(
      id,
      {
        $pull: { issued: { _id: mongoose.Types.ObjectId(issuedId) } },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('chansastore', updatedShift);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
