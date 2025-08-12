import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiCall from '../../helpers/apiCall';

import { CHANSA_STORE_URL } from '../../helpers/variables';

import { Container } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

function ShiftDetails() {
  const [shift, setShift] = useState(null);
  const [updatedStock, setUpdatedStock] = useState({});

  const [drinks, setDrinks] = useState([]);
  const [food, setFood] = useState([]);
  const [other, setOther] = useState([]);
  const [shopA1, setShopA1] = useState([]);
  const [shopA2, setShopA2] = useState([]);

  const [issued, setIssued] = useState([]);
  const [received, setReceived] = useState([]);

  const { id } = useParams();

  useEffect(() => {
    apiCall
      .get(`${CHANSA_STORE_URL}/${id}`)
      .then((res) => {
        setShift(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  useEffect(() => {
    sumReceivedAmounts(shift);
  }, [shift]);

  useEffect(() => {
    if (shift !== null) {
      setIssued(shift.issued);
      setReceived(shift.received);
    }
  }, [shift]);

  const sumReceivedAmounts = (data) => {
    if (data !== null) {
      const receivedMap = {};
      const issuedMap = {};

      if (data.received && Array.isArray(data.received)) {
        data.received.forEach((transaction) => {
          const { code, quantity } = transaction;
          receivedMap[code] = (receivedMap[code] || 0) + quantity;
        });
      }

      if (data.issued && Array.isArray(data.issued)) {
        data.issued.forEach((transaction) => {
          const { code, quantity } = transaction;
          issuedMap[code] = (issuedMap[code] || 0) + quantity;
        });
      }

      let updatedData = {
        ...data,
        stock: data.stock.map((prod) => {
          const { code, ostock, damage } = prod;
          const received = receivedMap[code] || 0;
          const issued = issuedMap[code] || 0;

          const cstock = ostock + received - damage - issued;

          return {
            ...prod,
            received,
            issued,
            cstock,
          };
        }),
      };

      updatedData.stock.sort((a, b) => a.name.localeCompare(b.name));
      setUpdatedStock(updatedData);
    }
  };

  useEffect(() => {
    if (Object.keys(updatedStock).length !== 0) {
      const drinks = updatedStock.stock.filter(
        (item) => item.section === 'drinks',
      );
      const food = updatedStock.stock.filter((item) => item.section === 'food');
      const other = updatedStock.stock.filter(
        (item) => item.section === 'other',
      );
      const shopA1 = updatedStock.stock.filter(
        (item) => item.section === 'shopa1',
      );
      const shopA2 = updatedStock.stock.filter(
        (item) => item.section === 'shopa2',
      );

      setDrinks(drinks);
      setFood(food);
      setOther(other);
      setShopA1(shopA1);
      setShopA2(shopA2);
    }
  }, [updatedStock]);

  return (
    <Container className='my-3'>
      <div className='text-capitalize d-flex justify-content-between p-3'>
        <h5 className='text-center'>Date: {shift?.date}</h5>
        <h5 className='text-center'>Accountant: {shift?.accountant}</h5>
        <h5 className='text-center'>Checked By: {shift?.checkedBy}</h5>
        <h5 className='text-center'>Keeper: {shift?.keeper}</h5>
      </div>
      <hr />
      <Tabs justify>
        <Tab eventKey='stock' title='Stock'>
          <Table responsive className='text-center text-capitalize'>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>OStock</th>
                <th>Damage</th>
                <th>Received</th>
                <th>Issued</th>
                <th>CStock</th>
              </tr>
            </thead>
            <tbody className='table-group-divider'>
              {drinks.map((item) => (
                <tr key={item._id}>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td className={item.ostock === 0 ? 'text-muted' : ''}>
                    {item.ostock.toFixed(2)}
                  </td>
                  <td
                    className={
                      item.damage === 0
                        ? 'text-muted'
                        : item.damage < 0
                        ? 'text-danger'
                        : ''
                    }>
                    {item.damage}
                  </td>
                  <td
                    className={
                      item.received > 0
                        ? 'text-info'
                        : item.received === 0
                        ? 'text-muted'
                        : ''
                    }>
                    {item.received}
                  </td>
                  <td
                    className={
                      item.issued > 0
                        ? 'text-info'
                        : item.issued === 0
                        ? 'text-muted'
                        : ''
                    }>
                    {item.issued}
                  </td>
                  <td
                    className={
                      item.cstock < 0
                        ? 'text-danger'
                        : item.cstock === 0
                        ? 'text-muted'
                        : ''
                    }>
                    {item.cstock.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tbody className='table-group-divider'>
              {food.map((item) => (
                <tr key={item._id}>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td className={item.ostock === 0 ? 'text-muted' : ''}>
                    {item.ostock.toFixed(2)}
                  </td>
                  <td
                    className={
                      item.damage === 0
                        ? 'text-muted'
                        : item.damage < 0
                        ? 'text-danger'
                        : ''
                    }>
                    {item.damage}
                  </td>
                  <td
                    className={
                      item.received > 0
                        ? 'text-info'
                        : item.received === 0
                        ? 'text-muted'
                        : ''
                    }>
                    {item.received}
                  </td>
                  <td
                    className={
                      item.issued > 0
                        ? 'text-info'
                        : item.issued === 0
                        ? 'text-muted'
                        : ''
                    }>
                    {item.issued}
                  </td>
                  <td
                    className={
                      item.cstock < 0
                        ? 'text-danger'
                        : item.cstock === 0
                        ? 'text-muted'
                        : ''
                    }>
                    {item.cstock.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tbody className='table-group-divider'>
              {other.map((item) => (
                <tr key={item._id}>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td className={item.ostock === 0 ? 'text-muted' : ''}>
                    {item.ostock.toFixed(2)}
                  </td>
                  <td
                    className={
                      item.damage === 0
                        ? 'text-muted'
                        : item.damage < 0
                        ? 'text-danger'
                        : ''
                    }>
                    {item.damage}
                  </td>
                  <td
                    className={
                      item.received > 0
                        ? 'text-info'
                        : item.received === 0
                        ? 'text-muted'
                        : ''
                    }>
                    {item.received}
                  </td>
                  <td
                    className={
                      item.issued > 0
                        ? 'text-info'
                        : item.issued === 0
                        ? 'text-muted'
                        : ''
                    }>
                    {item.issued}
                  </td>
                  <td
                    className={
                      item.cstock < 0
                        ? 'text-danger'
                        : item.cstock === 0
                        ? 'text-muted'
                        : ''
                    }>
                    {item.cstock.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tbody className='table-group-divider'>
              {shopA1.map((item) => (
                <tr key={item._id}>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td className={item.ostock === 0 ? 'text-muted' : ''}>
                    {item.ostock.toFixed(2)}
                  </td>
                  <td
                    className={
                      item.damage === 0
                        ? 'text-muted'
                        : item.damage < 0
                        ? 'text-danger'
                        : ''
                    }>
                    {item.damage}
                  </td>
                  <td
                    className={
                      item.received > 0
                        ? 'text-info'
                        : item.received === 0
                        ? 'text-muted'
                        : ''
                    }>
                    {item.received}
                  </td>
                  <td
                    className={
                      item.issued > 0
                        ? 'text-info'
                        : item.issued === 0
                        ? 'text-muted'
                        : ''
                    }>
                    {item.issued}
                  </td>
                  <td
                    className={
                      item.cstock < 0
                        ? 'text-danger'
                        : item.cstock === 0
                        ? 'text-muted'
                        : ''
                    }>
                    {item.cstock.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tbody className='table-group-divider'>
              {shopA2.map((item) => (
                <tr key={item._id}>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td className={item.ostock === 0 ? 'text-muted' : ''}>
                    {item.ostock.toFixed(2)}
                  </td>
                  <td
                    className={
                      item.damage === 0
                        ? 'text-muted'
                        : item.damage < 0
                        ? 'text-danger'
                        : ''
                    }>
                    {item.damage}
                  </td>
                  <td
                    className={
                      item.received > 0
                        ? 'text-info'
                        : item.received === 0
                        ? 'text-muted'
                        : ''
                    }>
                    {item.received}
                  </td>
                  <td
                    className={
                      item.issued > 0
                        ? 'text-info'
                        : item.issued === 0
                        ? 'text-muted'
                        : ''
                    }>
                    {item.issued}
                  </td>
                  <td
                    className={
                      item.cstock < 0
                        ? 'text-danger'
                        : item.cstock === 0
                        ? 'text-muted'
                        : ''
                    }>
                    {item.cstock.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
        <Tab eventKey='issued' title='Issued / Out'>
          <Table responsive bordered size='sm' className='text-center mt-3'>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>To</th>
              </tr>
            </thead>
            <tbody className='table-group-divider'>
              {issued.map((item) => (
                <tr key={item._id}>
                  <td>{item.code}</td>
                  <td className='text-capitalize'>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td className='text-capitalize'>{item.to}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
        <Tab eventKey='received' title='Received / In'>
          <Table responsive bordered size='sm' className='text-center'>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody className='table-group-divider'>
              {received.map((item) => (
                <tr key={item._id}>
                  <td>{item.code}</td>
                  <td className='text-capitalize'>{item.name}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>
    </Container>
  );
}

export default ShiftDetails;
