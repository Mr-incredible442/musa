import { useState } from 'react';
import apiCall from '../../../helpers/apiCall';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import { CREDIT_URL } from '../../../helpers/variables';

function AddCreditModal() {
  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
    handleClear();
  };
  const handleShow = () => setShow(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');

  const handleClear = () => {
    setName('');
    setDate('');
    setAmount('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (isNaN(parseFloat(amount))) {
      return;
    }

    setIsSubmitting(true);

    apiCall
      .post(`${CREDIT_URL}/newcredit`, {
        name: name.toLowerCase(),
        date,
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
      <Button
        onClick={handleShow}
        variant='outline-primary'
        className='d-flex justify-content-center align-items-center'>
        Add Credit
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        aria-labelledby='contained-modal-title-vcenter'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>New Credit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-3' controlId='formBasicNrc'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter Name'
                required
                autoComplete='off'
                onChange={(e) => setName(e.target.value)}
                value={name}
                autoFocus
              />
            </Form.Group>
            <Form.Group className='mb-3' controlId='formBasicFirstName'>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type='date'
                required
                autoComplete='off'
                onChange={(e) => setDate(e.target.value)}
                value={date}
              />
            </Form.Group>
            <Form.Group className='mb-3' controlId='formBasicLastName'>
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type='number'
                placeholder='Enter amount'
                required
                autoComplete='off'
                onChange={(e) => setAmount(e.target.value)}
                value={amount}
              />
            </Form.Group>
            <Button variant='primary' type='submit' disabled={isSubmitting}>
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AddCreditModal;
