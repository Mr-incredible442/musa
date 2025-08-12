/* eslint-disable react/prop-types */
import { useState } from 'react';
import apiCall from '../../../helpers/apiCall';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import { CHANSA_RESTAURANT_URL } from '../../../helpers/variables';

function CashModal({ id }) {
  const [amount, setAmount] = useState('');
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    apiCall
      .post(`${CHANSA_RESTAURANT_URL}/${id}/addtocash`, { amount })
      .then(() => {
        setAmount('');
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
      <Button variant='outline-info' onClick={handleShow} size='sm'>
        New
      </Button>

      <Modal
        show={show}
        onHide={() => {
          handleClose();
          setAmount('');
        }}
        backdrop='static'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Add Cash</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-3'>
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type='number'
                autoComplete='off'
                required
                autoFocus
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

export default CashModal;
