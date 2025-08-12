import { useContext, useEffect, useRef, useState } from 'react';
import apiCall from '../../helpers/apiCall';

import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { BiEdit } from 'react-icons/bi';

import NewProductModal from './modals/NewProductModal';
import DeleteProduct from './modals/DeleteProduct';
import ChangeNameOrPrice from './modals/ChangeNameOrprice';

import { ShopCContext } from '../../context/ShopCContext';
import { AuthContext } from '../../context/AuthContext';

const endpoint = 'deletestock';

import { SHOPC_URL } from '../../helpers/variables';
import { Pagination } from 'react-bootstrap';

function Stock() {
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedOStock, setEditedOStock] = useState('');
  const [editedDamage, setEditedDamage] = useState('');
  const [editedCStock, setEditedCStock] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 80;

  const editedCStockRef = useRef(null);

  const { shopCShift } = useContext(ShopCContext);
  const { user } = useContext(AuthContext);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  let currentItems;
  if (Object.keys(shopCShift).length !== 0) {
    currentItems = shopCShift.stock.slice(indexOfFirstItem, indexOfLastItem);
  }

  useEffect(() => {
    if (editedCStockRef.current) {
      editedCStockRef.current.focus();
      editedCStockRef.current.select();
    }
  }, [editingItemId]);

  const handleEdit = (itemId) => {
    setEditingItemId(itemId);
    let itemToEdit = shopCShift.stock.find((stock) => stock._id === itemId);

    setEditedOStock(itemToEdit.ostock.toString());
    setEditedDamage(itemToEdit.damage.toString());
    setEditedCStock(itemToEdit.cstock.toString());
  };

  const handleSaveEdit = (e, itemId) => {
    e.preventDefault();

    if (!itemId) {
      return;
    }

    setIsLoading(true);
    const modalData = {
      ostock: Number(editedOStock),
      damage: Number(editedDamage),
      cstock: Number(editedCStock),
    };

    apiCall
      .post(`${SHOPC_URL}/${shopCShift._id}/editstock/${itemId}`, modalData)
      .then(() => {
        setEditingItemId(null);
        setEditedOStock('');
        setEditedDamage('');
        setEditedCStock('');
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditedOStock('');
    setEditedDamage('');
    setEditedCStock('');
    setIsLoading(false);
  };

  if (shopCShift === null) {
    return null;
  }

  return (
    <>
      {user !== null && user.role === 'admin' && (
        <div className='d-flex justify-content-center py-2'>
          <NewProductModal id={shopCShift._id} />
        </div>
      )}
      <Form onSubmit={(e) => handleSaveEdit(e, editingItemId)}>
        <Table responsive className='text-center' bordered size='sm'>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Price</th>
              <th>O.Stock</th>
              <th>Received</th>
              <th>Damage</th>
              <th>C.Stock</th>
              <th>Total</th>
              <th style={{ width: '8rem' }}>Actions</th>
            </tr>
          </thead>

          <tbody className='table-group-divider'>
            {Object.keys(shopCShift).length !== 0 &&
              currentItems.map((stock) => (
                <tr key={stock.code} id={stock.code}>
                  <td>{stock.code}</td>
                  <td className='text-capitalize'>{stock.name}</td>
                  <td>K{stock.price > 0 && stock.price.toLocaleString()}</td>
                  <td style={{ width: '8rem' }}>
                    {editingItemId === stock._id ? (
                      <Form.Control
                        type='number'
                        size='sm'
                        readOnly={user.role === 'admin' ? false : true}
                        value={editedOStock}
                        className='text-center'
                        onChange={(e) => setEditedOStock(e.target.value)}
                      />
                    ) : (
                      stock.ostock
                    )}
                  </td>
                  <td className={stock.received > 0 ? 'text-info' : ''}>
                    {stock.received}
                  </td>
                  <td
                    style={{ width: '8rem' }}
                    className={stock.damage > 0 ? 'text-primary' : ''}>
                    {editingItemId === stock._id ? (
                      <Form.Control
                        type='number'
                        size='sm'
                        value={editedDamage}
                        className='text-center'
                        onChange={(e) => setEditedDamage(e.target.value)}
                      />
                    ) : (
                      stock.damage
                    )}
                  </td>
                  <td
                    style={{ width: '8rem' }}
                    className={stock.cstock < 0 ? 'text-danger' : ''}>
                    {editingItemId === stock._id ? (
                      <Form.Control
                        ref={editedCStockRef}
                        type='number'
                        size='sm'
                        autoFocus
                        value={editedCStock}
                        className='text-center'
                        onChange={(e) => setEditedCStock(e.target.value)}
                      />
                    ) : (
                      stock.cstock
                    )}
                  </td>
                  <td
                    className={
                      stock.ostock +
                        stock.received -
                        stock.damage -
                        stock.cstock <
                      0
                        ? 'text-danger'
                        : stock.ostock +
                            stock.received -
                            stock.damage -
                            stock.cstock ===
                          0
                        ? 'text-muted'
                        : ''
                    }>
                    K
                    {stock.code > 0 &&
                      (
                        (stock.ostock +
                          stock.received -
                          stock.damage -
                          stock.cstock) *
                        stock.price
                      ).toLocaleString()}
                  </td>
                  <td
                    className='d-flex justify-content-center align-items-center'
                    style={{ width: '10rem' }}>
                    {editingItemId === stock._id ? (
                      <div className='d-flex gap-2'>
                        <Button
                          size='sm'
                          disabled={isLoading}
                          variant='outline-success'
                          type='submit'>
                          <span>&#10003;</span>
                        </Button>
                        <Button
                          size='sm'
                          variant='outline-danger'
                          onClick={() => handleCancelEdit()}>
                          <span>&#10005;</span>
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          size='sm'
                          variant='outline-secondary'
                          onClick={() => handleEdit(stock._id)}
                          className='d-flex justify-content-center align-items-center'>
                          <BiEdit />
                        </Button>
                        {user !== null && user.role === 'admin' && (
                          <>
                            <DeleteProduct
                              endpoint={endpoint}
                              id={stock._id}
                              shiftId={shopCShift._id}
                            />
                            <ChangeNameOrPrice
                              stock={stock}
                              id={shopCShift._id}
                            />
                          </>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </Form>
      {Object.keys(shopCShift).length !== 0 && (
        <Pagination className='justify-content-center'>
          {Array.from(
            { length: Math.ceil(shopCShift.stock.length / itemsPerPage) },
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
