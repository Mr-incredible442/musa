import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Table } from 'react-bootstrap';

import { CreditContext } from '../../context/CreditContext';
import { AuthContext } from '../../context/AuthContext';
import DeleteCredit from './modals/DeleteCredit';

function Paid() {
  const [paidCredit, setPaidCredit] = useState([]);

  const { credit } = useContext(CreditContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (credit !== null) {
      setPaidCredit(
        credit
          .filter((item) => item.paid === true)
          .sort((a, b) => new Date(b.date) - new Date(a.date)),
      );
    }
  }, [credit]);

  if (credit === null) return;
  return (
    <Container className='mt-3 text-capitalize text-center'>
      <Table responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Name</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className='table-group-divider'>
          {paidCredit.map((item, index) => (
            <tr key={item._id}>
              <td>{index + 1}</td>
              <td>{item.date}</td>
              <td>{item.name}</td>
              <td>K{item.amount.toLocaleString()}</td>
              <td className='d-flex justify-content-center gap-3'>
                <Link
                  to={`/credit/${item._id}`}
                  className='btn btn-outline-primary btn-sm'>
                  V
                </Link>
                {user && user.role === 'admin' && (
                  <DeleteCredit id={item._id} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default Paid;
