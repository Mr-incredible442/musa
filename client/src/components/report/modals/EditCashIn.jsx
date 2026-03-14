/* eslint-disable react/prop-types */
import { useContext, useMemo, useState } from 'react';
import apiCall from '../../../helpers/apiCall';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { BiEdit } from 'react-icons/bi';
import { ReportContext } from '../../../context/ReportContext';

function EditCashIn({ field, id, fieldIndex, value }) {
  const { baseUrl } = useContext(ReportContext);
  const [amount, setAmount] = useState(value);
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fieldIdentifier = useMemo(() => (typeof fieldIndex === 'number' ? fieldIndex : field), [field, fieldIndex]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    apiCall
      .post(`${baseUrl}/${id}/updatecashin`, { field: fieldIdentifier, amount })
      .then(() => { handleClose(); setAmount(''); setIsLoading(false); })
      .catch((err) => { console.log(err); setIsLoading(false); });
  };

  return (
    <>
      <Button variant="outline-secondary" onClick={handleShow} size="sm" className="d-flex justify-content-center align-items-center">
        <BiEdit />
      </Button>
      <Modal show={show} onHide={handleClose} backdrop="static" centered keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Edit {field} Cash In</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" size="sm" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={isLoading}>{isLoading ? 'Loading...' : 'Submit'}</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default EditCashIn;
