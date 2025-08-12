import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Table } from 'react-bootstrap';

import { CreditContext } from '../../context/CreditContext';
import { AuthContext } from '../../context/AuthContext';
import AddCreditModal from './modals/AddCreditModal';
import DeleteCredit from './modals/DeleteCredit';

function Unpaid() {
  const [unpaidCredit, setUnpaidCredit] = useState([]);
  const [filteredCredit, setFilteredCredit] = useState([]);

  const { credit } = useContext(CreditContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (credit !== null) {
      setUnpaidCredit(credit.filter((item) => item.paid === false));
    }
  }, [credit]);

  useEffect(() => {
    // Calculate balance for each credit
    const updatedUnpaidCredit = unpaidCredit.map((credit) => {
      const balance = credit.transactions.reduce((acc, transaction) => {
        if (transaction.type === 'add') {
          return acc + transaction.amount;
        } else if (transaction.type === 'pay') {
          return acc - transaction.amount;
        }
        return acc;
      }, credit.amount);

      return { ...credit, balance };
    });

    const sortedUnpaidCredit = updatedUnpaidCredit.sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    setFilteredCredit(sortedUnpaidCredit);
  }, [unpaidCredit]);

  if (credit === null) return;

  return (
    <Container className='mt-3 text-capitalize text-center'>
      <div className='my-2 d-flex justify-content-center'>
        <AddCreditModal />
      </div>
      <Table responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Name</th>
            <th>Amount</th>
            <th>Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className='table-group-divider'>
          {filteredCredit.map((item, index) => (
            <tr key={item._id}>
              <td>{index + 1}</td>
              <td>{item.date}</td>
              <td>{item.name}</td>
              <td>K{item.amount.toLocaleString()}</td>
              <td>K{item.balance.toLocaleString()}</td>
              <td className='d-flex gap-2 justify-content-center'>
                <Link
                  to={`/credit/${item._id}`}
                  style={{ textDecoration: 'none' }}>
                  <Button variant='outline-primary me-1' size='sm'>
                    V
                  </Button>
                </Link>
                {user.role === 'admin' && <DeleteCredit id={item._id} />}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default Unpaid;
