/* eslint-disable react/prop-types */
import { useState } from 'react';
import apiCall from '../../../helpers/apiCall';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { AiOutlineDelete } from 'react-icons/ai';

import { CHINSALI_REGISTER_URL } from '../../../helpers/variables';

function DeleteShift({ shiftId, getShifts }) {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const deleteShift = () => {
    setIsLoading(true);

    if (isLoading) {
      return;
    }

    apiCall
      .delete(`${CHINSALI_REGISTER_URL}/${shiftId}`)
      .then(() => {
        handleClose();
        setIsLoading(false);
        getShifts();
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
        handleClose();
      });
  };

  return (
    <>
      <Button
        variant='outline-danger'
        size='sm'
        onClick={handleShow}
        className='d-flex justify-content-center align-items-center'>
        <AiOutlineDelete />
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        size='sm'
        aria-labelledby='contained-modal-title-vcenter'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Delete!!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete ?</p>
          <Button
            variant='outline-danger'
            disabled={isLoading}
            onClick={() => {
              deleteShift();
            }}>
            {isLoading ? 'Deleting...' : 'Yes'}
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default DeleteShift;
