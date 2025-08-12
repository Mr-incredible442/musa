import { useContext, useEffect, useRef, useState } from 'react';
import apiCall from '../../helpers/apiCall';

import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { BiEdit } from 'react-icons/bi';

import NewProductModal from '../lusakaShop/modals/NewProductModal';
import DeleteProduct from './modals/DeleteProduct';
import ChangeNameOrPrice from './modals/ChangeNameOrprice';

import { LusakaShopContext } from '../../context/LusakaShopContext';
import { AuthContext } from '../../context/AuthContext';

const endpoint = 'deletestock';

import { LUSAKA_SHOP_URL } from '../../helpers/variables';

function Stock() {
  const [drinks, setDrinks] = useState([]);
  const [food, setFood] = useState([]);
  const [bakery, setBakery] = useState([]);

  const [drinksTotal, setDrinksTotal] = useState(0);
  // const [foodTotal, setFoodTotal] = useState(0);
  // const [bakeryTotal, setBakeryTotal] = useState(0);

  const [editingItemId, setEditingItemId] = useState(null);
  const [editedOStock, setEditedOStock] = useState('');
  const [editedDamage, setEditedDamage] = useState('');
  const [editedCStock, setEditedCStock] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const editedCStockRef = useRef(null);

  const { shift } = useContext(LusakaShopContext);
  const { user } = useContext(AuthContext);

  const calculateTotal = (items) => {
    return items.reduce(
      (total, stock) =>
        total +
        (stock.ostock + stock.received - stock.damage - stock.cstock) *
          stock.price,
      0,
    );
  };

  useEffect(() => {
    if (Object.keys(shift).length !== 0) {
      const drinks = shift.stock.filter((item) => item.section === 'drinks');
      const food = shift.stock.filter((item) => item.section === 'food');
      const bakery = shift.stock.filter((item) => item.section === 'bakery');

      setDrinks(drinks);
      setFood(food);
      setBakery(bakery);

      setDrinksTotal(calculateTotal(drinks));
      // setFoodTotal(calculateTotal(food));
      // setBakeryTotal(calculateTotal(bakery));
    }
  }, [shift]);

  useEffect(() => {
    if (editedCStockRef.current) {
      editedCStockRef.current.focus();
      editedCStockRef.current.select();
    }
  }, [editingItemId]);

  const handleEdit = (itemId) => {
    setEditingItemId(itemId);
    let itemToEdit = drinks.find((stock) => stock._id === itemId);

    if (!itemToEdit) {
      itemToEdit = food.find((stock) => stock._id === itemId);
    }

    if (!itemToEdit) {
      itemToEdit = bakery.find((stock) => stock._id === itemId);
    }

    setEditedOStock(itemToEdit.ostock.toString());
    setEditedDamage(itemToEdit.damage.toString());
    setEditedCStock(itemToEdit.cstock.toString());
  };

  const handleSaveEdit = (e, itemId) => {
    e.preventDefault();

    if (!itemId) {
      return;
    }

    if (!itemId || editedOStock < 0 || editedDamage < 0 || editedCStock < 0) {
      alert('Please ensure all values are non-negative.');
      return;
    }

    setIsLoading(true);
    const modalData = {
      ostock: Number(editedOStock),
      damage: Number(editedDamage),
      cstock: Number(editedCStock),
    };

    apiCall
      .post(`${LUSAKA_SHOP_URL}/${shift._id}/editstock/${itemId}`, modalData)
      .then(() => {
        setIsLoading(false);

        // Reset the current item state
        setEditedOStock('');
        setEditedDamage('');
        setEditedCStock('');

        // Find the current item in the list and its index
        const allItems = [...drinks, ...food, ...bakery];
        const currentItemIndex = allItems.findIndex(
          (item) => item._id === itemId,
        );

        // Determine the next item to edit
        if (currentItemIndex !== -1 && currentItemIndex < allItems.length - 1) {
          const nextItem = allItems[currentItemIndex + 1];
          setEditingItemId(nextItem._id);
          setEditedOStock(nextItem.ostock.toString());
          setEditedDamage(nextItem.damage.toString());
          setEditedCStock(nextItem.cstock.toString());
        } else {
          // If there's no next item, exit edit mode
          setEditingItemId(null);
        }
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

  if (shift === null) {
    return null;
  }

  return (
    <Form onSubmit={(e) => handleSaveEdit(e, editingItemId)}>
      {user !== null && user.role === 'admin' && (
        <div className='d-flex justify-content-center py-2'>
          <NewProductModal id={shift._id} />
        </div>
      )}
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
        <tbody>
          {drinks.map((stock) => (
            <tr key={stock.code} id={stock.code}>
              <td>{stock.code}</td>
              <td className='text-capitalize'>{stock.name}</td>
              <td>K{stock.price.toLocaleString()}</td>
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
              <td style={{ width: '8rem' }}>
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
                  stock.ostock + stock.received - stock.damage - stock.cstock <
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
                {(
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
                          shiftId={shift._id}
                        />
                        <ChangeNameOrPrice stock={stock} id={shift._id} />
                      </>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={7}>Total</td>
            <td>K{drinksTotal.toLocaleString()}</td>
            <td></td>
          </tr>
        </tbody>
        {/* <tbody className='table-group-divider'>
          {food.map((stock) => (
            <tr key={stock.code} id={stock.code}>
              <td>{stock.code}</td>
              <td className='text-capitalize'>{stock.name}</td>
              <td>K{stock.price.toLocaleString()}</td>
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
              <td style={{ width: '8rem' }}>
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
                  stock.ostock + stock.received - stock.damage - stock.cstock <
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
                {(
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
                          shiftId={shift._id}
                        />
                        <ChangeNameOrPrice stock={stock} id={shift._id} />
                      </>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={7}>Food Total</td>
            <td>K{foodTotal.toLocaleString()}</td>
            <td></td>
          </tr>
        </tbody>
        <tbody className='table-group-divider'>
          {bakery.map((stock) => (
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
              <td style={{ width: '8rem' }}>
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
                  stock.ostock + stock.received - stock.damage - stock.cstock <
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
                          shiftId={shift._id}
                        />
                        <ChangeNameOrPrice stock={stock} id={shift._id} />
                      </>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={7}>Bakery Total</td>
            <td>K{bakeryTotal.toLocaleString()}</td>
            <td></td>
          </tr>
        </tbody> */}
      </Table>
    </Form>
  );
}

export default Stock;
