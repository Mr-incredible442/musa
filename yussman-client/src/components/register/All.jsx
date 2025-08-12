import { useEffect, useState, useContext } from 'react';
import apiCall from '../../helpers/apiCall';
import { Button, Container, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import DeleteShift from './modals/DeleteShift';

import { AuthContext } from '../../context/AuthContext';

import { REGISTER_URL } from '../../helpers/variables';

function All() {
  const [allShifts, setAllShifts] = useState([]);

  const { user } = useContext(AuthContext);

  const getShifts = () => {
    apiCall
      .get(`${REGISTER_URL}/all`)
      .then((res) => {
        const sortedShifts = res.data.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : null;
          const dateB = b.date ? new Date(b.date).getTime() : null;

          if (!dateA && !dateB) return 0;
          if (!dateA) return -1;
          if (!dateB) return 1;

          return dateB - dateA;
        });

        setAllShifts(sortedShifts);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getShifts();
  }, []);

  return (
    <Container fluid='xxl'>
      <div className='d-flex justify-content-end mt-2'>
        <Button variant='outline-primary' onClick={getShifts}>
          Refresh
        </Button>
      </div>
      <Table
        responsive
        size='sm'
        bordered
        className='text-capitalize text-center my-3'>
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Accountant</th>
            <th>Status</th>
            {user && user.role === 'admin' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody className='table-group-divider'>
          {allShifts.map((shift) => (
            <tr key={shift._id}>
              <td>{shift.date}</td>
              <td>{shift.name}</td>
              <td>{shift.accountant}</td>
              <td>{shift.status}</td>
              <td className='d-flex flex-row gap-1 justify-content-center'>
                <Link
                  to={`/register/${shift._id}`}
                  style={{ textDecoration: 'none' }}>
                  <Button variant='outline-primary' size='sm'>
                    V
                  </Button>
                </Link>
                {allShifts.length > 1 &&
                  shift.status === 'current' &&
                  user &&
                  user.role === 'admin' && (
                    <DeleteShift shiftId={shift._id} getShifts={getShifts} />
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default All;
