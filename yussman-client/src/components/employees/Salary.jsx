import { useContext, useEffect, useState } from 'react';

import { Container, Table, Tooltip, OverlayTrigger } from 'react-bootstrap';
import RegisterSalaryModal from './modals/RegisterSalaryModal';
import DeleteTransaction from './modals/DeleteTransactionModal';
import PaymentConfirm from './modals/PaymentConfirmModal';

import { EmployeeContext } from '../../context/EmployeeContext';
import { AuthContext } from '../../context/AuthContext';

function Salary() {
  const { unpaidTransactions } = useContext(EmployeeContext);
  const [totalSum, setTotalSum] = useState(0);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const sum = unpaidTransactions.reduce((accumulator, transaction) => {
      if (
        transaction.status === 'benefit' ||
        transaction.status === 'credit' ||
        transaction.status === 'allowance'
      ) {
        return accumulator + transaction.amount;
      } else if (transaction.status === 'salary') {
        return (
          accumulator +
          transaction.days * transaction.dailySalary -
          transaction.deduction
        );
      }
      return accumulator;
    }, 0);
    setTotalSum(sum);
  }, [unpaidTransactions]);

  const formatDatesAsList = (dates) => {
    return (
      <ul style={{ listStyleType: 'none', padding: '0', margin: '0' }}>
        {dates.map((date, index) => {
          const dateString = new Date(date).toLocaleDateString();
          return <li key={index}>{dateString}</li>;
        })}
      </ul>
    );
  };

  const getShortenedDatePreview = (dates, status) => {
    if (status === 'credit' || status === 'benefit' || dates.length === 0)
      return '';

    const sortedDates = dates
      .map((date) => new Date(date))
      .sort((a, b) => a - b);
    const firstDate = sortedDates[0];
    const lastDate = sortedDates[sortedDates.length - 1];

    const firstDateStr = firstDate.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
    });
    const lastDateStr = lastDate.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
    });

    return sortedDates.length > 1
      ? `${firstDateStr} - ${lastDateStr}`
      : firstDateStr;
  };

  function formatMonths(months) {
    // Map each element of the array to a shortened format (e.g., "2024-08-31" to "Aug 2024")
    const formattedMonths = months.map((month) => {
      const date = new Date(month);
      return date.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
    });

    // Join the array into a string separated by commas
    return formattedMonths.join(', ');
  }

  return (
    <Container>
      <div className='my-2 d-flex justify-content-around align-items-center '>
        <RegisterSalaryModal />
        {user && user.role === 'admin' && (
          <PaymentConfirm unpaidTransactions={unpaidTransactions} />
        )}
      </div>
      <Table responsive bordered className='my-3 text-capitalize text-center'>
        <thead>
          <tr>
            <th colSpan={10} className='text-info'>
              K{totalSum.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </th>
          </tr>
          <tr>
            <th>Date</th>
            <th>Code</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Dates Worked</th>
            <th>Days</th>
            <th>Salary</th>
            <th>Deduction</th>
            <th>Total</th>
            <th>Status</th>
            {user && user.role === 'admin' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody className='table-group-divider'>
          {unpaidTransactions.length > 0
            ? unpaidTransactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  className={
                    transaction.status === 'shortage'
                      ? 'border border-3 border-primary-subtle'
                      : ''
                  }>
                  <td>{transaction.date}</td>
                  <td>{transaction.employeeCode}</td>
                  <td>{transaction.firstName}</td>
                  <td>{transaction.lastName}</td>
                  {transaction.status === 'shortage' ? (
                    <td colSpan={4}>{transaction.comment}</td>
                  ) : transaction.status === 'allowance' ? (
                    <td colSpan={4}>{formatMonths(transaction.months)}</td>
                  ) : transaction.status === 'credit' ||
                    transaction.status === 'benefit' ? (
                    <td colSpan={4}></td>
                  ) : (
                    <>
                      <td>
                        {transaction.datesWorked.length > 0 &&
                        transaction.status !== 'credit' &&
                        transaction.status !== 'benefit' ? (
                          <OverlayTrigger
                            placement='top'
                            overlay={
                              <Tooltip id={`tooltip-${transaction._id}`}>
                                {formatDatesAsList(transaction.datesWorked)}
                              </Tooltip>
                            }>
                            <span className='initialism'>
                              {getShortenedDatePreview(transaction.datesWorked)}
                            </span>
                          </OverlayTrigger>
                        ) : (
                          ''
                        )}
                      </td>
                      <td>{transaction.days}</td>
                      <td>
                        {transaction.dailySalary > 0
                          ? `K${transaction.dailySalary}`
                          : ''}
                      </td>
                      <td>
                        {transaction.deduction > -1
                          ? `K${transaction.deduction}`
                          : ''}
                      </td>
                    </>
                  )}

                  <td>
                    K
                    {transaction.amount > 0
                      ? transaction.amount
                          .toFixed(2)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      : (
                          transaction.days * transaction.dailySalary -
                          transaction.deduction
                        )
                          .toFixed(2)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </td>
                  <td
                    className={
                      transaction.status === 'benefit'
                        ? 'border-2 border-warning-subtle'
                        : transaction.status === 'credit'
                        ? 'border-2 border-info-subtle'
                        : transaction.status === 'allowance'
                        ? 'border-2 border-primary-subtle'
                        : ''
                    }>
                    {transaction.status === 'allowance'
                      ? 'H .Allowance'
                      : transaction.status}
                  </td>
                  {user && user.role === 'admin' && (
                    <td className='d-flex justify-content-center gap-2 align-items-center'>
                      <DeleteTransaction id={transaction._id} />
                    </td>
                  )}
                </tr>
              ))
            : null}
        </tbody>
      </Table>
    </Container>
  );
}

export default Salary;
