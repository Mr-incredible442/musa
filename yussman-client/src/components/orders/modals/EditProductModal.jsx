/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import apiCall from '../../../helpers/apiCall';

import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { BiEdit } from 'react-icons/bi';

import { ORDERS_URL } from '../../../helpers/variables';

function EditProductModal({ id, qtt, coment, prodId }) {
  const [error, setError] = useState('');

  const [show, setShow] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);

  const [quantity, setQuantity] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    setQuantity(qtt);
    setComment(coment);
  }, [qtt, coment]);

  const handleClose = () => {
    setShow(false);
    // handleClear();
  };
  const handleShow = () => {
    setQuantity(qtt);
    setComment(coment);
    setError('');
    setShow(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setIsSubmiting(true);

    if (isSubmiting) {
      return;
    }

    const modalData = {
      quantity: Number(quantity),
      comment: comment,
      _id: prodId,
    };

    apiCall
      .patch(`${ORDERS_URL}/${id}/updateproduct`, modalData)
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
      <Button
        onClick={handleShow}
        variant='outline-secondary'
        size='sm'
        className='d-flex justify-content-center align-items-center'>
        <BiEdit />
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>New </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className='text-danger'>{error}</p>
          <Form onSubmit={handleSubmit}>
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
            <Button variant='primary' type='submit'>
              Add
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default EditProductModal;
