/* eslint-disable react/prop-types */
import { useState } from 'react';
import apiCall from '../../../helpers/apiCall';
import { useNavigate } from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { EMPLOYEE_URL } from '../../../helpers/variables';
import { Form } from 'react-bootstrap';

function SignEmployeeContract({ employee }) {
  const [show, setShow] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isloading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleClose = () => {
    setShow(false);
    setStartDate('');
  };
  const handleShow = () => setShow(true);

  function handleSuspendEmployee(e) {
    e.preventDefault();
    setIsLoading(true);
    apiCall
      .post(`${EMPLOYEE_URL}/togglecontract/${employee._id}`, {
        contractStart: startDate,
        contractEnd: endDate,
      })
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
      <Button variant='outline-primary' onClick={handleShow}>
        Sign Contract
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
          <Form onSubmit={handleSuspendEmployee}>
            <Form.Group
              className='mb-3'
              controlId='exampleForm.ControlTextarea1'>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type='date'
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group
              className='mb-3'
              controlId='exampleForm.ControlTextarea1'>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type='date'
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>
            <Button
              variant='outline-primary'
              type='submit'
              disabled={isloading}>
              {isloading ? 'Loading...' : 'Submit'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default SignEmployeeContract;
