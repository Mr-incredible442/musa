import { useCallback, useContext, useEffect, useState } from 'react';
import apiCall from '../../helpers/apiCall';
import { RestaurantContext } from '../../context/RestaurantContext';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import AddCashier from './modals/AddCashier';

import { RESTAURANT_LOCAL_URL } from '../../helpers/variables';
import { AuthContext } from '../../context/AuthContext';

import AddAcountant from './modals/AddAcountant';
import NextShift from './modals/NextShift';
import AddShift from './modals/AddShift';
import AddDate from './modals/AddDate';

function Final() {
  const [result, setResult] = useState([]);
  const [cups, setCups] = useState([]);
  const [disable, setDisable] = useState(true);

  const { shift } = useContext(RestaurantContext);
  const { user } = useContext(AuthContext);

  let totalCollectedAmount = 0;
  let totalNotCollectedAmount = 0;
  let totalSales = 0;
  if (shift !== null && shift !== undefined && Object.keys(shift).length > 0) {
    totalCollectedAmount = shift.bus
      .filter((bus) => bus.status === 'collected')
      .reduce((total, bus) => total + bus.amount, 0);

    totalNotCollectedAmount = shift.bus
      .filter((bus) => bus.status === 'not collected')
      .reduce((total, bus) => total + bus.amount, 0);

    const calculateTotalSales = (stock) => {
      return (
        (stock.ostock + stock.received - stock.damage - stock.cstock) *
        stock.price
      );
    };

    totalSales = shift.stock.reduce((total, stock) => {
      return total + calculateTotalSales(stock);
    }, 0);
  }

  const check = useCallback(() => {
    if (
      shift !== null &&
      shift !== undefined &&
      Object.keys(shift).length > 0
    ) {
      const cashierLength = shift.cashier.length;
      const acountantLength = shift.acountant.length;
      const dateLength = shift.date.length;
      const shiftLength = shift.shift.length;
      const cashAmount = shift.cash.reduce((total, cash) => total + cash, 0);

      if (
        cashierLength > 0 &&
        acountantLength > 0 &&
        dateLength > 0 &&
        shiftLength > 0 &&
        cashAmount > 0
      ) {
        setDisable(false);
      } else {
        setDisable(true);
      }
    }
  }, [shift]);

  useEffect(() => {
    if (
      shift !== null &&
      shift !== undefined &&
      Object.keys(shift).length > 0
    ) {
      setResult(
        shift.cash.reduce((a, b) => a + b, 0) +
          totalCollectedAmount +
          shift.credit.reduce((total, credit) => total + credit.amount, 0) -
          shift.change.reduce((a, b) => a + b, 0) -
          totalSales,
      );

      const targetCodes = [10082, 10083, 10084, 10081, 10098];
      const selectedProducts = shift.stock.filter((product) =>
        targetCodes.includes(product.code),
      );

      setCups(selectedProducts);
    }
    check();
  }, [shift, totalCollectedAmount, totalSales, check]);

  const handleDeleteCashier = (name) => {
    apiCall
      .post(`${RESTAURANT_LOCAL_URL}/${shift._id}/removecashier`, {
        name: name.toLowerCase(),
      })
      .then(() => {
        check();
      });
  };
  const handleDeleteAcountant = () => {
    apiCall
      .post(`${RESTAURANT_LOCAL_URL}/${shift._id}/removeaccountant`)
      .then(() => {
        check();
      });
  };
  const handleDeleteShift = () => {
    apiCall
      .post(`${RESTAURANT_LOCAL_URL}/${shift._id}/deleteshift`)
      .then(() => {
        check();
      });
  };
  const handleDeleteDate = () => {
    apiCall.post(`${RESTAURANT_LOCAL_URL}/${shift._id}/deletedate`).then(() => {
      check();
    });
  };

  return (
    <Container>
      {shift !== null &&
        shift !== undefined &&
        Object.keys(shift).length !== 0 && (
          <Row className='mx-1'>
            <Col className='d-flex flex-column align-items-center border pt-3 me-1 '>
              <p>
                Bus Not Collected: K{totalNotCollectedAmount.toLocaleString()}
              </p>
              <p>
                Topup Total : K
                {shift.topup
                  .reduce((total, item) => total + item.amount, 0)
                  .toLocaleString()}
              </p>
              <hr className=' w-100 ' />
              {user !== null && user.role === 'admin' && (
                <p>
                  Cash : K
                  {shift.cash.reduce((a, b) => a + b, 0).toLocaleString()}
                </p>
              )}
              <p>Change : K{shift.change.reduce((a, b) => a + b, 0)}</p>
              <p>Bus Collected: K{totalCollectedAmount.toLocaleString()}</p>
              <p>
                Credit: K
                {shift.credit
                  .reduce((total, credit) => total + credit.amount, 0)
                  .toLocaleString()}
              </p>
              {user !== null && user.role === 'admin' && (
                <p>Sales Total : K{totalSales.toLocaleString()}</p>
              )}
              {user !== null && user.role === 'admin' && (
                <>
                  <hr className=' w-100 ' />
                  <p className='display-6'>
                    Result : K
                    <span className={result < 0 ? 'text-danger' : ''}>
                      {result.toLocaleString()}
                    </span>
                  </p>
                </>
              )}
            </Col>
            <Col className='border pt-3 ms-1 '>
              <p className='text-center text-muted '>
                Double click on any of the fields below to delete
              </p>
              <div className='d-flex justify-content-around'>
                <div className='d-flex align-items-center prevent-select'>
                  <h4 className='me-1'>Date :</h4>
                  {shift.date.length > 0 ? (
                    <h4
                      onDoubleClick={handleDeleteDate}
                      style={{ cursor: 'pointer' }}>
                      {' '}
                      {shift.date}
                    </h4>
                  ) : (
                    <AddDate id={shift._id} />
                  )}
                </div>
                <div className='d-flex align-items-center prevent-select'>
                  <h4>Shift :</h4>
                  {shift.shift.length > 0 ? (
                    <h4
                      className='ms-1 text-capitalize'
                      onDoubleClick={handleDeleteShift}
                      style={{ cursor: 'pointer' }}>
                      {shift.shift}
                    </h4>
                  ) : (
                    <AddShift id={shift._id} />
                  )}
                </div>
              </div>
              <hr className=' w-100 ' />
              <div className='d-flex justify-content-evenly'>
                <h5 className='d-flex align-items-center'>Cashiers : </h5>
                {shift.cashier.map((cashier) => (
                  <h6
                    className='pt-1 prevent-select text-capitalize '
                    key={cashier}
                    style={{ cursor: 'pointer' }}
                    onDoubleClick={() => handleDeleteCashier(cashier)}>
                    {cashier}
                  </h6>
                ))}
                <AddCashier id={shift._id} />
              </div>
              <hr className=' w-100 ' />
              <div className='d-flex align-items-center justify-content-evenly'>
                <h5>Accountant : </h5>
                {shift.acountant.length > 0 ? (
                  <>
                    <h6
                      className='ms-2 pt-1 prevent-select text-capitalize'
                      style={{ cursor: 'pointer' }}
                      onDoubleClick={() => handleDeleteAcountant()}>
                      {shift.acountant}
                    </h6>
                  </>
                ) : (
                  <AddAcountant id={shift._id} />
                )}
              </div>
              <div className='d-flex justify-content-center mt-5 '>
                {!disable && user !== null && user.role === 'admin' && (
                  <NextShift id={shift._id} />
                )}
              </div>
            </Col>
          </Row>
        )}
      <Row className='mx-1'>
        <Col className='border mt-2  py-2'>
          {cups && cups.length > 0 && (
            <>
              <h6 className='text-center'>
                Black Coffee :{' '}
                <span>
                  {cups[0].ostock + cups[0].received - cups[0].cstock}
                </span>
              </h6>
              <h6 className='text-center'>
                Black Tea :{' '}
                <span>
                  {cups[1].ostock + cups[1].received - cups[1].cstock}
                </span>
              </h6>
              <h6 className='text-center'>
                Coffee Milk :{' '}
                <span>
                  {cups[2].ostock + cups[2].received - cups[2].cstock}
                </span>
              </h6>
              <h6 className='text-center'>
                Milk Tea :{' '}
                <span>
                  {cups[4].ostock + cups[4].received - cups[4].cstock}
                </span>
              </h6>
              <hr />
              <h6 className='text-center'>
                Total :
                <span>
                  {cups[0].ostock +
                    cups[0].received -
                    cups[0].cstock +
                    (cups[1].ostock + cups[1].received - cups[1].cstock) +
                    (cups[2].ostock + cups[2].received - cups[2].cstock) +
                    (cups[4].ostock + cups[4].received - cups[4].cstock)}
                </span>
              </h6>
              <hr />
              <h6 className='text-center'>
                Cups :{' '}
                <span>
                  {cups[3].ostock +
                    cups[3].received -
                    (cups[3].damage + cups[3].cstock)}
                </span>
              </h6>
            </>
          )}
        </Col>
        <Col className='mt-2 mx-1'></Col>
      </Row>
    </Container>
  );
}

export default Final;
