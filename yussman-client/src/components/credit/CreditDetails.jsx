import { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Container, Table } from 'react-bootstrap';
import { IoIosArrowBack } from 'react-icons/io';

import { AuthContext } from '../../context/AuthContext';
import DeleteTransaction from './modals/DeleteTransaction';
import PayModal from './modals/PayModal';
import AddModal from './modals/AddModal';

import { CREDIT_URL } from '../../helpers/variables';
import apiCall from '../../helpers/apiCall';

function CreditDetails() {
  const { id } = useParams();

  const { user } = useContext(AuthContext);

  useEffect(() => {
    document.title = 'Yussman - Credit Details';

    // Fetch credit data
    const getCredit = async () => {
      try {
        const response = await apiCall.get(`${CREDIT_URL}/${id}`);
        setCredit(response.data);
      } catch (error) {
        console.error('Error fetching credit:', error);
      }
    };
    getCredit();
  }, [id]);

  const [creditLocal, setCredit] = useState(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (creditLocal !== null) {
      const newBalance = creditLocal.transactions.reduce((acc, transaction) => {
        if (transaction.type === 'add') {
          return acc + transaction.amount;
        } else if (transaction.type === 'pay') {
          return acc - transaction.amount;
        }
        return acc;
      }, creditLocal.amount);

      setBalance(newBalance);
    }
  }, [creditLocal]);

  if (creditLocal === null) return;

  return (
    <Container className='mt-3 text-capitalize text-center'>
      <div className='d-flex justify-content-start'>
        <Link
          to='/credit'
          className='btn btn-outline-secondary btn-sm d-flex align-items-center'>
          <IoIosArrowBack />
          Back
        </Link>
      </div>
      <div className='d-flex justify-content-around  align-items-center'>
        {creditLocal !== null && creditLocal.paid === false && (
          <AddModal id={creditLocal?._id} />
        )}

        <h2>{creditLocal.name}</h2>
        {creditLocal !== null && creditLocal.paid === false && (
          <PayModal
            disabled={balance <= 0}
            id={creditLocal?._id}
            balance={balance}
          />
        )}
      </div>
      <hr />
      <Table responsive>
        <thead>
          <tr>
            <th>Date</th>
            <th>Paid</th>
            <th>Added</th>
            {user &&
              user.role === 'admin' &&
              creditLocal !== null &&
              creditLocal.paid === false && <th>Actions</th>}
          </tr>
        </thead>
        <tbody className='table-group-divider'>
          {creditLocal !== null && (
            <tr key={creditLocal._id}>
              <td>{creditLocal.date}</td>
              <td>K0</td>
              <td>K{creditLocal.amount.toLocaleString()}</td>
              {user &&
                user.role === 'admin' &&
                creditLocal !== null &&
                creditLocal.paid === false && (
                  <td className='d-flex justify-content-center'>
                    <DeleteTransaction disabled={false} />
                  </td>
                )}
            </tr>
          )}
          {creditLocal !== null &&
            creditLocal.transactions.map((item, index) => (
              <tr key={item._id}>
                <td>{item.date}</td>
                {item.type === 'pay' ? (
                  <td>K{item.amount.toLocaleString()}</td>
                ) : (
                  <td>K0</td>
                )}
                {item.type === 'add' ? (
                  <td>K{item.amount.toLocaleString()}</td>
                ) : (
                  <td>K0</td>
                )}
                {user &&
                  user.role === 'admin' &&
                  creditLocal !== null &&
                  creditLocal.paid === false && (
                    <td className='d-flex justify-content-center'>
                      <DeleteTransaction
                        creditId={creditLocal._id}
                        id={item._id}
                        disabled={
                          user.role === 'admin' &&
                          index === creditLocal.transactions.length - 1
                        }
                      />
                    </td>
                  )}
              </tr>
            ))}
          <tr>
            <td
              className='border'
              colSpan={
                user &&
                user.role === 'admin' &&
                creditLocal !== null &&
                creditLocal.paid === false
                  ? 2
                  : 1
              }>
              Balance
            </td>
            <td className='border' colSpan={2}>
              K{balance.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
}

export default CreditDetails;
