/* eslint-disable react/prop-types */
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';

import { AiOutlineDelete } from 'react-icons/ai';

function DeleteModal({ id, handleDelete }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const navigate = useNavigate();

  return (
    <>
      <Button variant='outline-danger' size='sm' onClick={handleShow}>
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
            onClick={() => {
              handleDelete(id);
              handleClose();
              navigate('/goat');
            }}>
            Yes
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default DeleteModal;
