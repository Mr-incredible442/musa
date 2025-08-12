/* eslint-disable react/prop-types */
import { useState, useContext } from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import apiCall from '../../../helpers/apiCall';
import { AuthContext } from '../../../context/AuthContext';

import { LOCAL_URL } from '../../../helpers/variables';

function LogEveryoneOut() {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { dispatch } = useContext(AuthContext);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const logEveryoneOut = () => {
    setIsLoading(true);
    apiCall
      .post(`${LOCAL_URL}/users/logoutall`)
      .then(() => {
        handleClose();
        setIsLoading(false);
        dispatch({ type: 'LOGOUT' });
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  return (
    <>
      <Button
        variant='outline-danger'
        onClick={handleShow}
        className='d-flex justify-content-center align-items-center'>
        Log Everyone Out
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        size='sm'
        aria-labelledby='contained-modal-title-vcenter'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Log everyone out !</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want log everyone out ?</p>
          <Button
            variant='outline-danger'
            disabled={isLoading}
            onClick={() => {
              logEveryoneOut();
            }}>
            {isLoading ? 'Logging out...' : 'Yes'}
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default LogEveryoneOut;
