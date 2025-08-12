import { useCallback, useEffect, useState } from 'react';
import apiCall from '../../helpers/apiCall';
import { useParams } from 'react-router-dom';

import { CHINSALI_REGISTER_URL } from '../../helpers/variables';
import { Container, Tab, Table, Tabs } from 'react-bootstrap';

function RegisterDetails() {
  useEffect(() => {
    document.title = 'Yussman  - Register - Details';
  }, []);
  const [shift, setShift] = useState({});
  const { id } = useParams();

  const getShift = useCallback(() => {
    apiCall
      .get(`${CHINSALI_REGISTER_URL}/${id}`)
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

  return (
    <Container fluid className='my-3'>
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
                    {/* <th>From</th> */}
                  </tr>
                </thead>
                <tbody className='table-group-divider'>
                  {shift.stock?.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td>{item.code}</td>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>K{item.priceBought}</td>
                      <td>K{item.unitPrice}</td>
                      <td>K{item.quantity * item.unitPrice}</td>
                      <td>
                        K{item.quantity * item.unitPrice - item.priceBought}
                      </td>
                      {/* <td>{item.section}</td> */}
                    </tr>
                  ))}
                </tbody>
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
