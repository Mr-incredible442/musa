/* eslint-disable react/prop-types */
import { useContext, useState } from 'react';
import apiCall from '../../../helpers/apiCall';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { BiEdit } from 'react-icons/bi';
import { ReportContext } from '../../../context/ReportContext';

function UpdateCashOut({ id, cashOutId, description, amount }) {
  const { baseUrl } = useContext(ReportContext);
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localDescription, setLocalDescription] = useState(description ?? '');
  const [localAmount, setLocalAmount] = useState(amount !== undefined && amount !== null ? String(amount) : '');

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setLocalDescription(description ?? '');
    setLocalAmount(amount !== undefined && amount !== null ? String(amount) : '');
    setShow(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    apiCall
      .post(`${baseUrl}/${id}/updatecashout`, { cashOutId, description: localDescription, amount: localAmount })
      .then(() => { handleClose(); setLocalDescription(''); setLocalAmount(''); setIsLoading(false); })
      .catch((err) => { console.log(err); setIsLoading(false); });
  };

  return (
    <>
      <Button variant="outline-secondary" size="sm" onClick={handleShow} className="d-flex justify-content-center align-items-center">
        <BiEdit />
      </Button>
      <Modal show={show} onHide={handleClose} size="sm" centered keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Update Cash Out</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control type="text" autoComplete="off" required value={localDescription} onChange={(e) => setLocalDescription(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" autoComplete="off" required autoFocus min={0} value={localAmount} onChange={(e) => setLocalAmount(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={isLoading}>{isLoading ? 'Updating...' : 'Update'}</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default UpdateCashOut;
