import { useEffect, useState } from 'react';
import apiCall from '../../helpers/apiCall';

import { Link } from 'react-router-dom';

import { Container, Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';

import DeleteShiftModal from './modals/DeleteShiftModal';

import { STORE_LOCAL_URL } from '../../helpers/variables';

function AllShifts() {
  const [shifts, setShifts] = useState([]);

  const fetchData = () => {
    apiCall
      .get(`${STORE_LOCAL_URL}/shifts`)
      .then((res) => {
        setShifts(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupShiftsByMonth = () => {
    const groupedShifts = { undefined: [] };

    shifts.forEach((shift) => {
      if (shift.date) {
        const [year, month] = shift.date.split('-');
        const key = `${year}-${month}`; // Group by year-month

        if (!groupedShifts[key]) {
          groupedShifts[key] = [];
        }
        groupedShifts[key].push(shift);
      } else {
        groupedShifts['undefined'].push(shift); // Group shifts without date
      }
    });

    const sortedKeys = Object.keys(groupedShifts).sort((a, b) => {
      if (a === 'undefined') return -1; // Always place 'undefined' first
      if (b === 'undefined') return 1;

      return new Date(b) - new Date(a); // Sort by date descending
    });

    // Sort shifts within each group (newest first)
    sortedKeys.forEach((key) => {
      groupedShifts[key].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;

        return dateB - dateA; // Latest first
      });
    });

    return { sortedMonths: sortedKeys, groupedShifts };
  };

  const { sortedMonths, groupedShifts } = groupShiftsByMonth();

  return (
    <Container className='my-3'>
      <div className='d-flex justify-content-end'>
        <Button variant='outline-primary' onClick={fetchData} className='mb-3'>
          Refetch
        </Button>
      </div>

      <Table responsive bordered className='text-center' size='sm'>
        <thead>
          <tr>
            <th style={{ width: '15%' }}>Date</th>
            <th style={{ width: '15%' }}>Acountant</th>
            <th>Checked By</th>
            <th style={{ width: '15%' }}>Keeper</th>
            <th>Actions</th>
          </tr>
        </thead>
        {sortedMonths.map((month, indexdM) => (
          <tbody className='table-group-divider' key={month}>
            {groupedShifts[month].map((shift, index) => (
              <tr key={shift._id}>
                <td>{shift.date}</td>
                <td className='text-capitalize'>{shift.accountant}</td>
                <td className='text-capitalize'>{shift.checkedBy}</td>
                <td className='text-capitalize'>{shift.keeper}</td>
                <td className='d-flex flex-row gap-1 justify-content-center'>
                  <Link
                    to={`/store/${shift._id}`}
                    style={{ textDecoration: 'none' }}>
                    <Button variant='outline-primary me-1' size='sm'>
                      V
                    </Button>
                  </Link>
                  {indexdM === 0 && index === 0 && (
                    <DeleteShiftModal shiftId={shift._id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </Table>
    </Container>
  );
}

export default AllShifts;
