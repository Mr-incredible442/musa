import { Router } from 'express';
import { Log } from '../model/Log.schema.js';

const router = Router();

// Get all logs with optional filters and pagination
router.get('/', async (req, res) => {
  try {
    const { ip, userName, method, url, page = 1 } = req.query;
    const limit = 200;
    const skip = (page - 1) * limit;

    // Build a dynamic filter object
    const filter = {};
    if (ip) filter.ip = ip;
    if (userName) filter.userName = userName;
    if (method) filter.method = method;
    if (url) filter.url = new RegExp(url, 'i'); // Case-insensitive search

    const logs = await Log.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    //send how many logs in total
    const totalLogs = await Log.countDocuments(filter);
    const totalPages = Math.ceil(totalLogs / limit);
    res.json({ logs, totalPages });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single log by ID
router.get('/:id', async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log not found' });

    res.json(log);
  } catch (error) {
    console.error('Error fetching log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a log by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await Log.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Log not found' });

    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
