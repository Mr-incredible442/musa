/* eslint-disable react/prop-types */
import { useState } from 'react';
import apiCall from '../../../helpers/apiCall';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { ORDERS_URL } from '../../../helpers/variables';

function NewOrdersModal({ disabled }) {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const newOrders = () => {
    setIsLoading(true);

    if (isLoading) {
      return;
    }

    apiCall
      .post(`${ORDERS_URL}`)
      .then(() => {
        handleClose();
        setIsLoading(false);
        window.location.reload();
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  return (
    <>
      <Button
        variant='outline-secondary'
        size='sm'
        onClick={handleShow}
        disabled={disabled}
        className='d-flex justify-content-center align-items-center'>
        New Orders
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        size='sm'
        aria-labelledby='contained-modal-title-vcenter'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>New Orders!!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to create new orders ?</p>
          <Button
            variant='outline-danger'
            disabled={isLoading}
            onClick={() => {
              newOrders();
            }}>
            {isLoading ? 'Creating...' : 'Yes'}
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default NewOrdersModal;
