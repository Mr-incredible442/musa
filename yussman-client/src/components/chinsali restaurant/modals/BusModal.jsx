/* eslint-disable react/prop-types */
import { useState } from 'react';
import apiCall from '../../../helpers/apiCall';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import { CHINSALI_RESTAURANT_URL } from '../../../helpers/variables';

function BusModal({ id }) {
  const [name, setName] = useState('');
  const [driver, setDriver] = useState('');
  const [status, setStatus] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const modalData = {
      name,
      driver,
      status,
      amount,
    };

    apiCall
      .post(`${CHINSALI_RESTAURANT_URL}/${id}/addtobus`, modalData)
      .then(() => {
        setName('');
        setDriver('');
        setStatus('');
        setAmount('');
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
    handleClose();
  };

  return (
    <>
      <Button variant='outline-info' onClick={handleShow} size='sm'>
        New
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop='static'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>New Bus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => handleSubmit(e)}>
            <Form.Group className='mb-3'>
              <Form.Label>Bus Name</Form.Label>
              <Form.Control
                type='text'
                autoFocus
                autoComplete='off'
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Driver</Form.Label>
              <Form.Control
                type='text'
                autoComplete='off'
                required
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
              />
            </Form.Group>
            <Form.Label>Status</Form.Label>
            <Form.Select
              className='mb-3'
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
              }}
              required>
              <option value='' disabled>
                Select an option
              </option>
              <option value='collected'>Collected</option>
              <option value='not collected'>Not Collected</option>
            </Form.Select>
            <Form.Group className='mb-3'>
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type='number'
                autoComplete='off'
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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

export default BusModal;
