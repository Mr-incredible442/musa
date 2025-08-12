/* eslint-disable react/prop-types */
import { useState, useContext, useEffect } from 'react';
import apiCall from '../../../helpers/apiCall';

import { Form, Col, Row, ListGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { ChinsaliStoreContext } from '../../../context/ChinsaliStoreContext';
import { ChinsaliRestaurantContext } from '../../../context/ChinsaliRestaurantContext';

import { CHINSALI_REGISTER_URL } from '../../../helpers/variables';

function NewProductModal({ id }) {
  const { storeShift } = useContext(ChinsaliStoreContext);
  const { shift } = useContext(ChinsaliRestaurantContext);

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const restaurantStock = Array.isArray(shift.stock) ? shift.stock : [];
    const storeStock = Array.isArray(storeShift.stock) ? storeShift.stock : [];

    setProducts([...restaurantStock, ...storeStock]);
  }, [shift, storeShift]);

  const [show, setShow] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);

  const [search, setSearch] = useState('');
  const [searchedproducts, setSearchedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [priceBought, setPriceBought] = useState('');
  const [from, setFrom] = useState('');

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
  };

  const handleClear = () => {
    setSelectedProduct(null);
    setName('');
    setCode('');
    setPrice('');
    setPriceBought('');
    setQuantity('');
    setFrom('');
    setSearch('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setIsSubmiting(true);

    if (isSubmiting) {
      return;
    }

    const modalData = {
      name: name.toLowerCase(),
      code: Number(code),
      unitPrice: Number(price),
      quantity: Number(quantity),
      priceBought: Number(priceBought),
      section: from.toLowerCase(),
    };

    apiCall
      .post(`${CHINSALI_REGISTER_URL}/${id}/addtostock`, modalData)
      .then(() => {
        handleClose();
        setIsSubmiting(false);
      })
      .catch((err) => {
        console.log(err);
        setIsSubmiting(false);
      });
  };

  return (
    <>
      <Button variant='primary' onClick={handleShow} size='sm'>
        New
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>New </Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                <Form.Group className='mb-3'>
                  <Form.Label>Name</Form.Label>
                  <Form.Control readOnly value={name} />
                </Form.Group>
                <Row className='mb-3'>
                  <Col>
                    <Form.Label>Code</Form.Label>
                    <Form.Control readOnly value={code} />
                  </Col>
                  <Col>
                    <Form.Label>Price</Form.Label>
                    <Form.Control readOnly value={price} />
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
                  <Form.Label>Price Bought</Form.Label>
                  <Form.Control
                    required
                    type='number'
                    placeholder='Price Bought'
                    min={0}
                    value={priceBought}
                    onChange={(e) => setPriceBought(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Label>From</Form.Label>
                  <Form.Select
                    required
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}>
                    <option value=''>Open this select menu</option>
                    <option value='local'>Local</option>
                    <option value='mearaj'>Mearaj</option>
                    <option value='ilyas'>Ilyas</option>
                    <option value='outside'>Outside</option>
                    <option value='chansa'>Chansa</option>
                  </Form.Select>
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
