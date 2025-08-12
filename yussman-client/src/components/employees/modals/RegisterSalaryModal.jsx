import { useState, useContext } from 'react';
import apiCall from '../../../helpers/apiCall';
import DatePicker from 'react-multi-date-picker';
import 'react-multi-date-picker/styles/backgrounds/bg-gray.css';

import { Col, Form, Row, ListGroup } from 'react-bootstrap';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { EmployeeContext } from '../../../context/EmployeeContext';

import { EMPLOYEE_URL } from '../../../helpers/variables';

function RegisterSalaryModal() {
  const [show, setShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [seachedEmployees, setSeachedEEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState({});

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState('salary');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [creditOwed, setCreditOwed] = useState(0);

  const [salary, setSalary] = useState('');
  const [days, setDays] = useState('');
  const [deduction, setDeduction] = useState(0);
  const [datesWorked, setDatesWorked] = useState([]);
  const [comment, setComment] = useState('');
  const [months, setMonths] = useState([]);

  const [employeeCode, setEmployeeCode] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  const handleClose = () => {
    setShow(false);
    handleClear();
  };
  const handleShow = () => setShow(true);

  const { employees } = useContext(EmployeeContext);

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);

    const filteredResults = employees.filter((item) => {
      const isCodeMatch = item.code.toString().includes(searchTerm);
      const isFirstNameMatch = item.firstName
        .toLowerCase()
        .includes(searchTerm);
      const isLastNameMatch = item.lastName.toLowerCase().includes(searchTerm);
      const isActive = item.status.toLowerCase() === 'active';

      return (isCodeMatch || isFirstNameMatch || isLastNameMatch) && isActive;
    });

    setSeachedEEmployees(filteredResults);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (status === 'salary' && datesWorked.length === 0) {
      setError('Please select at least one in dates worked.');
      return;
    }

    setError('');

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const formattedDatesWorked = datesWorked.map((date) => {
      const dateObj = new Date(date);
      return dateObj.toISOString().split('T')[0];
    });

    const formartedMonths = months.map((month) => {
      const dateObj = new Date(month);
      return dateObj.toISOString().split('T')[0];
    });

    const benefitAndCredit = {
      date,
      employeeId,
      employeeCode,
      status,
      amount,
      comment,
      months: formartedMonths,
    };

    const salaryData = {
      datesWorked: formattedDatesWorked,
      date,
      employeeId,
      employeeCode,
      status,
      dailySalary: salary,
      days,
      deduction,
    };

    const postData = status === 'salary' ? salaryData : benefitAndCredit;

    apiCall
      .post(`${EMPLOYEE_URL}/transaction`, postData)
      .then(() => {
        handleClose();
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setFirstName(employee.firstName);
    setLastName(employee.lastName);
    setEmployeeCode(employee.code);
    setEmployeeId(employee._id);
    setSalary(employee.dailySalary);
    setCreditOwed(employee.creditOwed);
    setSearch('');
  };

  const handleClear = () => {
    setFirstName('');
    setLastName('');
    setEmployeeCode('');
    setEmployeeId('');
    setSalary('');
    setSearch('');
    setAmount('');
    setDate('');
    setDays('');
    setDeduction(0);
    setComment('');
    setSeachedEEmployees([]);
    setSelectedEmployee({});
    setIsSubmitting(false);
    setStatus('salary');
    setDatesWorked([]);
    setError('');
  };

  return (
    <>
      <Button variant='primary' onClick={handleShow}>
        New
      </Button>
      <Modal
        show={show}
        centered
        onHide={handleClose}
        backdrop='static'
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>New Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmployee && Object.keys(selectedEmployee).length !== 0 ? (
            ''
          ) : (
            <Form.Group className='mb-3'>
              <Form.Label>Search</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter code or name'
                autoComplete='off'
                onChange={(e) => handleSearch(e)}
                value={search}
                autoFocus
              />
            </Form.Group>
          )}
          {search && (
            <ListGroup
              className='w-75'
              style={{
                position: 'absolute',
                top: '90px',
                left: '15px',
                right: '0',
                zIndex: '1000',
              }}>
              {seachedEmployees.map((employee) => (
                <ListGroup.Item
                  action
                  key={employee._id}
                  className='text-capitalize'
                  onClick={() => handleSelectEmployee(employee)}>
                  {employee.firstName} {employee.lastName} - {employee.code}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          {Object.keys(selectedEmployee).length !== 0 && (
            <Form onSubmit={handleSubmit}>
              {error && <div className='text-danger'>{error}</div>}
              <Row className='mb-3'>
                <Col>
                  <Form.Control
                    type='text'
                    placeholder='First name'
                    readOnly
                    value={firstName}
                  />
                </Col>
                <Col>
                  <Form.Control
                    type='text'
                    placeholder='Last name'
                    readOnly
                    value={lastName}
                  />
                </Col>
              </Row>
              <Form.Group className='mb-3'>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}>
                  <option value='salary'>Salary</option>
                  <option value='credit'>Credit</option>
                  <option value='benefit'>Benefit</option>
                  <option value='shortage'>Shortage</option>
                  <option value='allowance'>Housing . A</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type='date'
                  value={date}
                  required
                  onChange={(e) => setDate(e.target.value)}
                />
              </Form.Group>
              {(status === 'benefit' ||
                status === 'credit' ||
                status === 'shortage' ||
                status === 'allowance') && (
                <Form.Group className='mb-3'>
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    type='number'
                    placeholder='amount'
                    value={amount}
                    required
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </Form.Group>
              )}
              {status === 'salary' ? (
                <>
                  {creditOwed > 0 ? (
                    <Row>
                      <Col>
                        <Form.Group className='mb-3'>
                          <Form.Label>Credit</Form.Label>
                          <Form.Control
                            type='number'
                            readOnly
                            value={creditOwed}
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className='mb-3'>
                          <Form.Label>Credit Balance</Form.Label>
                          <Form.Control
                            type='number'
                            readOnly
                            value={creditOwed - deduction}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  ) : null}
                  <Row>
                    <Col>
                      <Form.Label>Dates Worked</Form.Label>
                      <Form.Group className='mb-3'>
                        <DatePicker
                          multiple
                          value={datesWorked}
                          onChange={(selectedDates) => {
                            setDatesWorked(selectedDates);
                            setDays(selectedDates.length);
                          }}
                          format='YYYY/MM/DD'
                          inputClass='form-control'
                          className='bg-gray'
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className='mb-3'>
                        <Form.Label>Salary</Form.Label>
                        <Form.Control
                          type='number'
                          placeholder='salary'
                          readOnly
                          value={salary}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group className='mb-3'>
                        <Form.Label>Days</Form.Label>
                        <Form.Control
                          type='number'
                          placeholder='Days'
                          value={days}
                          readOnly
                          required
                          onChange={(e) => setDays(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className='mb-3'>
                        <Form.Label>Days &times; Salary</Form.Label>
                        <Form.Control
                          type='text'
                          readOnly
                          value={salary * days}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group className='mb-3'>
                        <Form.Label>Deduction</Form.Label>
                        <Form.Control
                          type='number'
                          placeholder='Deduction'
                          value={deduction}
                          max={salary * days}
                          onChange={(e) => setDeduction(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Label>Final Total</Form.Label>
                      <Form.Group className='mb-3'>
                        <Form.Control
                          type='text'
                          readOnly
                          value={salary * days - deduction}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </>
              ) : status === 'shortage' ? (
                <Form.Group className='mb-3'>
                  <Form.Label>Comment</Form.Label>
                  <Form.Control
                    as='textarea'
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </Form.Group>
              ) : status === 'allowance' ? (
                <Row>
                  <Col>
                    <Form.Label>Months</Form.Label>
                    <Form.Group className='mb-3'>
                      <DatePicker
                        multiple
                        onlyMonthPicker
                        format='YYYY/MM/DD'
                        inputClass='form-control'
                        value={months}
                        onChange={(selectedDates) => {
                          setMonths(selectedDates);
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              ) : null}
              <Button variant='primary' type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default RegisterSalaryModal;
