/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import apiCall from '../../../helpers/apiCall';

import { SHOPA1_URL } from '../../../helpers/variables';

function ReceivedModal({ show, handleClose, result, id }) {
  const [modalData, setModalData] = useState({
    code: '',
    name: '',
    amount: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (result) {
      setModalData({
        code: result.code,
        name: result.name,
        amount: '',
      });
    }
  }, [result]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    apiCall
      .post(`${SHOPA1_URL}/${id}/addtoreceived`, modalData)
      .then(() => {
        handleClose();
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };
  const debounceSubmit = debounce(handleSubmit, 200);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    debounceSubmit();
  };

  return (
    <>
      <Button variant='outline-info' onClick={handleClose} disabled>
        New
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop='static'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>New Received</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group className='mb-3'>
              <Form.Label>Code</Form.Label>
              <Form.Control
                type='number'
                autoComplete='off'
                name='code'
                value={modalData.code}
                onChange={handleInputChange}
                readOnly
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='text'
                autoComplete='off'
                name='name'
                value={modalData.name}
                onChange={handleInputChange}
                readOnly
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                autoFocus
                type='number'
                autoComplete='off'
                name='amount'
                value={modalData.amount}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Button variant='primary' type='submit' disabled={isLoading}>
              {isLoading ? 'Loading…' : 'Submit'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export default ReceivedModal;
