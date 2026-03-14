import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();

import Report from '../model/Report.schema.js';

const SOCKET_EVENT = 'report';

const buildDefaultReport = () => ({
  date: '',
  cashIn: [
    { name: 'previousDayBalance', amount: 0 },
    { name: 'shop', amount: 0 },
  ],
  cashOut: [],
  cashMobile: [
    { name: 'airtelMoney', amount: 0 },
    { name: 'mtnMoney', amount: 0 },
    { name: 'cash', amount: 0 },
    { name: 'coins', amount: 0 },
    { name: 'change', amount: 0 },
  ],
  status: 'current',
});

// get all reports
router.get('/all', async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get reports for a specific month in a year or the latest month
router.get('/paginatedreports/:year?/:month?', async (req, res) => {
  try {
    const { year, month } = req.params;

    if (year && month) {
      const startOfMonth = `${year}-${month}-01`;
      const lastDay = new Date(year, month, 0);
      const endOfMonth = `${lastDay.getFullYear()}-${(lastDay.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${lastDay.getDate().toString().padStart(2, '0')}`;

      const reports = await Report.find({
        date: { $gte: startOfMonth, $lte: endOfMonth },
      });

      const latestReport = await Report.findOne({
        status: 'current',
        date: '',
      }).sort({ _id: -1 });

      const allDistinctMonths = await Report.aggregate([
        { $match: { date: { $ne: '' } } },
        { $addFields: { date: { $toDate: '$date' } } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
          },
        },
        { $project: { _id: 0, year: '$_id.year', month: '$_id.month' } },
        { $sort: { year: 1, month: 1 } },
        { $sort: { year: -1, month: -1 } },
        { $limit: 1 },
      ]);

      let finalReports = [...reports];
      if (
        allDistinctMonths.length > 0 &&
        allDistinctMonths[0].year === parseInt(year) &&
        allDistinctMonths[0].month === parseInt(month) &&
        latestReport
      ) {
        finalReports.unshift(latestReport);
      }

      const distinctYearsMonths = await Report.aggregate([
        { $match: { date: { $ne: '' } } },
        { $addFields: { date: { $toDate: '$date' } } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
          },
        },
        { $project: { _id: 0, year: '$_id.year', month: '$_id.month' } },
        { $sort: { year: 1, month: 1 } },
        { $sort: { year: -1, month: -1 } },
      ]);

      res.json({ current: `${year}/${month}`, distinctYearsMonths, reports: finalReports });
    } else {
      const today = new Date();
      const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
      const currentYear = today.getFullYear();
      const startOfMonth = `${currentYear}-${currentMonth}-01`;
      const lastDay = new Date(currentYear, currentMonth, 0);
      const endOfMonth = `${lastDay.getFullYear()}-${(lastDay.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${lastDay.getDate().toString().padStart(2, '0')}`;

      const reports = await Report.find({
        date: { $gte: startOfMonth, $lte: endOfMonth },
      });

      const latestReport = await Report.findOne({
        status: 'current',
        date: '',
      }).sort({ _id: -1 });

      let finalReports = [...reports];
      if (latestReport) {
        finalReports.unshift(latestReport);
      }

      const distinctYearsMonths = await Report.aggregate([
        { $match: { date: { $ne: '' } } },
        { $addFields: { date: { $toDate: '$date' } } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
          },
        },
        { $project: { _id: 0, year: '$_id.year', month: '$_id.month' } },
        { $sort: { year: 1, month: 1 } },
        { $sort: { year: -1, month: -1 } },
      ]);

      res.json({
        current: `${currentYear}/${currentMonth}`,
        distinctYearsMonths,
        reports: finalReports,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get the current report
router.get('/', async (req, res) => {
  try {
    let currentReport = await Report.findOne().sort({ _id: -1 }).limit(1);

    if (!currentReport) {
      const newReport = new Report(buildDefaultReport());
      currentReport = await newReport.save();
    }

    res.json(currentReport);
    req.app.get('io').emit(SOCKET_EVENT, currentReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get a single report
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    res.json(report);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// create a new report
router.post('/', async (req, res) => {
  try {
    const previousReport = await Report.findOne().sort({ _id: -1 }).limit(1);

    if (!previousReport) {
      return res.status(404).json({ message: 'No previous report found' });
    }

    const previousBalance =
      previousReport.cashIn.reduce((acc, curr) => acc + curr.amount, 0) -
      previousReport.cashOut.reduce((acc, curr) => acc + curr.amount, 0);

    const newReport = {
      date: '',
      cashIn: [
        { name: 'previousDayBalance', amount: previousBalance },
        { name: 'shop', amount: 0 },
      ],
      cashOut: [],
      cashMobile: [
        { name: 'airtelMoney', amount: 0 },
        { name: 'mtnMoney', amount: 0 },
        { name: 'cash', amount: 0 },
        { name: 'coins', amount: 0 },
        { name: 'change', amount: 0 },
      ],
      status: 'current',
    };

    previousReport.status = 'previous';
    await previousReport.save();

    const newReportDoc = new Report(newReport);
    await newReportDoc.save();
    res.json(newReportDoc);
    req.app.get('io').emit(SOCKET_EVENT, newReportDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a report
router.post('/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;
    await Report.findByIdAndDelete(id);
    const latestPreviousReport = await Report.findOne()
      .sort({ _id: -1 })
      .limit(1);

    latestPreviousReport.status = 'current';
    await latestPreviousReport.save();

    const allReports = await Report.find();

    res.json(allReports);
    req.app.get('io').emit(SOCKET_EVENT, latestPreviousReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// update individual cash in amount
router.post('/:id/updatecashin', async (req, res) => {
  try {
    const { id } = req.params;
    const { field, amount } = req.body;
    const updatedReport = await Report.findOneAndUpdate(
      { _id: id },
      { $set: { [`cashIn.${field}.amount`]: Number(amount) } },
      { new: true },
    );
    res.json(updatedReport);
    req.app.get('io').emit(SOCKET_EVENT, updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add a new cash in
router.post('/:id/addcashin', async (req, res) => {
  try {
    const { id } = req.params;
    const { field, amount } = req.body;
    const updatedReport = await Report.findOneAndUpdate(
      { _id: id },
      { $push: { cashIn: { name: field, amount: Number(amount) } } },
      { new: true },
    );
    res.json(updatedReport);
    req.app.get('io').emit(SOCKET_EVENT, updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add a new cash out
router.post('/:id/addcashout', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount } = req.body;
    const updatedReport = await Report.findOneAndUpdate(
      { _id: id },
      {
        $push: {
          cashOut: {
            _id: new mongoose.Types.ObjectId(),
            description: description.toLowerCase(),
            amount: Number(amount),
          },
        },
      },
      { new: true },
    );
    res.json(updatedReport);
    req.app.get('io').emit(SOCKET_EVENT, updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// update individual cash out amount
router.post('/:id/updatecashout', async (req, res) => {
  try {
    const { id } = req.params;
    const { cashOutId, description, amount } = req.body;
    const objectId = new mongoose.Types.ObjectId(cashOutId);

    const updatedReport = await Report.findOneAndUpdate(
      { _id: id, 'cashOut._id': objectId },
      {
        $set: {
          'cashOut.$.description': description.toLowerCase(),
          'cashOut.$.amount': Number(amount),
        },
      },
      { new: true },
    );
    res.json(updatedReport);
    req.app.get('io').emit(SOCKET_EVENT, updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete a cash out
router.post('/:id/deletecashout', async (req, res) => {
  try {
    const { id } = req.params;
    const { cashOutId } = req.body;
    const objectId = new mongoose.Types.ObjectId(cashOutId);
    const updatedReport = await Report.findOneAndUpdate(
      { _id: id, 'cashOut._id': objectId },
      { $pull: { cashOut: { _id: objectId } } },
      { new: true },
    );
    res.json(updatedReport);
    req.app.get('io').emit(SOCKET_EVENT, updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit a cash mobile amount
router.post('/:id/updatecashmobile', async (req, res) => {
  try {
    const { id } = req.params;
    const { field, amount } = req.body;
    const updatedReport = await Report.findOneAndUpdate(
      { _id: id },
      { $set: { [`cashMobile.${field}.amount`]: Number(amount) } },
      { new: true },
    );
    res.json(updatedReport);
    req.app.get('io').emit(SOCKET_EVENT, updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add date
router.post('/:id/adddate', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;
    const updatedReport = await Report.findOneAndUpdate(
      { _id: id },
      { $set: { date } },
      { new: true },
    );
    res.json(updatedReport);
    req.app.get('io').emit(SOCKET_EVENT, updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete date
router.post('/:id/deletedate', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedReport = await Report.findOneAndUpdate(
      { _id: id },
      { $set: { date: '' } },
      { new: true },
    );
    res.json(updatedReport);
    req.app.get('io').emit(SOCKET_EVENT, updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
