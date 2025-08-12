import { useEffect, useState } from 'react';
import apiCall from '../../helpers/apiCall';

import { Link } from 'react-router-dom';

import { Container, Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';

import DeleteShiftModal from './modals/DeleteShiftModal';

import { BOMA_STORE_URL } from '../../helpers/variables';

function AllShifts() {
  const [shifts, setShifts] = useState([]);

  const fetchData = () => {
    apiCall
      .get(`${BOMA_STORE_URL}/shifts`)
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
                    to={`/bomastore/${shift._id}`}
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
