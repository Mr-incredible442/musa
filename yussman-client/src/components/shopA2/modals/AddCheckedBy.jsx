/* eslint-disable react/prop-types */
import { useState } from 'react';
import apiCall from '../../../helpers/apiCall';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import { SHOPA2_URL } from '../../../helpers/variables';

function AddAcountant({ id }) {
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    apiCall
      .post(`${SHOPA2_URL}/${id}/addcheckedby`, {
        name: name.toLowerCase(),
      })
      .then(() => {
        setName('');
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
      <Button variant='outline-secondary' onClick={handleShow} size='sm'>
        +
      </Button>

      <Modal
        show={show}
        onHide={() => {
          handleClose();
          setName('');
        }}
        backdrop='static'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Chcke By</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-3'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='text'
                autoComplete='off'
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <Button variant='primary' type='submit' disabled={isLoading}>
              {isLoading ? 'Loading…' : 'Submit'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AddAcountant;
