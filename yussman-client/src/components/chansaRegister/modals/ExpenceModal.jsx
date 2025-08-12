/* eslint-disable react/prop-types */
import { useState } from 'react';
import apiCall from '../../../helpers/apiCall';
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { CHANSA_REGISTER_URL } from '../../../helpers/variables';

function ExpenseModal({ id }) {
  const [show, setShow] = useState(false);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setShow(false);
    handleClear();
  };
  const handleShow = () => setShow(true);

  const handleClear = () => {
    setDescription('');
    setAmount('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    if (isSubmitting) {
      return;
    }

    apiCall
      .post(`${CHANSA_REGISTER_URL}/${id}/addtoexpense`, {
        description: description.toLowerCase(),
        amount: Number(amount),
      })
      .then(() => {
        handleClose();
        setIsSubmitting(false);
      })
      .catch((err) => {
        console.log(err);
        setIsSubmitting(false);
      });
  };

  return (
    <>
      <Button variant='primary' onClick={handleShow}>
        New
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-3'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type='text'
                placeholder='Description'
                autoFocus
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type='number'
                placeholder='Amount'
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Form.Group>
            <Button variant='primary' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ExpenseModal;
