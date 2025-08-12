/* eslint-disable react/prop-types */
import { useState, useContext, useEffect } from 'react';
import apiCall from '../../../helpers/apiCall';

import { Form, Col, Row, ListGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { ShopA1Context } from '../../../context/ShopA1Context';
import { ShopA2Context } from '../../../context/ShopA2Context';
import { ShopBContext } from '../../../context/ShopBContext';
import { ShopWContext } from '../../../context/ShopWContext';
import { StoreContext } from '../../../context/StoreContext';

import { ORDERS_URL } from '../../../helpers/variables';

function NewProductModal({ id }) {
  const { shopA1Shift } = useContext(ShopA1Context);
  const { shopA2Shift } = useContext(ShopA2Context);
  const { shopBShift } = useContext(ShopBContext);
  const { shopWShift } = useContext(ShopWContext);
  const { storeShift } = useContext(StoreContext);

  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const shopA1Stock = Array.isArray(shopA1Shift.stock)
      ? shopA1Shift.stock
      : [];
    const shopA2Stock = Array.isArray(shopA2Shift.stock)
      ? shopA2Shift.stock
      : [];
    const shopBStock = Array.isArray(shopBShift.stock) ? shopBShift.stock : [];
    const shopWStock = Array.isArray(shopWShift.stock) ? shopWShift.stock : [];
    const storeStock = Array.isArray(storeShift.stock) ? storeShift.stock : [];

    setProducts([
      ...shopA1Stock,
      ...shopA2Stock,
      ...shopBStock,
      ...shopWStock,
      ...storeStock,
    ]);
  }, [shopA1Shift, shopA2Shift, shopBShift, shopWShift, storeShift]);

  const [show, setShow] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);

  const [search, setSearch] = useState('');
  const [searchedproducts, setSearchedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [available, setAvailable] = useState('');
  const [comment, setComment] = useState('');

  const handleClose = () => {
    setShow(false);
    handleClear();
  };
  const handleShow = () => setShow(true);

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);

    const filteredResults = products.filter((item) => {
      const isCodeMatch = item.code.toString().includes(searchTerm);
      const isNameMatch = item.name.toLowerCase().includes(searchTerm);

      return isCodeMatch || isNameMatch;
    });

    setSearchedProducts(filteredResults);
  };

  const handleSelect = (product) => {
    setSelectedProduct(product);
    setName(product.name);
    setCode(product.code);
    setPrice(product.price);
    setAvailable(product.cstock);
  };

  const handleClear = () => {
    setSelectedProduct(null);
    setName('');
    setCode('');
    setPrice('');
    setQuantity('');
    setAvailable('');
    setSearch('');
    setComment('');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setIsSubmiting(true);

    if (isSubmiting) {
      return;
    }

    const modalData = {
      code: Number(code),
      name: name.toLowerCase(),
      available: Number(available),
      quantity: Number(quantity),
      comment: comment,
    };

    apiCall
      .patch(`${ORDERS_URL}/${id}/addproduct`, modalData)
      .then(() => {
        handleClose();
        setIsSubmiting(false);
      })
      .catch((err) => {
        setError(err.response.data.message);
        setIsSubmiting(false);
      });
  };

  return (
    <>
      <Button variant='primary' onClick={handleShow} size='sm'>
        Add
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>New </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className='text-danger'>{error}</p>
          {!selectedProduct && (
            <>
              <Form.Group className=' mb-3'>
                <Form.Label>Name or Code</Form.Label>
                <Form.Control
                  autoFocus
                  type='text'
                  placeholder='Name or Code'
                  value={search}
                  onChange={(e) => handleSearch(e)}
                />
              </Form.Group>
              {search && (
                <ListGroup>
                  {searchedproducts.map((item) => (
                    <ListGroup.Item
                      action
                      key={item._id}
                      className=' text-capitalize'
                      onClick={() => {
                        handleSelect(item);
                      }}>
                      {item.code} - {item.name} - {`K${item.price}`}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </>
          )}
          {selectedProduct && (
            <>
              <Form onSubmit={handleSubmit}>
                <Row className='mb-3'>
                  <Col>
                    <Form.Label>Name</Form.Label>
                    <Form.Control readOnly value={name} />
                  </Col>
                  <Col>
                    <Form.Label>Code</Form.Label>
                    <Form.Control readOnly value={code} />
                  </Col>
                </Row>
                <Row className='mb-3'>
                  <Col>
                    <Form.Label>Price</Form.Label>
                    <Form.Control readOnly value={price} />
                  </Col>
                  <Col>
                    <Form.Label>Available</Form.Label>
                    <Form.Control readOnly value={available} />
                  </Col>
                </Row>
                <Form.Group className='mb-3'>
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    autoFocus
                    required
                    type='number'
                    placeholder='Quantity'
                    min={0}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Label>Comment</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Comment'
                    min={0}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </Form.Group>
                <Button variant='primary' type='submit' disabled={isSubmiting}>
                  {isSubmiting ? 'Submitting...' : 'Submit'}
                </Button>
              </Form>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default NewProductModal;
