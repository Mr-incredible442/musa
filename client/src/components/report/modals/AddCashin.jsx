/* eslint-disable react/prop-types */
import { useContext, useState } from 'react';
import apiCall from '../../../helpers/apiCall';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { ReportContext } from '../../../context/ReportContext';

function AddCashIn({ id }) {
  const { baseUrl } = useContext(ReportContext);
  const [field, setField] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    apiCall
      .post(`${baseUrl}/${id}/addcashin`, { field, amount })
      .then(() => { setField(''); setAmount(''); handleClose(); setIsLoading(false); })
      .catch((err) => { console.log(err); setError(err.response?.data?.message); setIsLoading(false); });
  };

  return (
    <>
      <Button variant="outline-primary" onClick={handleShow} size="sm">Add</Button>
      <Modal show={show} onHide={handleClose} backdrop="static" centered keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Add Cash In</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {error && <Form.Text className="text-danger">{error}</Form.Text>}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control type="text" autoFocus autoComplete="off" required value={field} onChange={(e) => setField(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" autoComplete="off" required value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={isLoading}>{isLoading ? 'Loading...' : 'Submit'}</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AddCashIn;
