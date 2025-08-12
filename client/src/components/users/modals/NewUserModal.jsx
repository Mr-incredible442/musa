/* eslint-disable react/prop-types */
import { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import apiCall from '../../../helpers/apiCall';

import { LOCAL_URL } from '../../../helpers/variables';

function NewUserModal() {
  const [firstName, setfirstName] = useState('');
  const [lastName, setlastName] = useState('');
  const [number, setnumber] = useState('');
  const [password, setpassword] = useState('');
  const [role, setrole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleClear = () => {
    setfirstName('');
    setlastName('');
    setnumber('');
    setpassword('');
    setrole('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    apiCall
      .post(`${LOCAL_URL}/users/signup`, {
        firstName: firstName.toLowerCase(),
        lastName: lastName.toLowerCase(),
        number,
        password,
        role,
      })
      .then(() => {
        handleClear();
        handleClose();
        setIsLoading(false);
        setError('');
      })
      .catch((err) => {
        setError(err.response.data.msg);
        console.log(err.response.data.msg);
        setIsLoading(false);
      });
  };

  return (
    <>
      <Button variant='outline-info' onClick={handleShow}>
        Add User
      </Button>

      <Modal
        show={show}
        onHide={() => {
          handleClose();
          handleClear();
        }}
        backdrop='static'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {error && <p className='text-danger'>{error}</p>}
            <Form.Group className='mb-3'>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type='text'
                autoFocus
                autoComplete='off'
                required
                value={firstName}
                onChange={(e) => setfirstName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type='text'
                autoComplete='off'
                required
                value={lastName}
                onChange={(e) => setlastName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Number</Form.Label>
              <Form.Control
                type='text'
                autoComplete='off'
                required
                value={number}
                minLength={10}
                maxLength={10}
                onChange={(e) => setnumber(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type='password'
                autoComplete='off'
                required
                value={password}
                minLength={5}
                onChange={(e) => setpassword(e.target.value)}
              />
            </Form.Group>
            <Form.Label>Role</Form.Label>
            <Form.Select
              className='mb-3'
              required
              value={role}
              onChange={(e) => setrole(e.target.value)}>
              <option value='' disabled>
                Select role
              </option>
              <option value='user'>User</option>
              <option value='admin'>Admin</option>
            </Form.Select>
            <Button variant='primary' type='submit' disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Submit'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default NewUserModal;
