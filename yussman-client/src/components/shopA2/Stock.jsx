import { useContext, useEffect, useRef, useState } from 'react';
import apiCall from '../../helpers/apiCall';

import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Pagination } from 'react-bootstrap';
import { BiEdit } from 'react-icons/bi';

import NewProductModal from './modals/NewProductModal';
import DeleteProduct from './modals/DeleteProduct';
import ChangeNameOrPrice from './modals/ChangeNameOrprice';

import { ShopA2Context } from '../../context/ShopA2Context';
import { AuthContext } from '../../context/AuthContext';

const endpoint = 'deletestock';

import { SHOPA2_URL } from '../../helpers/variables';

function Stock() {
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedOStock, setEditedOStock] = useState('');
  const [editedDamage, setEditedDamage] = useState('');
  const [editedCStock, setEditedCStock] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 70;

  const editedCStockRef = useRef(null);

  const { shopA2Shift } = useContext(ShopA2Context);
  const { user } = useContext(AuthContext);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  let currentItems;
  if (Object.keys(shopA2Shift).length !== 0) {
    currentItems = shopA2Shift.stock.slice(indexOfFirstItem, indexOfLastItem);
  }

  useEffect(() => {
    if (editedCStockRef.current) {
      editedCStockRef.current.focus();
      editedCStockRef.current.select();
    }
  }, [editingItemId]);

  const handleEdit = (itemId) => {
    setEditingItemId(itemId);
    let itemToEdit = shopA2Shift.stock.find((stock) => stock._id === itemId);

    setEditedOStock(itemToEdit.ostock.toString());
    setEditedDamage(itemToEdit.damage.toString());
    setEditedCStock(itemToEdit.cstock.toString());
  };

  const initialLoad = useRef(true);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }

    if (editingItemId !== null && editedCStockRef.current) {
      editedCStockRef.current.focus();
      editedCStockRef.current.select();
    }
  }, [editingItemId]);

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
      .post(`${SHOPA2_URL}/${shopA2Shift._id}/editstock/${itemId}`, modalData)
      .then(() => {
        // Clear the editing state for the current item
        setEditingItemId(null);
        setEditedOStock('');
        setEditedDamage('');
        setEditedCStock('');

        // Determine the next item index
        const currentItemIndex = shopA2Shift.stock.findIndex(
          (stock) => stock._id === itemId,
        );
        const nextItemIndex = currentItemIndex + 1;

        // Check if the next item is within the current page
        if (nextItemIndex < indexOfLastItem) {
          const nextItem = shopA2Shift.stock[nextItemIndex];
          setEditingItemId(nextItem._id);
          setEditedOStock(nextItem.ostock.toString());
          setEditedDamage(nextItem.damage.toString());
          setEditedCStock(nextItem.cstock.toString());
        } else if (nextItemIndex < shopA2Shift.stock.length) {
          // If the next item is on the next page, move to the next page
          setCurrentPage((prevPage) => prevPage + 1);

          // Use setTimeout to wait for the page to render before editing
          setTimeout(() => {
            const nextPageFirstItemIndex = indexOfLastItem;
            const nextPageFirstItem = shopA2Shift.stock[nextPageFirstItemIndex];
            setEditingItemId(nextPageFirstItem._id);
            setEditedOStock(nextPageFirstItem.ostock.toString());
            setEditedDamage(nextPageFirstItem.damage.toString());
            setEditedCStock(nextPageFirstItem.cstock.toString());
          }, 0);
        }

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

  if (shopA2Shift === null) {
    return null;
  }

  return (
    <>
      {user !== null && user.role === 'admin' && (
        <div className='d-flex justify-content-center py-2'>
          <NewProductModal id={shopA2Shift._id} />
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
            {Object.keys(shopA2Shift).length !== 0 &&
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
                              shiftId={shopA2Shift._id}
                            />
                            <ChangeNameOrPrice
                              stock={stock}
                              id={shopA2Shift._id}
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
      {Object.keys(shopA2Shift).length !== 0 && (
        <Pagination className='justify-content-center'>
          {Array.from(
            { length: Math.ceil(shopA2Shift.stock.length / itemsPerPage) },
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
