/* eslint-disable react/prop-types */
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

function NewGoatModal({ createNew }) {
  const [show, setShow] = useState(false);

  const [name, setName] = useState('');
  const [kgFields, setkgField] = useState([0]);
  const [date, setDate] = useState('');
  const [cDate, setCDate] = useState('');

  const supplier = {
    name: name.toLowerCase(),
    kgs: kgFields,
    date: date,
    collectionDate: cDate,
  };

  const clearAllFields = () => {
    setName('');
    setkgField([0]);
    setDate('');
    setCDate('');
  };

  const handleFieldAdd = () => {
    const list = [...kgFields, []];
    setkgField(list);
  };

  const handleFieldRemove = (index) => {
    const list = [...kgFields];
    list.splice(index, 1);

    setkgField(list);
  };

  const handleFieldChange = (e, index) => {
    const inputData = [...kgFields];
    inputData[index] = e.target.value;
    setkgField(inputData);
  };

  const handleClose = () => {
    setShow(false);
    clearAllFields();
  };
  const handleShow = () => setShow(true);

  const submitSupplier = (e) => {
    e.preventDefault();
    createNew(supplier);
    clearAllFields();
    setShow(false);
  };

  return (
    <>
      <Button variant='outline-info' onClick={handleShow}>
        New
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop='static'
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>New</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => submitSupplier(e)}>
            <Form.Group className='mb-3' controlId='formGroupName'>
              <Form.Control
                type='text'
                autoFocus
                placeholder='Name'
                autoComplete='off'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            {kgFields.map((field, index) => {
              return (
                <Row className='mb-2' key={index}>
                  <Col>
                    <Form.Control
                      name='kgs'
                      min={0}
                      type='number'
                      onChange={(e) => handleFieldChange(e, index)}
                      required
                    />
                  </Col>
                  <Col className='d-flex justify-content-between align-items-center'>
                    <Form.Label className='pt-1'>
                      K{field > 19 ? field * 30 : field * 20}
                    </Form.Label>
                    {kgFields.length > 1 && (
                      <Button
                        onClick={() => handleFieldRemove(index)}
                        size='sm mx-1'
                        variant='outline-danger'>
                        x
                      </Button>
                    )}
                  </Col>
                </Row>
              );
            })}

            <Button
              onClick={handleFieldAdd}
              size='sm mx-1'
              variant='outline-info'>
              Add Field
            </Button>
            <Form.Group className='mb-3' controlId='formGroupDate'>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type='date'
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className='mb-3' controlId='formGroupCollectionDate'>
              <Form.Label>Collection Date</Form.Label>
              <Form.Control
                type='date'
                value={cDate}
                onChange={(e) => setCDate(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant='primary' type='submit'>
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default NewGoatModal;
