/* eslint-disable react/prop-types */
import { useContext, useState } from 'react';
import apiCall from '../../../helpers/apiCall';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { ReportContext } from '../../../context/ReportContext';

function AddDate({ id }) {
  const { baseUrl } = useContext(ReportContext);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    apiCall
      .post(`${baseUrl}/${id}/adddate`, { date })
      .then(() => { setDate(''); handleClose(); setIsLoading(false); })
      .catch((err) => { console.log(err); setError(err.response?.data?.message); setIsLoading(false); });
  };

  return (
    <>
      <Button variant="outline-secondary" onClick={handleShow} size="sm">+</Button>
      <Modal show={show} onHide={handleClose} backdrop="static" centered keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Add Date</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {error && <Form.Text className="text-danger">{error}</Form.Text>}
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" autoFocus autoComplete="off" value={date} onChange={(e) => setDate(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={isLoading}>{isLoading ? 'Loading...' : 'Submit'}</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AddDate;
