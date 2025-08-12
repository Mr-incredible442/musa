import { useEffect, useState, useContext } from 'react';

import { Button, Container, Table } from 'react-bootstrap';

import NewEmployeeModal from './modals/NewEmployeeModal';

import { EmployeeContext } from '../../context/EmployeeContext';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

function EmployeeList() {
  const [employeesList, setEmployeesList] = useState([]);

  const { employees } = useContext(EmployeeContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    setEmployeesList(employees);
  }, [employees]);

  if (employeesList === null) return;

  return (
    <Container>
      {user && user.role === 'admin' && (
        <div className='d-flex justify-content-center align-items-center mt-3'>
          <NewEmployeeModal />
        </div>
      )}

      <Table responsive className='my-3 text-center text-capitalize'>
        <thead>
          <tr>
            <th>Code</th>
            <th>NRC</th>
            <th>Phone</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Salary</th>
            <th>Credit</th>
            <th>Status</th>
            <th>Section</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className='table-group-divider'>
          {employeesList &&
            employeesList.length > 0 &&
            employeesList
              .sort((a, b) =>
                a.status === 'inactive' ? 1 : b.status === 'inactive' ? -1 : 0,
              )
              .map((employee) => {
                return (
                  <tr
                    key={employee._id}
                    className={
                      employee.status === 'inactive'
                        ? 'border border-3 border-secondary-subtle text-decoration-line-through text-muted'
                        : ''
                    }>
                    <td>{employee.code}</td>
                    <td>{employee.nrc}</td>
                    <td>{employee.number}</td>
                    <td>{employee.firstName}</td>
                    <td>{employee.lastName}</td>
                    <td>
                      K
                      {(employee.dailySalary !== null &&
                      employee.dailySalary !== undefined
                        ? employee.dailySalary.toFixed(2)
                        : '0.00'
                      ).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </td>
                    <td
                      className={`border-2 ${
                        employee.creditOwed > 0
                          ? 'border border-3 border-info-subtle'
                          : employee.creditOwed < 0
                          ? 'text-danger'
                          : ''
                      }`}>
                      K
                      {(employee.creditOwed !== null &&
                      employee.creditOwed !== undefined
                        ? employee.creditOwed.toFixed(2)
                        : '0.00'
                      ).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </td>
                    <td>{employee.status}</td>
                    <td>{employee.section}</td>
                    <td className='d-flex justify-content-center'>
                      <Link
                        to={`/employees/${employee._id}`}
                        style={{ textDecoration: 'none' }}>
                        <Button variant='outline-primary me-1' size='sm'>
                          V
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </Table>
    </Container>
  );
}

export default EmployeeList;
