import { useCallback, useEffect, useState } from 'react';
import apiCall from '../../helpers/apiCall';
import { useParams } from 'react-router-dom';

import { REGISTER_URL } from '../../helpers/variables';
import { Container, Tab, Table, Tabs } from 'react-bootstrap';

function RegisterDetails() {
  useEffect(() => {
    document.title = 'Yussman  - Register - Details';
  }, []);
  const [shift, setShift] = useState({});

  const [local, setLocal] = useState([]);
  const [outside, setOutside] = useState([]);
  const [mearaj, setMearaj] = useState([]);
  const [ilyas, setIlyas] = useState([]);
  const [chansa, setChansa] = useState([]);

  const [totalLocal, setTotalLocal] = useState(0);
  const [totalOutside, setTotalOutside] = useState(0);
  const [totalMearaj, setTotalMearaj] = useState(0);
  const [totalIlyas, setTotalIlyas] = useState(0);
  const [totalChansa, setTotalChansa] = useState(0);

  const [totalProfit, setTotalProfit] = useState(0);

  const { id } = useParams();

  const getShift = useCallback(() => {
    apiCall
      .get(`${REGISTER_URL}/${id}`)
      .then((res) => {
        setShift(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  let totalBought = 0;
  let totalExpense = 0;
  if (Object.keys(shift).length > 0) {
    totalBought = shift.stock.reduce(
      (sum, product) => sum + product.priceBought,
      0,
    );
    totalExpense = shift.expense.reduce((sum, item) => sum + item.amount, 0);
  }

  useEffect(() => {
    getShift();
  }, [getShift]);

  useEffect(() => {
    if (Object.keys(shift).length !== 0) {
      const local = shift.stock.filter((item) => item.section === 'local');
      const outside = shift.stock.filter((item) => item.section === 'outside');
      const mearaj = shift.stock.filter((item) => item.section === 'mearaj');
      const ilyas = shift.stock.filter((item) => item.section === 'ilyas');
      const chansa = shift.stock.filter((item) => item.section === 'chansa');

      setLocal(local);
      setOutside(outside);
      setMearaj(mearaj);
      setIlyas(ilyas);
      setChansa(chansa);

      const localTotal = local.reduce(
        (total, stock) => total + stock.priceBought,
        0,
      );

      const outsideTotal = outside.reduce(
        (total, stock) => total + stock.priceBought,
        0,
      );

      const mearajTotal = mearaj.reduce(
        (total, stock) => total + stock.priceBought,
        0,
      );

      const ilyasTotal = ilyas.reduce(
        (total, stock) => total + stock.priceBought,
        0,
      );

      const chansaTotal = chansa.reduce(
        (total, stock) => total + stock.priceBought,
        0,
      );

      setTotalLocal(localTotal);
      setTotalOutside(outsideTotal);
      setTotalMearaj(mearajTotal);
      setTotalIlyas(ilyasTotal);
      setTotalChansa(chansaTotal);

      const totalProfit = shift.stock.reduce(
        (total, stock) =>
          total + (stock.quantity * stock.unitPrice - stock.priceBought),
        0,
      );

      setTotalProfit(totalProfit);
    }
  }, [shift]);

  return (
    <Container fluid='xxl' className='my-3'>
      {Object.keys(shift).length > 0 && (
        <>
          <div className='d-flex justify-content-between text-capitalize'>
            <h5>Date : {shift.date}</h5>
            <h5>Name : {shift.name}</h5>
            <h5>Accountant : {shift.accountant}</h5>
            <h5>Cash : K{shift.cash.toLocaleString()}</h5>
            <h5> Change : K{shift.change.toLocaleString()}</h5>
          </div>
          <hr />
          <div className='d-flex justify-content-center gap-5  text-capitalize'>
            <h5>Total Bought : K{totalBought.toLocaleString()}</h5>
            <h5>Total Expense : K{totalExpense.toLocaleString()}</h5>
          </div>
          <hr />
          <div>
            <p
              className={
                totalBought + totalExpense - shift.cash + shift.change < 0
                  ? 'text-danger display-6 text-center'
                  : 'display-6 text-center'
              }>
              Result : K
              {(
                totalBought +
                totalExpense -
                shift.cash +
                shift.change
              ).toLocaleString()}
            </p>
            <p className='text-center'>
              Faido : K{totalProfit.toLocaleString()}
            </p>
          </div>
          <Tabs justify>
            <Tab eventKey='stock' title='Stock'>
              <Table
                responsive
                size='sm'
                bordered
                className=' text-capitalize text-center mt-2'>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Price Bought</th>
                    <th>Unit Price</th>
                    <th>Price Sold</th>
                    <th>Profit</th>
                    <th>From</th>
                  </tr>
                </thead>
                {local.length > 0 && (
                  <tbody className='table-group-divider'>
                    {local?.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>{item.code}</td>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>K{item.priceBought.toLocaleString()}</td>
                        <td>K{item.unitPrice}</td>
                        <td>
                          K{(item.quantity * item.unitPrice).toLocaleString()}
                        </td>

                        <td
                          className={
                            item.quantity * item.unitPrice - item.priceBought <
                            0
                              ? 'text-danger'
                              : ''
                          }>
                          K
                          {(
                            item.quantity * item.unitPrice -
                            item.priceBought
                          ).toLocaleString()}
                        </td>
                        <td
                          className={
                            ((item.quantity * item.unitPrice -
                              item.priceBought) /
                              item.priceBought) *
                              100 <
                            30
                              ? 'text-danger'
                              : ''
                          }>
                          {(
                            ((item.quantity * item.unitPrice -
                              item.priceBought) /
                              item.priceBought) *
                            100
                          ).toFixed(2)}
                          %
                        </td>
                        <td>{item.section}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={4}>Total</td>
                      <td>K{totalLocal.toLocaleString()}</td>
                      <td colSpan={5}></td>
                    </tr>
                  </tbody>
                )}
                {outside.length > 0 && (
                  <tbody className='table-group-divider'>
                    {outside?.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>{item.code}</td>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>K{item.priceBought.toLocaleString()}</td>
                        <td>K{item.unitPrice}</td>
                        <td>
                          K{(item.quantity * item.unitPrice).toLocaleString()}
                        </td>

                        <td
                          className={
                            item.quantity * item.unitPrice - item.priceBought <
                            0
                              ? 'text-danger'
                              : ''
                          }>
                          K
                          {(
                            item.quantity * item.unitPrice -
                            item.priceBought
                          ).toLocaleString()}
                        </td>
                        <td
                          className={
                            ((item.quantity * item.unitPrice -
                              item.priceBought) /
                              item.priceBought) *
                              100 <
                            30
                              ? 'text-danger'
                              : ''
                          }>
                          {(
                            ((item.quantity * item.unitPrice -
                              item.priceBought) /
                              item.priceBought) *
                            100
                          ).toFixed(2)}
                          %
                        </td>

                        <td>{item.section}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={4}>Total</td>
                      <td>K{totalOutside.toLocaleString()}</td>
                      <td colSpan={5}></td>
                    </tr>
                  </tbody>
                )}
                {mearaj.length > 0 && (
                  <tbody className='table-group-divider'>
                    {mearaj?.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>{item.code}</td>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>K{item.priceBought.toLocaleString()}</td>
                        <td>K{item.unitPrice}</td>
                        <td>
                          K{(item.quantity * item.unitPrice).toLocaleString()}
                        </td>

                        <td
                          className={
                            item.quantity * item.unitPrice - item.priceBought <
                            0
                              ? 'text-danger'
                              : ''
                          }>
                          K
                          {(
                            item.quantity * item.unitPrice -
                            item.priceBought
                          ).toLocaleString()}
                        </td>
                        <td
                          className={
                            ((item.quantity * item.unitPrice -
                              item.priceBought) /
                              item.priceBought) *
                              100 <
                            30
                              ? 'text-danger'
                              : ''
                          }>
                          {(
                            ((item.quantity * item.unitPrice -
                              item.priceBought) /
                              item.priceBought) *
                            100
                          ).toFixed(2)}
                          %
                        </td>

                        <td>{item.section}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={4}>Total</td>
                      <td>K{totalMearaj.toLocaleString()}</td>
                      <td colSpan={5}></td>
                    </tr>
                  </tbody>
                )}
                {ilyas.length > 0 && (
                  <tbody className='table-group-divider'>
                    {ilyas?.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>{item.code}</td>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>K{item.priceBought.toLocaleString()}</td>
                        <td>K{item.unitPrice}</td>
                        <td>
                          K{(item.quantity * item.unitPrice).toLocaleString()}
                        </td>

                        <td
                          className={
                            item.quantity * item.unitPrice - item.priceBought <
                            0
                              ? 'text-danger'
                              : ''
                          }>
                          K
                          {(
                            item.quantity * item.unitPrice -
                            item.priceBought
                          ).toLocaleString()}
                        </td>
                        <td
                          className={
                            ((item.quantity * item.unitPrice -
                              item.priceBought) /
                              item.priceBought) *
                              100 <
                            30
                              ? 'text-danger'
                              : ''
                          }>
                          {(
                            ((item.quantity * item.unitPrice -
                              item.priceBought) /
                              item.priceBought) *
                            100
                          ).toFixed(2)}
                          %
                        </td>

                        <td>{item.section}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={4}>Total</td>
                      <td>K{totalIlyas.toLocaleString()}</td>
                      <td colSpan={5}></td>
                    </tr>
                  </tbody>
                )}
                {chansa.length > 0 && (
                  <tbody className='table-group-divider'>
                    {chansa?.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>{item.code}</td>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>K{item.priceBought.toLocaleString()}</td>
                        <td>K{item.unitPrice}</td>
                        <td>
                          K{(item.quantity * item.unitPrice).toLocaleString()}
                        </td>

                        <td
                          className={
                            item.quantity * item.unitPrice - item.priceBought <
                            0
                              ? 'text-danger'
                              : ''
                          }>
                          K
                          {(
                            item.quantity * item.unitPrice -
                            item.priceBought
                          ).toLocaleString()}
                        </td>
                        <td
                          className={
                            ((item.quantity * item.unitPrice -
                              item.priceBought) /
                              item.priceBought) *
                              100 <
                            30
                              ? 'text-danger'
                              : ''
                          }>
                          {(
                            ((item.quantity * item.unitPrice -
                              item.priceBought) /
                              item.priceBought) *
                            100
                          ).toFixed(2)}
                          %
                        </td>

                        <td>{item.section}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={4}>Total</td>
                      <td>K{totalChansa.toLocaleString()}</td>
                      <td colSpan={5}></td>
                    </tr>
                  </tbody>
                )}
              </Table>
            </Tab>
            <Tab eventKey='expense' title='Expenses'>
              <Table
                responsive
                size='sm'
                bordered
                className='text-capitalize text-center mt-2 '>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Decription</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody className='table-group-divider'>
                  {shift.expense?.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td>{item.description}</td>
                      <td>K{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>
          </Tabs>
        </>
      )}
    </Container>
  );
}

export default RegisterDetails;
