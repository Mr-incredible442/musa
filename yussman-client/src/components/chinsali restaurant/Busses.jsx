import Table from 'react-bootstrap/Table';
import { Container } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
// import Form from 'react-bootstrap/Form';

import { useContext, useEffect, useState } from 'react';
import { ChinsaliRestaurantContext } from '../../context/ChinsaliRestaurantContext';

import BusModal from './modals/BusModal';
import TopupModal from './modals/TopupModal';
import Delete from './modals/Delete';

const endpoint = `deletebus`;
const endpoint2 = `deletetopup`;

function Busses() {
  const [bus, setBus] = useState([]);
  const [topup, setTopup] = useState([]);
  const { shift } = useContext(ChinsaliRestaurantContext);

  useEffect(() => {
    if (Object.keys(shift).length !== 0) {
      setBus(shift.bus);
    }
  }, [shift]);
  useEffect(() => {
    if (Object.keys(shift).length !== 0) {
      setTopup(shift.topup);
    }
  }, [shift]);

  return (
    <Container>
      <Row>
        <Col>
          <div className='d-flex justify-content-between p-2'>
            <h5>Busses</h5>
            <h5>
              C Total: K{' '}
              {bus.reduce(
                (total, item) =>
                  item.status === 'collected' ? total + item.amount : total,
                0,
              )}
            </h5>
            <h5>
              Not C Total: K{' '}
              {bus.reduce(
                (total, item) =>
                  item.status === 'not collected' ? total + item.amount : total,
                0,
              )}
            </h5>
            <BusModal id={shift._id} />
          </div>
          <Table responsive className='text-center' bordered size='sm'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Driver</th>
                <th>Status</th>
                <th>Amount</th>
                <th>A</th>
              </tr>
            </thead>
            <tbody className='table-group-divider'>
              {bus.map((bus) => (
                <tr
                  key={Math.floor(Math.random() * 100_000)}
                  id={Math.floor(Math.random() * 100_000)}>
                  <td className='text-capitalize'>{bus.name}</td>
                  <td className='text-capitalize'>{bus.driver}</td>
                  <td className='text-capitalize'>{bus.status}</td>
                  <td>K{bus.amount}</td>
                  <td className='d-flex justify-content-center align-items-center '>
                    <Delete
                      endpoint={endpoint}
                      id={bus._id}
                      shiftId={shift._id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
        <Col>
          <div className='d-flex justify-content-between p-2'>
            <h5>Topup</h5>
            <h5>Total: K {topup.reduce((a, b) => a + b.amount, 0)}</h5>
            <TopupModal id={shift._id} />
          </div>
          <Table responsive className='text-center' bordered size='sm'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>A</th>
              </tr>
            </thead>
            <tbody className='table-group-divider'>
              {topup.map((topup) => (
                <tr
                  key={Math.floor(Math.random() * 100_000)}
                  id={Math.floor(Math.random() * 100_000)}>
                  <td className='text-capitalize'>{topup.name}</td>
                  <td>K{topup.amount}</td>
                  <td className='d-flex justify-content-center align-items-center '>
                    <Delete
                      endpoint={endpoint2}
                      id={topup._id}
                      shiftId={shift._id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default Busses;
