/* eslint-disable react/prop-types */
import { useState } from 'react';
import apiCall from '../../../helpers/apiCall';

import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { Button } from 'react-bootstrap';

import { CHINSALI_STORE_URL } from '../../../helpers/variables';

function AddIssued({ children, product, clear, storeShift }) {
  const [show, setShow] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [to, setTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setQuantity('');
    setShow(false);
    clear();
  };
  const handleShow = () => setShow(true);

  if (product === null) {
    return;
  }

  const handlesubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    if (isNaN(Number(quantity))) {
      return;
    }

    const receivedData = {
      code: product.code,
      name: product.name,
      to: to,
      quantity: Number(quantity),
    };

    try {
      await apiCall
        .post(`${CHINSALI_STORE_URL}/${storeShift._id}/addissued`, receivedData)
        .then(() => {
          handleClose();
          setIsLoading(false);
        });
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={handleShow}
        className='d-flex justify-content-center align-items-center'>
        {children}
      </div>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop='static'
        aria-labelledby='contained-modal-title-vcenter'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Issued </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlesubmit}>
            <Form.Group className='mb-3'>
              <Form.Label htmlFor='code'>Code</Form.Label>
              <Form.Control
                type='text'
                id='code'
                value={product.code}
                readOnly
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label htmlFor='name'>Name</Form.Label>
              <Form.Control
                type='text'
                id='name'
                value={product.name}
                readOnly
              />
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor='to'>To</Form.Label>
              <Form.Select
                id='to'
                value={to}
                required
                autoFocus
                onChange={(e) => setTo(e.target.value)}>
                <option value=''>Select To</option>
                {storeShift.shops.map((shop) => (
                  <option key={shop} value={shop}>
                    {shop}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label htmlFor='quantity'>Quantity</Form.Label>
              <Form.Control
                type='text'
                id='quantity'
                value={quantity}
                required
                autoComplete='off'
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Form.Group>
            <Button variant='primary' type='submit' disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Submit'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AddIssued;
