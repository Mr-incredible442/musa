import { useContext, useEffect, useState } from 'react';
import {
  Container,
  Table,
  OverlayTrigger,
  Tooltip,
  Pagination,
} from 'react-bootstrap';

import { EmployeeContext } from '../../context/EmployeeContext';

function Paid() {
  const {
    paginatedPaidTransactions,
    fetchPaginatedPaidTransactions,
    uniqueMonths,
  } = useContext(EmployeeContext);
  const [groupedPaidTransactions, setGroupedPaidTransactions] = useState({});
  const [activeMonth, setActiveMonth] = useState(null);

  useEffect(() => {
    if (!Array.isArray(paginatedPaidTransactions)) {
      return;
    }
    let activeMonth = paginatedPaidTransactions[0]?.date.slice(0, 7).slice(2);
    setActiveMonth(activeMonth);

    const sortedTransactions = [...paginatedPaidTransactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    const groupedTransactions = sortedTransactions.reduce(
      (acc, transaction) => {
        const date = transaction.date;
        if (!acc[date]) {
          acc[date] = [transaction];
        } else {
          acc[date].push(transaction);
        }
        return acc;
      },
      {},
    );

    setGroupedPaidTransactions(groupedTransactions);
  }, [paginatedPaidTransactions]);

  const formatDatesAsList = (dates) => {
    return (
      <ul style={{ listStyleType: 'none', padding: '0', margin: '0' }}>
        {dates.map((date, index) => {
          const dateString = new Date(date).toLocaleDateString(); // Format date as a string
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

  return (
    <Container>
      <div className='d-flex justify-content-center my-3 gap-1'>
        {uniqueMonths
          .map((month, index) => (
            <Pagination key={index} size='sm'>
              <Pagination.Item
                active={activeMonth === month}
                onClick={() => {
                  fetchPaginatedPaidTransactions(month);
                  setActiveMonth(month);
                }}>
                {month}
              </Pagination.Item>
            </Pagination>
          ))
          .reverse()}
      </div>
      <Table responsive className='my-3 text-capitalize text-center'>
        <thead>
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
          </tr>
        </thead>
        {Object.entries(groupedPaidTransactions).map(([date, transactions]) => (
          <tbody className='table-group-divider' key={date}>
            <tr className='border-bottom border-2'>
              <td colSpan={6} className='text-capitalize'>
                {date}
              </td>
              <td>Total :</td>
              <td>
                K
                {transactions
                  .reduce((sum, transaction) => {
                    if (transaction.status === 'shortage') {
                      return sum;
                    }
                    return (
                      sum +
                      (transaction.status === 'benefit' ||
                      transaction.status === 'credit' ||
                      transaction.status === 'shortage' ||
                      transaction.status === 'allowance'
                        ? transaction.amount
                        : transaction.days * transaction.dailySalary -
                          transaction.deduction)
                    );
                  }, 0)
                  .toFixed(2)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </td>
            </tr>
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td>{transaction.date}</td>
                <td>{transaction.employeeCode}</td>
                <td>{transaction.firstName}</td>
                <td>{transaction.lastName}</td>
                {transaction.status === 'shortage' ? (
                  <td colSpan={4}>{transaction.comment}</td>
                ) : (
                  <>
                    <td>
                      {transaction.datesWorked &&
                      transaction.datesWorked.length > 0 ? (
                        <OverlayTrigger
                          placement='top'
                          overlay={
                            <Tooltip id={`tooltip-${transaction._id}`}>
                              {formatDatesAsList(transaction.datesWorked)}
                            </Tooltip>
                          }>
                          <span className='initialism'>
                            {getShortenedDatePreview(
                              transaction.datesWorked,
                              transaction.status,
                            )}
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
                      : transaction.status === 'shortage'
                      ? 'border-2 border-success-subtle'
                      : transaction.status === 'allowance'
                      ? 'border-2 border-primary-subtle'
                      : ''
                  }>
                  {transaction.status}
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </Table>
    </Container>
  );
}

export default Paid;
