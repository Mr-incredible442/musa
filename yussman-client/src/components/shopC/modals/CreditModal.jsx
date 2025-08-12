/* eslint-disable react/prop-types */
import { useState } from 'react';
import apiCall from '../../../helpers/apiCall';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import { SHOPC_URL } from '../../../helpers/variables';

function CreditModal({ shift }) {
  const [show, setShow] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleAddCredit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await apiCall
      .post(`${SHOPC_URL}/${shift._id}/addtocredit`, {
        description,
        amount,
      })
      .then(() => {
        setDescription('');
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
      <Button variant='outline-info' size='sm' onClick={handleShow}>
        New
      </Button>

      <Modal
        show={show}
        onHide={() => {
          handleClose();
          setDescription('');
          setAmount('');
        }}
        backdrop='static'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Add Credit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => handleAddCredit(e)}>
            <Form.Group className='mb-3'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type='text'
                autoFocus
                autoComplete='off'
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
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
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default CreditModal;
