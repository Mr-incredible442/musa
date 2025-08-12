import { Router } from 'express';

const router = Router();
import Employee from '../model/Employee.schema.js';
import EmployeeTransactions from '../model/EmployeeTransactions.Schema.js';

// Function to calculate credit owed for each employee
const calculateCreditOwed = async () => {
  // Fetch all employees
  const employees = await Employee.find();

  // Fetch all transactions
  const transactions = await EmployeeTransactions.find();

  // Calculate `creditOwed` for each employee
  const employeesWithCredit = employees.map((employee) => {
    const employeeTransactions = transactions.filter(
      (transaction) =>
        transaction.employeeId.toString() === employee._id.toString(),
    );

    // Calculate total credit, shortage, and deductions
    const credit = employeeTransactions
      .filter((transaction) => transaction.status === 'credit')
      .reduce((total, current) => total + current.amount, 0);

    const shortage = employeeTransactions
      .filter((transaction) => transaction.status === 'shortage')
      .reduce((total, current) => total + current.amount, 0);

    const deductions = employeeTransactions
      .filter((transaction) => transaction.status === 'salary')
      .reduce((total, current) => total + current.deduction, 0);

    // Compute creditOwed
    const creditOwed = credit + shortage - deductions;

    return {
      ...employee.toObject(),
      creditOwed,
    };
  });

  return employeesWithCredit;
};

