/* eslint-disable react/prop-types */
import { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { BsDoorOpen } from 'react-icons/bs';

import apiCall from '../../../helpers/apiCall';

import { LOCAL_URL } from '../../../helpers/variables';

function LogOutUser({ id, name }) {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const logOutUser = () => {
    setIsLoading(true);
    apiCall
      .post(`${LOCAL_URL}/users/logout/${id}`)
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
        variant='outline-secondary'
        size='sm'
        onClick={handleShow}
        className='d-flex justify-content-center align-items-center'>
        <BsDoorOpen />
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        size='sm'
        aria-labelledby='contained-modal-title-vcenter'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Log user out</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to log{' '}
            <span className='text-capitalize fw-bold'>{name}</span> out?
          </p>
          <Button
            variant='outline-danger'
            disabled={isLoading}
            onClick={() => {
              logOutUser();
            }}>
            {isLoading ? 'Logging out...' : 'Yes'}
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default LogOutUser;
