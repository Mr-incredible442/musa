import { useEffect, useState } from 'react';
import apiCall from '../../helpers/apiCall';

import { Container, Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';

import { SHOPA2_URL } from '../../helpers/variables';
import { Link } from 'react-router-dom';
import DeleteShift from './modals/DeleteShift';

function AllShifts() {
  const [shifts, setShifts] = useState([]);
  const [disableDeleteBtn, setDisableDeleteBtn] = useState(false);

  const fetchData = () => {
    apiCall
      .get(`${SHOPA2_URL}/shifts`)
      .then((res) => {
        setShifts(res.data);
        setDisableDeleteBtn(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupShiftsByMonth = () => {
    const groupedShifts = {};

    shifts.forEach((shift) => {
      const month = shift.date ? shift.date.split('-')[1] : 'undefined';

      if (!groupedShifts[month]) {
        groupedShifts[month] = [];
      }

      groupedShifts[month].push(shift);
    });

    const sortedMonths = Object.keys(groupedShifts).sort((a, b) => {
      if (a === 'undefined') return -1;
      if (b === 'undefined') return 1;

      const firstDateA = groupedShifts[a][0]?.date;
      const firstDateB = groupedShifts[b][0]?.date;

      if (!firstDateA || !firstDateB) return 0;

      const dateA = new Date(firstDateA);
      const dateB = new Date(firstDateB);

      return dateB - dateA;
    });

    sortedMonths.forEach((month) => {
      groupedShifts[month].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : null;
        const dateB = b.date ? new Date(b.date).getTime() : null;

        if (!dateA && !dateB) return 0;
        if (!dateA) return -1;
        if (!dateB) return 1;

        return dateB - dateA;
      });
    });

    return { sortedMonths, groupedShifts };
  };

  const { sortedMonths, groupedShifts } = groupShiftsByMonth();

  const calculateMonthlyCashSum = (month) => {
    let cashSum = 0;
    if (Object.keys(groupedShifts).length > 0) {
      cashSum = groupedShifts[month].map((s) =>
        s.cash.reduce((acc, cashValue) => acc + cashValue, 0),
      );
      cashSum = cashSum.reduce((acc, cashValue) => acc + cashValue, 0);
    }
    return cashSum.toLocaleString();
  };

  return (
    <Container>
      <div className='d-flex justify-content-end'>
        <Button variant='outline-primary' onClick={fetchData} className='mb-3'>
          Refetch
        </Button>
      </div>
      <Table
        responsive
        bordered
        className='text-center text-capitalize'
        size='sm'>
        <thead>
          <tr>
            <th style={{ width: '15%' }}>Date In</th>
            <th style={{ width: '15%' }}>Date Out</th>
            <th style={{ width: '15%' }}>Checked By</th>
            <th style={{ width: '15%' }}>Acountant</th>
            <th>Cashier</th>
            <th style={{ width: '15%' }}>Cash</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        {sortedMonths.map((month) => (
          <tbody className='table-group-divider' key={month}>
            {groupedShifts[month].map((shift) => (
              <tr key={shift._id}>
                <td>{shift.dateIn}</td>
                <td>{shift.dateOut}</td>
                <td>{shift.checkedBy}</td>
                <td>{shift.acountant}</td>
                <td className='d-flex flex-row gap-1 justify-content-center'>
                  {shift.cashier.map((c) => (
                    <span className='d-block ' key={c}>
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
                  <Link
                    to={`/shopa2/${shift._id}`}
                    style={{ textDecoration: 'none' }}>
                    <Button variant='outline-primary me-1' size='sm'>
                      V
                    </Button>
                  </Link>
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
              <td colSpan={4}></td>
              <th>Total</th>
              <th colSpan={1}>K{calculateMonthlyCashSum(month)}</th>
              <td colSpan={2}></td>
            </tr>
          </tbody>
        ))}
      </Table>
    </Container>
  );
}

export default AllShifts;
