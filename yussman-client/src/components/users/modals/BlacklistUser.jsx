/* eslint-disable react/prop-types */
import { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { BsLock, BsUnlock } from 'react-icons/bs';

import apiCall from '../../../helpers/apiCall';

import { LOCAL_URL } from '../../../helpers/variables';

function BlockUser({ id, isActive, name }) {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const blockUser = () => {
    setIsLoading(true);
    apiCall
      .patch(`${LOCAL_URL}/users/toggleuser/${id}`)
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
        variant={isActive ? 'outline-warning' : 'outline-info'}
        size='sm'
        onClick={handleShow}
        className='d-flex justify-content-center align-items-center'>
        {isActive ? <BsLock /> : <BsUnlock />}
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        size='sm'
        aria-labelledby='contained-modal-title-vcenter'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>{isActive ? 'Block User' : 'Unblock User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to {isActive ? 'block' : 'unblock'}{' '}
            <span className='text-capitalize fw-bold'>{name}</span>?
          </p>
          <Button
            variant='outline-danger'
            disabled={isLoading}
            onClick={() => {
              blockUser();
            }}>
            {isLoading ? (isActive ? 'Blocking...' : 'Unblocking...') : 'Yes'}
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default BlockUser;
