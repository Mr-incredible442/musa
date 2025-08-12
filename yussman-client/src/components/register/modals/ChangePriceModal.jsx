/* eslint-disable react/prop-types */
import { useState, useContext, useEffect } from 'react';
import apiCall from '../../../helpers/apiCall';

import { Form, Col, Row, ListGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { ShopA1Context } from '../../../context/ShopA1Context';
import { ShopA2Context } from '../../../context/ShopA2Context';
import { ShopBContext } from '../../../context/ShopBContext';
import { StoreContext } from '../../../context/StoreContext';
import { ShopCContext } from '../../../context/ShopCContext';

import {
  SHOPA1_URL,
  SHOPA2_URL,
  SHOPB_URL,
  STORE_LOCAL_URL,
  SHOPC_URL,
} from '../../../helpers/variables';

function ChangePriceModal() {
  const { shopA1Shift } = useContext(ShopA1Context);
  const { shopA2Shift } = useContext(ShopA2Context);
  const { shopBShift } = useContext(ShopBContext);
  const { storeShift } = useContext(StoreContext);
  const { shopCShift } = useContext(ShopCContext);

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const shopA1Stock = Array.isArray(shopA1Shift.stock)
      ? shopA1Shift.stock.map((item) => ({
          ...item,
          source: 'shopA1',
          shiftId: shopA1Shift._id,
        }))
      : [];
    const shopA2Stock = Array.isArray(shopA2Shift.stock)
      ? shopA2Shift.stock.map((item) => ({
          ...item,
          source: 'shopA2',
          shiftId: shopA2Shift._id,
        }))
      : [];
    const shopBStock = Array.isArray(shopBShift.stock)
      ? shopBShift.stock.map((item) => ({
          ...item,
          source: 'shopB',
          shiftId: shopBShift._id,
        }))
      : [];

    const storeStock = Array.isArray(storeShift.stock)
      ? storeShift.stock.map((item) => ({
          ...item,
          source: 'store',
          shiftId: storeShift._id,
        }))
      : [];
    const shopCStock = Array.isArray(shopCShift.stock)
      ? shopCShift.stock.map((item) => ({
          ...item,
          source: 'shopC',
          shiftId: shopCShift._id,
        }))
      : [];

    setProducts([
      ...shopA1Stock,
      ...shopA2Stock,
      ...shopBStock,
      ...storeStock,
      ...shopCStock,
    ]);
  }, [shopA1Shift, shopA2Shift, shopBShift, storeShift, shopCShift]);

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
      requestUrl = `${STORE_LOCAL_URL}/${selectedProduct.shiftId}/updatename/${selectedProduct._id}`;
    } else {
      let baseUrl;
      switch (selectedProduct.source) {
        case 'shopA1':
          baseUrl = SHOPA1_URL;
          break;
        case 'shopA2':
          baseUrl = SHOPA2_URL;
          break;
        case 'shopB':
          baseUrl = SHOPB_URL;
          break;
        case 'shopC':
          baseUrl = SHOPC_URL;
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
