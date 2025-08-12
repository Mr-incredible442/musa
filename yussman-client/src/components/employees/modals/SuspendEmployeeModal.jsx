/* eslint-disable react/prop-types */
import { useState } from 'react';
import apiCall from '../../../helpers/apiCall';
import { useNavigate } from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { EMPLOYEE_URL } from '../../../helpers/variables';

function SuspendEmployeeModal({ employee }) {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const buttonVariant =
    employee.status === 'active' ? 'outline-danger' : 'outline-primary';
  const buttonText = employee.status === 'active' ? 'Deactivate' : 'Activate';

  function handleSuspendEmployee() {
    setIsLoading(true);
    apiCall
      .post(`${EMPLOYEE_URL}/togglestatus/${employee._id}`)
      .then(() => {
        handleClose();
        setIsLoading(false);
        navigate('/employees');
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  }

  return (
    <>
      <Button size='sm' variant={buttonVariant} onClick={handleShow}>
        {buttonText}
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop='static'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Deactivate Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to Deactivate this employee?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='outline-secondary'
            onClick={handleClose}
            disabled={isLoading}>
            Close
          </Button>
          <Button
            variant={buttonVariant}
            onClick={handleSuspendEmployee}
            disabled={isLoading}>
            {isLoading ? 'Loading...' : buttonText}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default SuspendEmployeeModal;
