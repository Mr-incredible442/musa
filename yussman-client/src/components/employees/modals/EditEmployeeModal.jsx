/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from 'react';
import apiCall from '../../../helpers/apiCall';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import { EMPLOYEE_URL } from '../../../helpers/variables';

function EditEmployeeModal({ employee }) {
  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
    handleClear();
  };
  const handleShow = () => setShow(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nrc, setNrc] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [number, setNumber] = useState('');
  const [salary, setSalary] = useState('');
  const [section, setSection] = useState('');
  const [error, setError] = useState('');

  const getAllfields = useCallback(() => {
    if (Object.keys(employee).length > 0) {
      setNrc(employee.nrc);
      setFirstName(employee.firstName);
      setLastName(employee.lastName);
      setNumber(employee.number);
      setSalary(employee.dailySalary);
      setSection(employee.section);
    }
  }, [employee]);

  useEffect(() => {
    getAllfields();
  }, [employee, getAllfields]);

  const handleClear = () => {
    getAllfields();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (isNaN(parseFloat(salary))) {
      setError('Salary must be a valid number.');
      return;
    }

    setIsSubmitting(true);

    apiCall
      .put(`${EMPLOYEE_URL}/updateemployee/${employee._id}`, {
        nrc: nrc,
        firstName: firstName.toLowerCase(),
        lastName: lastName.toLowerCase(),
        number: number,
        dailySalary: Number(salary),
        section: section,
      })
      .then(() => {
        handleClose();
        setIsSubmitting(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsSubmitting(false);
      });
  };

  return (
    <>
      <Button
        onClick={handleShow}
        variant='outline-primary'
        className='d-flex justify-content-center align-items-center'>
        Edit Employee
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        aria-labelledby='contained-modal-title-vcenter'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>New Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-3' controlId='formBasicNrc'>
              <p className='text-danger'>{error}</p>
              <Form.Label>NRC</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter NRC'
                required
                autoComplete='off'
                onChange={(e) => setNrc(e.target.value)}
                value={nrc}
                autoFocus
              />
            </Form.Group>
            <Form.Group className='mb-3' controlId='formBasicFirstName'>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter first name'
                required
                autoComplete='off'
                onChange={(e) => setFirstName(e.target.value)}
                value={firstName}
              />
            </Form.Group>
            <Form.Group className='mb-3' controlId='formBasicLastName'>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter last name'
                required
                autoComplete='off'
                onChange={(e) => setLastName(e.target.value)}
                value={lastName}
              />
            </Form.Group>
            <Form.Group className='mb-3' controlId='formBasicNumber'>
              <Form.Label>Number</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter number'
                required
                autoComplete='off'
                maxLength={10}
                minLength={10}
                onChange={(e) => setNumber(e.target.value)}
                value={number}
              />
            </Form.Group>
            <Form.Group className='mb-3' controlId='formBasicSalry'>
              <Form.Label>Daily Salary</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter salary'
                required
                autoComplete='off'
                onChange={(e) => setSalary(e.target.value)}
                value={salary}
              />
            </Form.Group>
            <Form.Group className='mb-3' id='formBasicSection'>
              <Form.Label>Section</Form.Label>
              <Form.Select
                onChange={(e) => setSection(e.target.value)}
                value={section}
                required>
                <option value=''>Select section</option>
                <option value='restaurant'>Restaurant</option>
                <option value='shops'>Shops</option>
                <option value='booths'>Booths</option>
                <option value='blocks'>Blocks</option>
                <option value='general'>General</option>
                <option value='construction'>Construction</option>
              </Form.Select>
            </Form.Group>
            <Button variant='primary' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default EditEmployeeModal;
