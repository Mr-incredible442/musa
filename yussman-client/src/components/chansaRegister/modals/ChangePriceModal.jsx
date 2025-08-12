/* eslint-disable react/prop-types */
import { useState, useContext, useEffect } from 'react';
import apiCall from '../../../helpers/apiCall';

import { Form, Col, Row, ListGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { ChansaStoreContext } from '../../../context/ChansaStoreContext';
import { ChansaRestaurantContext } from '../../../context/ChansaRestaurantContext';

import {
  CHANSA_RESTAURANT_URL,
  CHANSA_STORE_URL,
} from '../../../helpers/variables';

function ChangePriceModal() {
  const { storeShift } = useContext(ChansaStoreContext);
  const { shift } = useContext(ChansaRestaurantContext);

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const restaurantStock = Array.isArray(shift.stock)
      ? shift.stock.map((item) => ({
          ...item,
          source: 'restaurant',
          shiftId: shift._id,
        }))
      : [];

    const storeStock = Array.isArray(storeShift.stock)
      ? storeShift.stock.map((item) => ({
          ...item,
          source: 'store',
          shiftId: storeShift._id,
        }))
      : [];

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
    setSearch('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmiting(true);

    if (!selectedProduct) {
      console.error('No product selected');
      setIsSubmiting(false);
      return;
    }

    const modalData = {
      price: Number(price),
      name,
    };

    let requestUrl;

    // Conditional URL construction for store or other shops
    if (selectedProduct.source === 'store') {
      requestUrl = `${CHANSA_STORE_URL}/${selectedProduct.shiftId}/updatename/${selectedProduct._id}`;
    } else {
      let baseUrl;
      switch (selectedProduct.source) {
        case 'restaurant':
          baseUrl = CHANSA_RESTAURANT_URL;
          break;
        default:
          console.error('Invalid product source');
          setIsSubmiting(false);
          return;
      }
      requestUrl = `${baseUrl}/${selectedProduct.shiftId}/editname/${selectedProduct._id}`;
    }

    apiCall
      .post(requestUrl, modalData)
      .then(() => {
        handleClear();
        handleClose();
        setIsSubmiting(false);
      })
      .catch((err) => {
        console.error(err);
        setIsSubmiting(false);
      });
  };

  return (
    <>
      <Button variant='outline-primary' onClick={handleShow} size='sm'>
        Change Price
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
                    <Form.Control
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      autoFocus
                    />
                  </Col>
                </Row>

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

export default ChangePriceModal;
