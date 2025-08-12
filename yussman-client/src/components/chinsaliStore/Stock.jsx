import { useContext, useEffect, useState } from 'react';

import Table from 'react-bootstrap/Table';
import { Pagination } from 'react-bootstrap';

import { ChinsaliStoreContext } from '../../context/ChinsaliStoreContext';
import { AuthContext } from '../../context/AuthContext';

import NewProductModal from './modals/NewProductModal';
import DeleteModal from './modals/DeleteModal';
import EditNameModal from './modals/EditNameModal';
import EditDamageModal from './modals/EditDamageModal';

function Stock() {
  const [shiftData, setShiftData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 70;

  const { storeShift } = useContext(ChinsaliStoreContext);
  const { user } = useContext(AuthContext);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  let currentItems;
  if (Object.keys(shiftData).length !== 0) {
    currentItems = shiftData.slice(indexOfFirstItem, indexOfLastItem);
  }

  useEffect(() => {
    if (Object.keys(storeShift).length !== 0) {
      const drinks = storeShift.stock.filter(
        (item) => item.section === 'drinks',
      );
      const food = storeShift.stock.filter((item) => item.section === 'food');
      const other = storeShift.stock.filter((item) => item.section === 'other');
      const shopA1 = storeShift.stock.filter(
        (item) => item.section === 'shopa1',
      );
      const shopA2 = storeShift.stock.filter(
        (item) => item.section === 'shopa2',
      );

      setShiftData([...drinks, ...food, ...other, ...shopA1, ...shopA2]);
    }
  }, [storeShift]);

  return (
    <>
      {user !== null && user.role === 'admin' && (
        <div className='d-flex justify-content-center mt-3 '>
          <NewProductModal id={storeShift._id} />
        </div>
      )}
      <Table
        responsive
        bordered
        size='sm'
        className='text-center my-3 text-capitalize'>
        <thead>
          <tr>
            <th>Code</th>
            {user !== null && user.role === 'admin' && <th>Price</th>}
            <th>Name</th>
            <th>OStock</th>
            <th>Damage</th>
            <th>Received</th>
            <th>Issued</th>
            <th>CStock</th>
            <th>Action</th>
            {user !== null && user.role === 'admin' && <th>Total</th>}
          </tr>
        </thead>
        <tbody className='table-group-divider'>
          {currentItems !== undefined &&
            currentItems.map((item) => (
              <tr key={item._id}>
                <td>{item.code}</td>
                {user !== null && user.role === 'admin' && (
                  <td>K{item.price}</td>
                )}
                <td>{item.name}</td>
                <td className={item.ostock === 0 ? 'text-muted' : ''}>
                  {item.ostock.toFixed(2)}
                </td>
                <td
                  className={
                    item.damage === 0
                      ? 'text-muted'
                      : item.damage < 0
                      ? 'text-danger'
                      : item.damage > 0
                      ? 'text-primary'
                      : ''
                  }>
                  {item.damage}
                </td>
                <td
                  className={
                    item.received > 0
                      ? 'text-info'
                      : item.received === 0
                      ? 'text-muted'
                      : ''
                  }>
                  {item.received}
                </td>
                <td
                  className={
                    item.issued > 0
                      ? 'text-info'
                      : item.issued === 0
                      ? 'text-muted'
                      : ''
                  }>
                  {item.issued}
                </td>
                <td
                  className={
                    item.cstock < 0
                      ? 'text-danger'
                      : item.cstock === 0
                      ? 'text-muted'
                      : ''
                  }>
                  {item.cstock.toFixed(2)}
                </td>
                <td className='d-flex justify-content-center gap-2'>
                  <EditDamageModal id={storeShift._id} stock={item} />
                  {user !== null && user.role === 'admin' && (
                    <>
                      <DeleteModal
                        endpoint={'deleteStock'}
                        id={item._id}
                        shiftId={storeShift._id}
                      />
                      <EditNameModal id={storeShift._id} stock={item} />
                    </>
                  )}
                </td>
                {user !== null && user.role === 'admin' && (
                  <td
                    className={
                      item.cstock < 0
                        ? 'text-danger'
                        : item.cstock === 0
                        ? 'text-muted'
                        : ''
                    }>
                    K{(item.cstock * item.price).toLocaleString()}
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </Table>
      {Object.keys(storeShift).length !== 0 && (
        <Pagination className='justify-content-center'>
          {Array.from(
            { length: Math.ceil(storeShift.stock.length / itemsPerPage) },
            (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === currentPage}
                onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </Pagination.Item>
            ),
          )}
        </Pagination>
      )}
    </>
  );
}

export default Stock;
