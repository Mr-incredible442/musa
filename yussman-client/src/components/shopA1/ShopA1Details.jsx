import { useContext, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import apiCall from '../../helpers/apiCall';

import { Container } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import EditStock from './modals/EditStock';

import { SHOPA1_URL } from '../../helpers/variables';
import { AuthContext } from '../../context/AuthContext';

const ShopA1Details = () => {
  const [shift, setShift] = useState({});
  const [updatedStock, setUpdatedStock] = useState([]);
  const [result, setResult] = useState([]);

  const [received, setReceived] = useState([]);

  const { id } = useParams();
  const { user } = useContext(AuthContext);

  let totalSales = 0;
  if (shift !== null && shift !== undefined && Object.keys(shift).length > 0) {
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
    document.title = 'Yussman  - Shop A1 - Details';
  }, []);

  const getShift = useCallback(() => {
    apiCall
      .get(`${SHOPA1_URL}/${id}`)
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
    if (
      shift !== null &&
      shift !== undefined &&
      Object.keys(shift).length > 0
    ) {
      setResult(
        (
          shift.cash.reduce((a, b) => a + b, 0) +
          shift.credit.reduce((total, credit) => total + credit.amount, 0) -
          totalSales
        ).toFixed(2),
      );
      setReceived(shift.received);
    }
  }, [shift, totalSales]);

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

  const formatNumberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  if (shift !== null && shift !== undefined && Object.keys(shift).length === 0)
    return null;

  return (
    <Container fluid='xxl'>
      <div className='d-flex justify-content-between mt-3 mx-3'>
        <p>Date In: {shift.dateIn}</p>
        <p>Date Out : {shift.dateOut}</p>
        <div className='d-flex'>
          <p>Cashier : </p>
          {shift.cashier.map((cashier) => (
            <p className='mx-2' key={Math.floor(Math.random() * 10_000)}>
              {cashier}
            </p>
          ))}
        </div>
        <p>Accountant : {shift.acountant}</p>
        <p>Checked By : {shift.checkedBy}</p>
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
          <span className={Number(result) < 0 ? 'text-danger' : ''}>
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
              {updatedStock.stock.map((stock) => (
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
                      (
                        (stock.ostock +
                          stock.received -
                          stock.damage -
                          stock.cstock) *
                        stock.price
                      ).toFixed(2),
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
      </Tabs>
    </Container>
  );
};

export default ShopA1Details;
