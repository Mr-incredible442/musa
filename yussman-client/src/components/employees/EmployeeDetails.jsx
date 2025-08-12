import { Button, Col, Container, Row, Table } from 'react-bootstrap';

import apiCall from '../../helpers/apiCall';

import { Link, useParams } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';

import { EMPLOYEE_URL } from '../../helpers/variables';
import EditEmployeeModal from './modals/EditEmployeeModal';
import SuspendEmployeeModal from './modals/SuspendEmployeeModal';
import SignEmployeeContract from './modals/SignEmployeeContract';

import { AuthContext } from '../../context/AuthContext';

function EmployeeDetails() {
  const [employee, setEmployee] = useState({});
  const [prevTransactions, setPrevTransactions] = useState(null);

  const { id } = useParams();

  const { user } = useContext(AuthContext);

  useEffect(() => {
    apiCall
      .get(`${EMPLOYEE_URL}/getemployee/${id}`)
      .then((res) => {
        setEmployee(res.data.employee);
      })

      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  useEffect(() => {
    if (!employee.transactions || employee.transactions === prevTransactions)
      return;

    const credit = employee.transactions
      .filter((transaction) => transaction.status === 'credit')
      .reduce((total, current) => total + current.amount, 0);

    const shortage = employee.transactions
      .filter((transaction) => transaction.status === 'shortage')
      .reduce((total, current) => total + current.amount, 0);

    const deductions = employee.transactions
      .filter((transaction) => transaction.status === 'salary')
      .reduce((total, current) => total + current.deduction, 0);

    setEmployee((prevEmployee) => ({
      ...prevEmployee,
      creditOwed: credit + shortage - deductions,
    }));

    setPrevTransactions(employee.transactions);
  }, [employee.transactions, prevTransactions]);

  const getLastBenefitDate = () => {
    if (!employee.transactions) return '';

    const benefitTransactions = employee.transactions.filter(
      (transaction) => transaction.status === 'benefit',
    );

    if (benefitTransactions.length > 0) {
      const lastBenefitTransaction = benefitTransactions.reduce(
        (prev, current) =>
          new Date(prev.date) > new Date(current.date) ? prev : current,
      );

      return lastBenefitTransaction.date;
    } else {
      return '';
    }
  };

  return (
    <Container>
      <div className='d-flex justify-content-evenly  mt-3'>
        <Link to='/employees'>
          <Button variant='outline-primary'>Go Back</Button>
        </Link>
        {user && user.role === 'admin' && (
          <>
            <EditEmployeeModal employee={employee} />
            {employee.status === 'active' && employee.contract ? (
              <SignEmployeeContract employee={employee} />
            ) : (
              ''
            )}
            <SuspendEmployeeModal employee={employee} />
          </>
        )}
      </div>
      <Row className='text-capitalize'>
        <Col className='border my-3 me-2 p-3' xs={4}>
          <Row xs={2}>
            <Col className='border-bottom'>
              <h6>Code </h6>
            </Col>
            <Col className='border-bottom border-start '>
              <h6>{employee.code}</h6>
            </Col>
          </Row>
          <Row xs={2}>
            <Col className='border-bottom'>
              <h6>NRC</h6>
            </Col>
            <Col className='border-bottom border-start '>
              <h6>{employee.nrc}</h6>
            </Col>
          </Row>
          <Row xs={2}>
            <Col className='border-bottom'>
              <h6>Full Name</h6>
            </Col>
            <Col className='border-bottom border-start '>
              <h6>{employee.firstName + ' ' + employee.lastName}</h6>
            </Col>
          </Row>
          <Row xs={2}>
            <Col className='border-bottom'>
              <h6>Number</h6>
            </Col>
            <Col className='border-bottom border-start '>
              <h6>{employee.number}</h6>
            </Col>
          </Row>
          <Row xs={2}>
            <Col className='border-bottom'>
              <h6>Salary</h6>
            </Col>
            <Col className='border-bottom border-start '>
              <h6>K{employee.dailySalary}</h6>
            </Col>
          </Row>
          <Row xs={2}>
            <Col className='border-bottom'>
              <h6>Credit</h6>
            </Col>
            <Col className='border-bottom border-start '>
              <h6>K{employee.creditOwed}</h6>
            </Col>
          </Row>
          <Row xs={2}>
            <Col className='border-bottom'>
              <h6>Contract</h6>
            </Col>
            <Col className='border-bottom border-start '>
              <h6>{employee.contract === 'true' ? 'Yes' : 'No'}</h6>
            </Col>
          </Row>
          {employee.contract === 'true' && (
            <>
              <Row xs={2}>
                <Col className='border-bottom'>
                  <h6>Contract Start</h6>
                </Col>
                <Col className='border-bottom border-start '>
                  <h6>{employee.contractStart}</h6>
                </Col>
              </Row>
              <Row xs={2}>
                <Col className='border-bottom'>
                  <h6>Contract End</h6>
                </Col>
                <Col className='border-bottom border-start '>
                  <h6>{employee.contractEnd}</h6>
                </Col>
              </Row>
            </>
          )}
          {getLastBenefitDate() !== '' && (
            <Row xs={2}>
              <Col className='border-bottom'>
                <h6>Benefit Collected on</h6>
              </Col>
              <Col className='border-bottom border-start '>
                <h6>{getLastBenefitDate()}</h6>
              </Col>
            </Row>
          )}
          <Row xs={2}>
            <Col className='border-bottom'>
              <h6>Full Time</h6>
            </Col>
            <Col className='border-bottom border-start'>
              <h6>{employee.fullTime === true ? 'Yes' : 'No'}</h6>
            </Col>
          </Row>
          {employee.section && employee.section !== '' && (
            <Row xs={2}>
              <Col>
                <h6>Section</h6>
              </Col>
              <Col className='border-start '>
                <h6>{employee.section}</h6>
              </Col>
            </Row>
          )}
        </Col>
        <Col className='border my-3 me-2 p-2'>
          <Table responsive size='sm text-center'>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Deducted</th>
                <th>Collected</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {employee.transactions &&
                employee.transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{transaction.date}</td>
                    {(transaction.status === 'credit') |
                    (transaction.status === 'benefit') |
                    (transaction.status === 'shortage') |
                    (transaction.status === 'allowance') ? (
                      <>
                        <td></td>
                        <td></td>
                        <td>K{transaction.amount}</td>
                      </>
                    ) : (
                      <>
                        <td>
                          K
                          {(transaction.days * transaction.dailySalary).toFixed(
                            2,
                          )}
                        </td>
                        <td>K{transaction.deduction}</td>
                        <td>
                          K
                          {(
                            transaction.days * transaction.dailySalary -
                            transaction.deduction
                          ).toFixed(2)}
                        </td>
                      </>
                    )}
                    <td>{transaction.status}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default EmployeeDetails;
