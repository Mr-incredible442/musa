import { useContext, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import apiCall from '../../helpers/apiCall';

import { Container } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import EditStock from './modals/EditStock';

import { RESTAURANT_LOCAL_URL } from '../../helpers/variables';
import { AuthContext } from '../../context/AuthContext';

const Details = () => {
  const [shift, setShift] = useState({});
  const [updatedStock, setUpdatedStock] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [food, setFood] = useState([]);
  const [bakery, setBakery] = useState([]);
  const [result, setResult] = useState([]);

  const [received, setReceived] = useState([]);

  const { id } = useParams();
  const { user } = useContext(AuthContext);

  let totalCollectedAmount = 0;
  let totalSales = 0;
  if (Object.keys(shift).length > 0) {
    totalCollectedAmount = shift.bus
      .filter((bus) => bus.status === 'collected')
      .reduce((total, bus) => total + bus.amount, 0);

    const calculateTotalSales = (stock) => {
      return (
        (stock.ostock + stock.received - stock.damage - stock.cstock) *
        stock.price
      );
    };

    totalSales = updatedStock.stock.reduce((total, stock) => {
      return total + calculateTotalSales(stock);
    }, 0);
  }

  useEffect(() => {
    document.title = 'Yussman  - Restaurant - Details';
  }, []);

  const getShift = useCallback(() => {
    apiCall
      .get(`${RESTAURANT_LOCAL_URL}/${id}`)
      .then((res) => {
        setShift(res.data);
        sumReceivedAmounts(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  useEffect(() => {
    getShift();
  }, [getShift]);

  useEffect(() => {
    if (Object.keys(shift).length > 0) {
      setResult(
        shift.cash.reduce((a, b) => a + b, 0) +
          totalCollectedAmount +
          shift.credit.reduce((total, credit) => total + credit.amount, 0) -
          shift.change.reduce((a, b) => a + b, 0) -
          totalSales,
      );
      setReceived(shift.received);
    }
  }, [shift, totalCollectedAmount, totalSales]);

  const sumReceivedAmounts = (data) => {
    if (data !== null) {
      const receivedMap = {};
      if (data.received && Array.isArray(data.received)) {
        data.received.forEach((transaction) => {
          const code = transaction.code;
          const amount = transaction.amount;
          if (receivedMap[code] === undefined) {
            receivedMap[code] = amount;
          } else {
            receivedMap[code] += amount;
          }
        });
      }
      const updatedData = {
        ...data,
        stock: data.stock.map((prod) => {
          const code = prod.code;
          if (receivedMap[code] !== undefined) {
            return {
              ...prod,
              received: receivedMap[code],
            };
          }
          return prod;
        }),
      };

      updatedData.stock.sort((a, b) => a.name.localeCompare(b.name));
      setUpdatedStock(updatedData);
    }
  };

  useEffect(() => {
    if (Object.keys(shift).length !== 0) {
      const drinks = updatedStock.stock.filter(
        (item) => item.section === 'drinks',
      );
      const food = updatedStock.stock.filter((item) => item.section === 'food');
      const bakery = updatedStock.stock.filter(
        (item) => item.section === 'bakery',
      );

      setDrinks(drinks);
      setFood(food);
      setBakery(bakery);
    }
  }, [updatedStock, shift]);

  const formatNumberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  if (Object.keys(shift).length === 0) return null;

  return (
    <Container fluid='xxl'>
      <div className='d-flex justify-content-between mt-3 mx-3 text-capitalize'>
        <p>Date : {shift.date}</p>
        <p>Shift : {shift.shift}</p>
        <div className='d-flex'>
          <p>Cashiers : </p>
          {shift.cashier.map((cashier) => (
            <p className='mx-2 ' key={Math.floor(Math.random() * 10_000)}>
              {cashier}
            </p>
          ))}
        </div>
        <p>Accountant : {shift.acountant}</p>
      </div>
      <hr />
      <div className='d-flex justify-content-between mx-3'>
        <p>
          Cash : K
          {formatNumberWithCommas(
            shift.cash.reduce((sum, transaction) => sum + transaction, 0),
          )}
        </p>
        <p>
          Change : K
          {formatNumberWithCommas(
            shift.change.reduce((sum, transaction) => sum + transaction, 0),
          )}
        </p>
        <p>Bus : K{formatNumberWithCommas(totalCollectedAmount)}</p>
        <p>
          Credit : K
          {formatNumberWithCommas(
            shift.credit.reduce(
              (sum, transaction) => sum + transaction.amount,
              0,
            ),
          )}
        </p>
        <p>Sales : K{formatNumberWithCommas(totalSales)}</p>
      </div>
      <hr />
      <div>
        <p className='display-6 text-center '>
          Result : K
          <span className={result < 0 ? 'text-danger' : ''}>
            {formatNumberWithCommas(result)}
          </span>
        </p>
      </div>
      <hr />
      <Tabs justify>
        <Tab eventKey='stock' title='Stock'>
          <Table responsive className='text-center mt-3' bordered size='sm'>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Price</th>
                <th>O.Stock</th>
                <th>Received</th>
                <th>Damage</th>
                <th>C.Stock</th>
                <th>Total</th>
                {user && user.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody className='table-group-divider'>
              {drinks.map((stock) => (
                <tr key={stock.code} id={stock.code}>
                  <td>{stock.code}</td>
                  <td>{stock.name}</td>
                  <td>K{stock.price}</td>
                  <td>{stock.ostock}</td>
                  <td className={stock.received > 0 ? 'text-info' : ''}>
                    {stock.received}
                  </td>
                  <td>{stock.damage}</td>
                  <td className={stock.cstock < 0 ? 'text-danger' : ''}>
                    {stock.cstock}
                  </td>
                  <td
                    className={
                      stock.ostock +
                        stock.received -
                        stock.damage -
                        stock.cstock <
                      0
                        ? 'text-danger'
                        : ''
                    }>
                    K
                    {formatNumberWithCommas(
                      (stock.ostock +
                        stock.received -
                        stock.damage -
                        stock.cstock) *
                        stock.price,
                    )}
                  </td>
                  {user && user.role === 'admin' && (
                    <td className='d-flex justify-content-center align-items-center'>
                      <EditStock id={id} stock={stock} getShift={getShift} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tbody className='table-group-divider'>
              {food.map((stock) => (
                <tr key={stock.code} id={stock.code}>
                  <td>{stock.code}</td>
                  <td>{stock.name}</td>
                  <td>K{stock.price}</td>
                  <td>{stock.ostock}</td>
                  <td className={stock.received > 0 ? 'text-info' : ''}>
                    {stock.received}
                  </td>
                  <td>{stock.damage}</td>
                  <td className={stock.cstock < 0 ? 'text-danger' : ''}>
                    {stock.cstock}
                  </td>
                  <td
                    className={
                      stock.ostock +
                        stock.received -
                        stock.damage -
                        stock.cstock <
                      0
                        ? 'text-danger'
                        : ''
                    }>
                    K
                    {formatNumberWithCommas(
                      (stock.ostock +
                        stock.received -
                        stock.damage -
                        stock.cstock) *
                        stock.price,
                    )}
                  </td>
                  {user && user.role === 'admin' && (
                    <td className='d-flex justify-content-center align-items-center'>
                      <EditStock id={id} stock={stock} getShift={getShift} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tbody className='table-group-divider'>
              {bakery.map((stock) => (
                <tr key={stock.code} id={stock.code}>
                  <td>{stock.code}</td>
                  <td>{stock.name}</td>
                  <td>K{stock.price}</td>
                  <td>{stock.ostock}</td>
                  <td className={stock.received > 0 ? 'text-info' : ''}>
                    {stock.received}
                  </td>
                  <td>{stock.damage}</td>
                  <td className={stock.cstock < 0 ? 'text-danger' : ''}>
                    {stock.cstock}
                  </td>
                  <td
                    className={
                      stock.ostock +
                        stock.received -
                        stock.damage -
                        stock.cstock <
                      0
                        ? 'text-danger'
                        : ''
                    }>
                    K
                    {formatNumberWithCommas(
                      (stock.ostock +
                        stock.received -
                        stock.damage -
                        stock.cstock) *
                        stock.price,
                    )}
                  </td>
                  {user && user.role === 'admin' && (
                    <td className='d-flex justify-content-center align-items-center'>
                      <EditStock id={id} stock={stock} getShift={getShift} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
        <Tab eventKey='received' title='Received'>
          <Table responsive className='text-center mt-3' size='sm'>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody className='table-group-divider'>
              {received.map((received) => (
                <tr key={received._id} id={received._id}>
                  <td>{received.code}</td>
                  <td className='text-capitalize'>{received.name}</td>
                  <td>{received.amount}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
        <Tab eventKey='busses' title='Busses'>
          <Row>
            <Col>
              <h3 className='text-center'>Busses</h3>
              <Table responsive className='text-center mt-3' size='sm'>
                <thead>
                  <tr>
                    <th>Bus Name</th>
                    <th>Driver</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody className='table-group-divider'>
                  {shift.bus.map((bus) => (
                    <tr key={bus._id}>
                      <td>{bus.name}</td>
                      <td>{bus.driver}</td>
                      <td>{bus.status}</td>
                      <td>K{bus.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
            <Col>
              <h3 className='text-center'>Topup</h3>
              <Table responsive className='text-center' size='sm'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody className='table-group-divider'>
                  {shift.topup.map((topup) => (
                    <tr key={topup._id}>
                      <td>{topup.name}</td>
                      <td>K{topup.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Tab>
        <Tab eventKey='credit' title='Credit'>
          <Table responsive className='text-center' size='sm'>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody className='table-group-divider'>
              {shift.credit.map((credit) => (
                <tr
                  key={Math.floor(Math.random() * 100_000)}
                  id={Math.floor(Math.random() * 100_000)}>
                  <td className='text-capitalize'>{credit.description}</td>
                  <td>K{credit.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Details;
