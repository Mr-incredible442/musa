/* eslint-disable react/prop-types */
import { useState, useContext } from 'react';

import { useNavigate } from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Form } from 'react-bootstrap';

import { AuthContext } from '../../context/AuthContext';

function PayModal({ amount, id, handleUpdate, name }) {
  const { user } = useContext(AuthContext);

  const [show, setShow] = useState(false);
  const [cDate, setCDate] = useState('');
  const [paidBy, setPaidBy] = useState(user.firstName);

  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmiit = (e) => {
    e.preventDefault();
    const data = {
      collectionDate: cDate,
      paidBy: paidBy,
      paid: true,
    };

    handleUpdate(id, data);
    navigate('/goat');
  };

  return (
    <>
      <Button variant='primary' onClick={handleShow}>
        Pay
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop='static'
        aria-labelledby='contained-modal-title-vcenter'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>{name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => handleSubmiit(e)}>
            <Modal.Title>K {amount}</Modal.Title>
            <Form.Group className='mb-3'>
              <Form.Label>Collection Date</Form.Label>
              <Form.Control
                required
                type='date'
                value={cDate}
                onChange={(e) => setCDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Paid By</Form.Label>
              <Form.Control
                autoFocus
                required
                type='text'
                value={user.firstName}
                readOnly
                onChange={(e) => setPaidBy(e.target.value)}
              />
            </Form.Group>
            <Button type='submit'>Pay</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default PayModal;
