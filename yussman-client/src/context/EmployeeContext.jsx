import { createContext, useEffect, useReducer, useState } from 'react';
import socket from '../helpers/socket';
import apiCall from '../helpers/apiCall';

import { EMPLOYEE_URL } from '../helpers/variables';

export const EmployeeContext = createContext();

const employeeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_EMPLOYEES':
      return {
        employees: action.payload,
      };
    default:
      return state;
  }
};

const transactionReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
      };
    case 'SET_PAGINATED_PAID_TRANSACTIONS':
      return {
        ...state,
        paginatedPaidTransactions: action.payload,
      };
    default:
      return state;
  }
};

// eslint-disable-next-line react/prop-types
export const EmployeeContextProvider = ({ children }) => {
  const [employees, employeeDispatch] = useReducer(employeeReducer, {
    employees: null,
  });

  const [transactions, transactionDispatch] = useReducer(transactionReducer, {
    transactions: null,
  });
  const [uniqueMonths, setUniqueMonths] = useState([]);

  useEffect(() => {
    const getEmployees = async () => {
      const { data } = await apiCall.get(`${EMPLOYEE_URL}/getemployees`);
      employeeDispatch({ type: 'SET_EMPLOYEES', payload: data });
    };
    getEmployees();
  }, []);

  useEffect(() => {
    const getTransactions = async () => {
      const { data } = await apiCall.get(`${EMPLOYEE_URL}/gettransactions`);
      fetchPaginatedPaidTransactions();
      transactionDispatch({ type: 'SET_TRANSACTIONS', payload: data });
    };
    getTransactions();
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.on('employees', (data) => {
      employeeDispatch({ type: 'SET_EMPLOYEES', payload: data });
    });

    socket.on('employeeTransactions', (data) => {
      transactionDispatch({ type: 'SET_TRANSACTIONS', payload: data });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });
    return () => {
      socket.off('employees');
      socket.off('employeeTransactions');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  const fetchPaginatedPaidTransactions = async (month) => {
    try {
      const { data } = await apiCall.get(
        `${EMPLOYEE_URL}/getpaidtransactions/${month || ''}`,
      );
      transactionDispatch({
        type: 'SET_PAGINATED_PAID_TRANSACTIONS',
        payload: data.transactions,
      });
      // remove first 2 characters from the string
      const uniqueMonths = data.uniqueMonths.map((month) => month.slice(2));
      setUniqueMonths(uniqueMonths);
    } catch (error) {
      console.error(
        'Error fetching paginated paid transactions:',
        error.message,
      );
    }
  };

  // Group transactions by paid status, sort by status and date
  const processTransactions = (transactions) => {
    // If transactions is null, default to an empty array
    transactions = transactions || [];

    const paidTransactions = [];
    const unpaidTransactions = [];

    transactions.forEach((transaction) => {
      if (transaction.paid) {
        paidTransactions.push(transaction);
      } else {
        unpaidTransactions.push(transaction);
      }
    });

    // Sort paid transactions by status (benefit, credit, salary, shortage) and date
    const sortedPaidTransactions = paidTransactions.sort((a, b) => {
      const statusOrder = {
        benefit: 1,
        credit: 2,
        allowance: 3,
        salary: 4,
        shortage: 5,
      };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    // Sort unpaid transactions by status (benefit, credit, salary shortage) and date
    const sortedUnpaidTransactions = unpaidTransactions.sort((a, b) => {
      const statusOrder = {
        benefit: 1,
        credit: 2,
        allowance: 3,
        salary: 4,
        shortage: 5,
      };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    return {
      groupedPaidTransactions: sortedPaidTransactions,
      unpaidTransactions: sortedUnpaidTransactions,
    };
  };

  const { groupedPaidTransactions: paidTransactions, unpaidTransactions } =
    processTransactions(transactions.transactions);

  return (
    <EmployeeContext.Provider
      value={{
        employees: employees.employees,
        paidTransactions,
        unpaidTransactions,
        paginatedPaidTransactions: transactions.paginatedPaidTransactions,
        fetchPaginatedPaidTransactions,
        uniqueMonths,
      }}>
      {children}
    </EmployeeContext.Provider>
  );
};
