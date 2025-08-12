/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import apiCall from '../../../helpers/apiCall';

import { Form, Col, Row } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { BiEdit } from 'react-icons/bi';

import { CHINSALI_REGISTER_URL } from '../../../helpers/variables';

function UpdateProductModal({ id, item }) {
  const [show, setShow] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [priceBought, setPriceBought] = useState('');
  const [from, setFrom] = useState('');

  useEffect(() => {
    setName(item.name);
    setCode(item.code);
    setPrice(item.unitPrice);
    setPriceBought(item.priceBought);
    setQuantity(item.quantity);
    setFrom(item.section);
  }, [item]);

  const handleClose = () => {
    setShow(false);
    handleClear();
  };
  const handleShow = () => setShow(true);

  const handleClear = () => {
    // setName('');
    // setCode('');
    // setPrice('');
    // setPriceBought('');
    // setQuantity('');
    // setFrom('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setIsSubmiting(true);

    if (isSubmiting) {
      return;
    }

    const modalData = {
      unitPrice: Number(price),
      quantity: Number(quantity),
      priceBought: Number(priceBought),
      section: from.toLowerCase(),
    };

    apiCall
      .post(`${CHINSALI_REGISTER_URL}/${id}/updatestock/${item._id}`, modalData)
      .then(() => {
        setIsSubmiting(false);
        handleClose();
      })
      .catch((err) => {
        console.log(err);
        setIsSubmiting(false);
      });
  };

  return (
    <>
      <Button
        variant='outline-primary'
        size='sm'
        onClick={handleShow}
        className='d-flex justify-content-center align-items-center'>
        <BiEdit />
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>New </Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
        </Modal.Body>
      </Modal>
    </>
  );
}

export default UpdateProductModal;
