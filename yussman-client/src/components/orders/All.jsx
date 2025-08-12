import { useEffect, useState, useContext } from 'react';
import apiCall from '../../helpers/apiCall';
import { Table } from 'react-bootstrap';

import { AuthContext } from '../../context/AuthContext';

import DeleteOrder from './modals/DeleteOrder';
import { ORDERS_URL } from '../../helpers/variables';
function All() {
  const [allOrders, setAllOrders] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    apiCall.get(`${ORDERS_URL}/all`).then((res) => {
      const sortedOrders = res.data.sort((a, b) => {
        // Current order always on top
        if (a.status === 'current') return -1;
        if (b.status === 'current') return 1;

        // Then sort by date
        return new Date(b.date) - new Date(a.date);
      });

      setAllOrders(sortedOrders);
    });
  }, []);

  return (
    <Table responsive className='text-center text-capitalize' size='sm'>
      <thead>
        <tr>
          <th>Date</th>
          <th>Products</th>
          <th>Status</th>
          {user !== null && user.role === 'admin' && <th>A</th>}
        </tr>
      </thead>
      <tbody className='table-group-divider'>
        {allOrders.map((order) => (
          <tr key={order._id}>
            <td>{order.date}</td>
            <td>{order.products.length}</td>
            <td>{order.status}</td>
            {user !== null && user.role === 'admin' && (
              <td className='d-flex justify-content-center align-items-center'>
                {order.status === 'current' ? (
                  <DeleteOrder id={order._id} />
                ) : (
                  <DeleteOrder id={order._id} disabled={true} />
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default All;
