/* eslint-disable react/prop-types */
import { useEffect, useState, useContext } from 'react';
import apiCall from '../../../helpers/apiCall';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { BiEdit } from 'react-icons/bi';

import { AuthContext } from '../../../context/AuthContext';

import { SHOPC_URL } from '../../../helpers/variables';

function NewProductModal({ id, stock, getShift }) {
  const [oStock, setOStock] = useState('');
  const [damage, setDamage] = useState('');
  const [cStock, setCStock] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (Object.keys(stock).length > 0) {
      setOStock(stock.ostock);
      setDamage(stock.damage);
      setCStock(stock.cstock);
    }
  }, [stock]);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleClear = () => {
    setOStock('');
    setDamage('');
    setCStock('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const modalData = {
      ostock: Number(oStock),
      damage: Number(damage),
      cstock: Number(cStock),
    };
    apiCall
      .post(`${SHOPC_URL}/${id}/editstock/${stock._id}`, modalData)
      .then(() => {
        handleClear();
        handleClose();
        setIsLoading(false);
        getShift();
      })
      .catch((err) => {
        console.log(err);
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
          <Modal.Title>Edit Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-3'>
              <Form.Label>Opening Stock</Form.Label>
              <Form.Control
                type='number'
                autoComplete='off'
                required
                value={oStock}
                readOnly={user.role === 'admin' ? false : true}
                onChange={(e) => setOStock(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Damage</Form.Label>
              <Form.Control
                type='number'
                autoComplete='off'
                required
                value={damage}
                onChange={(e) => setDamage(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Closing Stock</Form.Label>
              <Form.Control
                type='number'
                autoFocus
                autoComplete='off'
                required
                value={cStock}
                onChange={(e) => setCStock(e.target.value)}
              />
            </Form.Group>
            <Button variant='primary' type='submit' disabled={isLoading}>
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default NewProductModal;
