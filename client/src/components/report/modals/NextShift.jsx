/* eslint-disable react/prop-types */
import { useContext, useState } from 'react';
import apiCall from '../../../helpers/apiCall';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { ReportContext } from '../../../context/ReportContext';

function NextShift({ disabled }) {
  const { baseUrl } = useContext(ReportContext);
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = (e) => {
    e?.preventDefault();
    setIsLoading(true);
    apiCall
      .post(`${baseUrl}`)
      .then(() => { setIsLoading(false); handleClose(); })
      .catch((err) => { console.log(err); setIsLoading(false); });
  };

  return (
    <>
      <Button size="lg" variant="outline-primary" onClick={handleShow} disabled={disabled}>
        Next Shift
      </Button>
      <Modal show={show} onHide={handleClose} backdrop="static" centered keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Next Shift</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="display-6 text-center">Are you sure you want the next shift?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>Yes</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default NextShift;
