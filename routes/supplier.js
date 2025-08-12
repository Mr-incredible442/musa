import express from 'express';
import Supplier from '../model/Supplier.schema.js';

const router = express.Router();

// get all
router.get('/', async (req, res) => {
  try {
    const supplier = await Supplier.find({ paid: false });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  socketConnect(req.app.get('io'));
});

//paginated paid suppliers 100 items per page
router.get('/paid', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1); // Ensure page is at least 1
    const limit = 100;
    const skip = (page - 1) * limit;

    const [suppliers, count] = await Promise.all([
      Supplier.find({ paid: true }).sort({ date: -1 }).skip(skip).limit(limit),
      Supplier.countDocuments({ paid: true }),
    ]);

    const pages = Math.ceil(count / limit);

    res.json({ suppliers, count, pages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// post
router.post('/', async (req, res) => {
  const supplier = new Supplier({
    name: req.body.name,
    kgs: req.body.kgs,
    date: req.body.date,
    collectionDate: req.body.collectionDate,
    paid: false,
    paidBy: '',
  });
  try {
    const newSupplier = await supplier.save();
    res.status(201).json(newSupplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
  socketConnect(req.app.get('io'));
});

// get single
router.get('/:id', getSuppplier, (req, res) => {
  res.json(res.supplier);
  socketConnect(req.app.get('io'));
});

//delete
router.delete('/:id', getSuppplier, async (req, res) => {
  try {
    await res.supplier.remove();
    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  socketConnect(req.app.get('io'));
});

// patch
router.patch('/:id', getSuppplier, async (req, res) => {
  if (req.body.name != null) {
    res.supplier.name = req.body.name;
  }
  if (req.body.kgs != null) {
    res.supplier.kgs = req.body.kgs;
  }
  if (req.body.date != null) {
    res.supplier.date = req.body.date;
  }
  if (req.body.collectionDate != null) {
    res.supplier.collectionDate = req.body.collectionDate;
  }
  if (req.body.paid != null) {
    res.supplier.paid = req.body.paid;
  }
  if (req.body.paidBy != null) {
    res.supplier.paidBy = req.body.paidBy;
  }
  try {
    const updatedSupplier = await res.supplier.save();
    res.json(updatedSupplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
  socketConnect(req.app.get('io'));
});

//get id using middleware
async function getSuppplier(req, res, next) {
  let supplier;
  try {
    supplier = await Supplier.findById(req.params.id);
    if (supplier === null) {
      return res.status(404).json({ message: 'Can not find Supplier' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.supplier = supplier;
  next();
}

export const socketConnect = async (io) => {
  const suppliers = await Supplier.find({ paid: false });
  io.emit('suppliers', suppliers);
};

export default router;
