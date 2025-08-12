/* eslint-disable react/prop-types */
import { useState } from 'react';
import apiCall from '../../../helpers/apiCall';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { EMPLOYEE_URL } from '../../../helpers/variables';

function PaymentConfirm({ unpaidTransactions }) {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handlePayButtonClick = async () => {
    setIsLoading(true);
    try {
      const transactionIds = unpaidTransactions.map(
        (transaction) => transaction._id,
      );

      await apiCall
        .post(`${EMPLOYEE_URL}/updatetransaction/paid`, {
          transactionIds,
        })
        .then(() => {
          handleClose();
          setIsLoading(false);
        });
    } catch (error) {
      console.error('Error updating paid status:', error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant='outline-primary'
        onClick={handleShow}
        disabled={unpaidTransactions.length < 1}
        className='d-flex justify-content-center align-items-center'>
        Pay
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        size='sm'
        aria-labelledby='contained-modal-title-vcenter'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Pay</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to proceed ?</p>
          <Button
            variant='outline-success'
            disabled={isLoading}
            onClick={() => {
              handlePayButtonClick();
            }}>
            {isLoading ? 'Loading...' : 'Confirm'}
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default PaymentConfirm;
