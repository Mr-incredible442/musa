import { useContext, useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';

import ExpenceModal from './modals/ExpenceModal';
import DeleteExpense from './modals/DeleteExpense';

import { RegisterContext } from '../../context/RegisterContext';
import { AuthContext } from '../../context/AuthContext';

function Expence() {
  const [expense, setExpense] = useState([]);

  const { RegisterShift } = useContext(RegisterContext);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    setExpense(RegisterShift.expense);
  }, [RegisterShift]);

  return (
    <>
      <div className='d-flex justify-content-center py-2'>
        <ExpenceModal id={RegisterShift._id} />
      </div>
      <Table
        responsive
        size='sm'
        bordered
        className='text-capitalize text-center'>
        <thead>
          <tr>
            <th>#</th>
            <th>Decription</th>
            <th>Amount</th>
            {user && user.role === 'admin' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody className='table-group-divider'>
          {expense?.map((item, index) => (
            <tr key={item._id}>
              <td>{index + 1}</td>
              <td>{item.description}</td>
              <td>K{item.amount}</td>
              {user && user.role === 'admin' && (
                <td className='d-flex justify-content-center '>
                  <DeleteExpense id={item._id} shiftId={RegisterShift._id} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

export default Expence;
