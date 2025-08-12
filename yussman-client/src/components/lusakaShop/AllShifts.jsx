import { useCallback, useEffect, useState } from 'react';
import apiCall from '../../helpers/apiCall';

import { Container, Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';

import { LUSAKA_SHOP_URL } from '../../helpers/variables';
import { Link } from 'react-router-dom';
import DeleteShift from './modals/DeleteShift';

function AllShifts() {
  const today = new Date();
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = today.getFullYear();

  const [shifts, setShifts] = useState(null);
  const [disableDeleteBtn, setDisableDeleteBtn] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    `/${currentYear}/${currentMonth}`,
  );
  const [totalCash, setTotalCash] = useState(0);

  const fetchData = useCallback(() => {
    apiCall
      .get(`${LUSAKA_SHOP_URL}/paginatedshifts${currentPage}`)
      .then((res) => {
        setShifts(res.data);
        setDisableDeleteBtn(false);

        // Calculate total cash directly after fetching data
        if (res.data.shifts) {
          const totalCash = res.data.shifts.reduce((acc, shift) => {
            return (
              acc +
              shift.cash.reduce(
                (shiftAcc, cashValue) => shiftAcc + cashValue,
                0,
              )
            );
          }, 0);
          setTotalCash(totalCash.toFixed(2)); // Set the total cash
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [currentPage]);

  useEffect(() => {
    fetchData();
  }, [currentPage, fetchData]);

  // Update currentPage if shifts have a current property
  useEffect(() => {
    if (shifts !== null && shifts.current) {
      setCurrentPage(`/${shifts.current}`);
    }
  }, [shifts]);

  let sortedShifts = null;
  if (shifts !== null) {
    sortedShifts = shifts.shifts.sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
  }

  const handleCurrentPage = (page) => {
    const month = page.split('/')[2];
    const formattedMonth = month < 10 ? `0${month}` : month;
    const finalPath = `/${page.split('/')[1]}/${formattedMonth}`;
    setCurrentPage(finalPath);
  };

  // Early return with loading state
  if (shifts === null) return <div>Loading...</div>;

  return (
    <Container>
      <div className='d-flex justify-content-end'></div>
      <div className='d-flex justify-content-center'>
        <Pagination size='sm'>
          {shifts.distinctYearsMonths.map((date, index) => {
            const formattedMonth = date.month.toString().padStart(2, '0');
            const formattedDate = `/${date.year}/${formattedMonth}`;

            return (
              <Pagination.Item
                onClick={() => handleCurrentPage(`/${date.year}/${date.month}`)}
                active={formattedDate === currentPage}
                key={index}>
                {`${date.year}/${date.month}`}
              </Pagination.Item>
            );
          })}
        </Pagination>
      </div>
      <Table
        responsive
        bordered
        className='text-center text-capitalize'
        size='sm'>
        <thead>
          <tr>
            <th style={{ width: '15%' }}>Date</th>
            <th style={{ width: '15%' }}>Shift</th>
            <th style={{ width: '15%' }}>Accountant</th>
            <th>Cashiers</th>
            <th style={{ width: '15%' }}>Cash</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody className='table-group-divider'>
          {sortedShifts.map((shift) => (
            <tr key={shift._id}>
              <td>{shift.date}</td>
              <td>{shift.shift}</td>
              <td>{shift.acountant}</td>
              <td className='d-flex flex-row gap-1 justify-content-center'>
                {shift.cashier.map((c, index) => (
                  <span className='d-block' key={index}>
                    {c}{' '}
                  </span>
                ))}
              </td>
              <td>
                K
                {shift.cash
                  .reduce((acc, cashValue) => acc + cashValue, 0)
                  .toLocaleString()}
              </td>
              <td>{shift.status}</td>
              <td className='d-flex flex-row gap-1 justify-content-center'>
                {shift.status === 'previous' && (
                  <Link
                    to={`/lusakashop/${shift._id}`}
                    style={{ textDecoration: 'none' }}
                    target='_blank'>
                    <Button variant='outline-primary me-1' size='sm'>
                      V
                    </Button>
                  </Link>
                )}
                {shift.status === 'current' && (
                  <DeleteShift
                    shiftId={shift._id}
                    fetchData={fetchData}
                    disableDeleteBtn={disableDeleteBtn}
                    setDisableDeleteBtn={setDisableDeleteBtn}
                  />
                )}
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={3}></td>
            <th>Total</th>
            <td>K{Number(totalCash).toLocaleString()}</td>
            <td colSpan={2}></td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
}

export default AllShifts;
