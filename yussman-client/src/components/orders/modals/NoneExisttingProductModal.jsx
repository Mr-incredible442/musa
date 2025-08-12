/* eslint-disable react/prop-types */
import { useState } from 'react';
import apiCall from '../../../helpers/apiCall';

import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { ORDERS_URL } from '../../../helpers/variables';

function NoneExisttingProductModal({ id }) {
  const [error, setError] = useState('');

  const [show, setShow] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [comment, setComment] = useState('');

  const handleClose = () => {
    setShow(false);
    handleClear();
  };
  const handleShow = () => setShow(true);

  const handleClear = () => {
    setName('');
    setQuantity('');
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
      name: name.toLowerCase(),
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
      <Button variant='outline-primary' onClick={handleShow} size='sm'>
        New Product
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>New </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className='text-danger'>{error}</p>
          <>
            <Form onSubmit={handleSubmit}>
              <Form.Group className='mb-3'>
                <Form.Label>Name</Form.Label>
                <Form.Control
                  autoFocus
                  required
                  type='text'
                  placeholder='Name'
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                />
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>Quantity</Form.Label>
                <Form.Control
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
        </Modal.Body>
      </Modal>
    </>
  );
}

export default NoneExisttingProductModal;
