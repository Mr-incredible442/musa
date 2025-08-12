/* eslint-disable react/prop-types */
import { useEffect, useState, useContext } from 'react';
import apiCall from '../../../helpers/apiCall';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { BiEdit } from 'react-icons/bi';

import { AuthContext } from '../../../context/AuthContext';

import { STORE_LOCAL_URL } from '../../../helpers/variables';

function EditNameModal({ id, stock }) {
  const [ostock, setOstock] = useState('');
  const [damage, setDamage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (Object.keys(stock).length > 0) {
      setOstock(stock.ostock);
      setDamage(stock.damage);
    }
  }, [stock]);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleClear = () => {
    setOstock('');
    setDamage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const modalData = {
      ostock: Number(ostock),
      damage: Number(damage),
    };
    apiCall
      .post(`${STORE_LOCAL_URL}/${id}/updatestock/${stock._id}`, modalData)
      .then(() => {
        handleClear();
        handleClose();
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  return (
    <>
      <Button
        onClick={handleShow}
        variant='outline-secondary'
        size='sm'
        className='d-flex justify-content-center align-items-center'>
        <BiEdit />
      </Button>

      <Modal
        show={show}
        onHide={() => {
          handleClose();
        }}
        backdrop='static'
        centered
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Edit OStock or Damage</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-3'>
              <Form.Label>O Stock</Form.Label>
              <Form.Control
                type='number'
                autoComplete='off'
                required
                value={ostock}
                readOnly={user.role !== 'admin'}
                onChange={(e) => setOstock(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Damage</Form.Label>
              <Form.Control
                type='number'
                autoFocus
                autoComplete='off'
                required
                value={damage}
                onChange={(e) => setDamage(e.target.value)}
              />
            </Form.Group>
            <Button variant='primary' type='submit' disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Submit'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default EditNameModal;