// create new employee
router.post('/newemployee', async (req, res) => {
  try {
    const { nrc, firstName, lastName, number, dailySalary, section } = req.body;

    const maxCodeEmployee = await Employee.findOne().sort({ code: -1 });
    const newCode = maxCodeEmployee ? maxCodeEmployee.code + 1 : 1;

    const newEmployee = new Employee({
      code: newCode,
      nrc,
      firstName,
      lastName,
      number,
      dailySalary,
      section,
      creditOwed: 0,
      contract: false,
      contractStart: '',
      contractEnd: '',
      benefitCollectedOn: '',
      fullTime: true,
      status: 'active',
    });

    const savedEmployee = await newEmployee.save();

    const employees = await Employee.find();

    req.app.get('io').emit('employees', employees);
    res.status(201).json(savedEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get all employees
router.get('/getemployees', async (req, res) => {
  try {
    const employeesWithCredit = await calculateCreditOwed();

    req.app.get('io').emit('employees', employeesWithCredit);
    res.status(200).json(employeesWithCredit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get a single employee
router.get('/getemployee/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const employeeTransactions = await EmployeeTransactions.find({
      employeeId: id,
    });

    const employeeData = {
      ...employee.toObject(),
      transactions:
        employeeTransactions.length > 0
          ? employeeTransactions.map((transaction) => transaction.toObject())
          : [],
    };

    res.status(200).json({ employee: employeeData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// update an employee
router.put('/updateemployee/:id', async (req, res) => {
  const { id } = req.params;
  const { nrc, firstName, lastName, number, dailySalary, section } = req.body;
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      {
        nrc,
        firstName,
        lastName,
        number,
        dailySalary,
        section,
      },
      { new: true },
    );

    const employeesWithCredit = await calculateCreditOwed();

    req.app.get('io').emit('employees', employeesWithCredit);
    res.status(200).json(employeesWithCredit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//change an employee's active state
router.post('/togglestatus/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const existingEmployee = await Employee.findById(id);

    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const newStatus =
      existingEmployee.status === 'active' ? 'inactive' : 'active';

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true },
    );

    const employeesWithCredit = await calculateCreditOwed();

    req.app.get('io').emit('employees', employeesWithCredit);
    res.status(200).json(employeesWithCredit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//change an employee's contract state and contract start date
router.post('/togglecontract/:id', async (req, res) => {
  const { id } = req.params;
  const { contractStart, contractEnd } = req.body;

  try {
    const existingEmployee = await Employee.findById(id);

    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { contract: true, contractStart, contractEnd },
      { new: true },
    );

    const employeesWithCredit = await calculateCreditOwed();

    req.app.get('io').emit('employees', employeesWithCredit);
    res.status(200).json(employeesWithCredit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//  create a new employee transaction
router.post('/transaction', async (req, res) => {
  try {
    const {
      date,
      employeeId,
      employeeCode,
      status,
      days,
      dailySalary,
      amount,
      deduction,
      datesWorked,
      comment,
      months,
    } = req.body;

    const newEmployeeTransaction = new EmployeeTransactions({
      date,
      employeeId: employeeId,
      employeeCode,
      status,
      days: status === 'salary' ? days : undefined,
      dailySalary: status === 'salary' ? dailySalary : undefined,
      amount: status === 'salary' ? undefined : amount,
      deduction: status === 'salary' ? deduction : undefined,
      paid: false,
      datesWorked: status === 'salary' ? datesWorked : undefined,
      comment: status === 'shortage' ? comment : undefined,
      months: status === 'allowance' ? months : undefined,
    });

    const savedEmployeeTransaction = await newEmployeeTransaction.save();

    const employeeTransactions = await EmployeeTransactions.find()
      .populate({
        path: 'employeeId',
        model: 'Employee',
        select: 'firstName lastName',
      })
      .exec();

    const formattedTransactions = employeeTransactions.map((transaction) => {
      const { firstName, lastName } = transaction.employeeId;
      return {
        ...transaction.toObject(),
        firstName,
        lastName,
      };
    });

    const employeesWithCredit = await calculateCreditOwed();

    req.app.get('io').emit('employeeTransactions', formattedTransactions);
    req.app.get('io').emit('employees', employeesWithCredit);
    res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// get only unpaid employee transactions
router.get('/gettransactions', async (req, res) => {
  try {
    const employeeTransactions = await EmployeeTransactions.find({
      paid: false,
    })
      .populate({
        path: 'employeeId',
        model: 'Employee',
        select: 'firstName lastName',
      })
      .exec();

    const formattedTransactions = employeeTransactions.map((transaction) => {
      const { firstName, lastName } = transaction.employeeId;
      return {
        ...transaction.toObject(),
        firstName,
        lastName,
      };
    });

    const employeesWithCredit = await calculateCreditOwed();

    req.app.get('io').emit('employeeTransactions', formattedTransactions);
    req.app.get('io').emit('employees', employeesWithCredit);
    res.status(200).json(formattedTransactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get only paid employee transactions and paginate by month default to the latest month
router.get('/getpaidtransactions/:month?', async (req, res) => {
  const { month } = req.params;
  const currentMonth = new Date().toISOString().slice(0, 7); // Get current month in YYYY-MM format
  const searchMonth = month || currentMonth;

  try {
    let employeeTransactions = await EmployeeTransactions.find({
      paid: true,
      date: { $regex: searchMonth },
    })
      .populate({
        path: 'employeeId',
        model: 'Employee',
        select: 'firstName lastName',
      })
      .exec();

    const formattedTransactions = employeeTransactions.map((transaction) => {
      const { firstName, lastName } = transaction.employeeId;
      return {
        ...transaction.toObject(),
        firstName,
        lastName,
      };
    });

    // Get unique months from transactions
    let allTransactions = await EmployeeTransactions.find();
    const uniqueMonths = [
      ...new Set(
        allTransactions.map((transaction) => transaction.date.slice(0, 7)),
      ),
    ];

    const employeesWithCredit = await calculateCreditOwed();

    req.app.get('io').emit('employees', employeesWithCredit);
    res.status(200).json({ transactions: formattedTransactions, uniqueMonths });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// delete an employee transaction
router.delete('/deletetransaction/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedEmployeeTransaction =
      await EmployeeTransactions.findByIdAndDelete(id);

    const employeeTransactions = await EmployeeTransactions.find()
      .populate({
        path: 'employeeId',
        model: 'Employee',
        select: 'firstName lastName',
      })
      .exec();

    const formattedTransactions = employeeTransactions.map((transaction) => {
      const { firstName, lastName } = transaction.employeeId;
      return {
        ...transaction.toObject(),
        firstName,
        lastName,
      };
    });

    const employeesWithCredit = await calculateCreditOwed();

    req.app.get('io').emit('employees', employeesWithCredit);
    req.app.get('io').emit('employeeTransactions', formattedTransactions);
    res.status(200).json(formattedTransactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// update an employee transaction
router.put('/updatetransaction/:id', async (req, res) => {
  const { id } = req.params;
  const {
    date,
    employeeId,
    employeeCode,
    status,
    days,
    dailySalary,
    amount,
    paid,
  } = req.body;
  try {
    const updatedEmployeeTransaction =
      await EmployeeTransactions.findByIdAndUpdate(
        id,
        {
          date,
          employeeId,
          employeeCode,
          status,
          days,
          dailySalary,
          amount,
          paid,
        },
        { new: true },
      );

    const employeeTransactions = await EmployeeTransactions.find()
      .populate({
        path: 'employeeId',
        model: 'Employee',
        select: 'firstName lastName',
      })
      .exec();

    const formattedTransactions = employeeTransactions.map((transaction) => {
      const { firstName, lastName } = transaction.employeeId;
      return {
        ...transaction.toObject(),
        firstName,
        lastName,
      };
    });

    const employeesWithCredit = await calculateCreditOwed();

    req.app.get('io').emit('employees', employeesWithCredit);
    req.app.get('io').emit('employeeTransactions', formattedTransactions);
    res.status(200).json(formattedTransactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// update an employee paid status
router.post('/updatetransaction/paid', async (req, res) => {
  const { transactionIds } = req.body;

  try {
    await EmployeeTransactions.updateMany(
      { _id: { $in: transactionIds } },
      { $set: { paid: true } },
    );

    const employeeTransactions = await EmployeeTransactions.find()
      .populate({
        path: 'employeeId',
        model: 'Employee',
        select: 'firstName lastName',
      })
      .exec();

    const formattedTransactions = employeeTransactions.map((transaction) => {
      const { firstName, lastName } = transaction.employeeId;
      return {
        ...transaction.toObject(),
        firstName,
        lastName,
      };
    });

    const employeesWithCredit = await calculateCreditOwed();

    req.app.get('io').emit('employees', employeesWithCredit);
    req.app.get('io').emit('employeeTransactions', formattedTransactions);
    res.status(200).json(formattedTransactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
