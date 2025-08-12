import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();
import Credit from '../model/Credit.schema.js';

// Get all unpaid credits
router.get('/', async (req, res) => {
  try {
    const credits = await Credit.find();

    req.app.get('io').emit('credit', credits);
    res.status(200).json(credits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all paid credits
router.get('/paid', async (req, res) => {
  try {
    const credits = await Credit.find({ paid: true });
    res.status(200).json(credits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new credit
router.post('/newcredit', async (req, res) => {
  const { name, date, amount } = req.body;
  try {
    if (!name || !date || !amount) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newCredit = {
      name: name.toLowerCase(),
      date,
      amount: Number(amount),
      transactins: [],
    };

    const createdCredit = await Credit.create(newCredit);

    const credits = await Credit.find();

    req.app.get('io').emit('credit', credits);
    res.status(200).json(credits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific credit by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const credit = await Credit.findById(id);

    if (!credit) {
      return res.status(404).json({ message: 'Credit not found' });
    }

    res.status(200).json(credit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a credit by ID
router.post('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { name, date, amount } = req.body;
  try {
    const updatedCredit = await Credit.findByIdAndUpdate(
      id,
      {
        name: name.toLowerCase(),
        date,
        amount: Number(amount),
      },
      {
        new: true,
      },
    );
    if (!updatedCredit) {
      return res.status(404).json({ message: 'Credit not found' });
    }

    const credits = await Credit.find();

    req.app.get('io').emit('credit', credits);
    res.status(200).json(credits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a credit by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCredit = await Credit.findByIdAndDelete(id);

    if (!deletedCredit) {
      return res.status(404).json({ message: 'Credit not found' });
    }

    const credits = await Credit.find();

    req.app.get('io').emit('credit', credits);
    res.status(200).json(credits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new transaction for a specific credit
router.post('/:creditId/newtransaction', async (req, res) => {
  const { creditId } = req.params;
  const { date, type, amount, paid } = req.body;
  try {
    const credit = await Credit.findById(creditId);

    if (!credit) {
      return res.status(404).json({ message: 'Credit not found' });
    }

    const newTransaction = {
      date,
      type: type.toLowerCase(),
      amount: Number(amount),
    };
    credit.transactions.push(newTransaction);
    credit.paid = paid;

    await credit.save();

    const credits = await Credit.find();

    req.app.get('io').emit('credit', credits);
    res.status(200).json(credits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a specific transaction
router.post('/:creditId/updatetransaction/:transactionId', async (req, res) => {
  const { creditId, transactionId } = req.params;
  const { date, type, amount } = req.body;
  try {
    const updatedCredit = await Credit.findOneAndUpdate(
      {
        _id: creditId,
        'transactions._id': mongoose.Types.ObjectId(transactionId),
      },
      {
        $set: {
          'transactions.$.date': date,
          'transactions.$.type': type.toLowerCase(),
          'transactions.$.amount': Number(amount),
        },
      },
      { new: true },
    );

    if (!updatedCredit) {
      return res.status(404).json({ message: 'Credit not found' });
    }

    const credits = await Credit.find();

    req.app.get('io').emit('credit', credits);
    res.status(200).json(credits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a specific transaction
router.delete(
  '/:creditId/deletetransaction/:transactionId',
  async (req, res) => {
    const { creditId, transactionId } = req.params;
    try {
      const updatedCredit = await Credit.findByIdAndUpdate(
        creditId,
        {
          $pull: {
            transactions: {
              _id: mongoose.Types.ObjectId(transactionId),
            },
          },
        },
        { new: true },
      );

      if (!updatedCredit) {
        return res.status(404).json({ message: 'Credit not found' });
      }

      const credits = await Credit.find();

      req.app.get('io').emit('credit', credits);
      res.status(200).json(credits);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
