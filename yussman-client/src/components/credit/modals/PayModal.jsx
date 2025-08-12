/* eslint-disable react/prop-types */
import { useState } from 'react';
import apiCall from '../../../helpers/apiCall';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import { CREDIT_URL } from '../../../helpers/variables';

function PayModal({ disabled, id, balance }) {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
    setDate('');
    setAmount('');
  };
  const handleShow = () => setShow(true);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLoading) return;
    if (isNaN(parseFloat(amount))) return;

    const isclear = balance === parseFloat(amount) ? true : false;

    setIsLoading(true);

    apiCall
      .post(`${CREDIT_URL}/${id}/newtransaction`, {
        date,
        type: 'pay',
        amount: Number(amount),
        paid: Boolean(isclear),
      })
      .then(() => {
        handleClose();
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  return (
    <>
      <Button
        onClick={handleShow}
        variant='outline-info'
        className='d-flex justify-content-center align-items-center ms-2'
        disabled={disabled}>
        Pay
      </Button>

      <Modal
        show={show}
        onHide={() => {
          handleClose();
        }}
        backdrop='static'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Add Date</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-3'>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type='date'
                autoComplete='off'
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type='number'
                autoComplete='off'
                required
                value={amount}
                max={balance}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </Form.Group>
            <Button variant='primary' type='submit' disabled={isLoading}>
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default PayModal;
