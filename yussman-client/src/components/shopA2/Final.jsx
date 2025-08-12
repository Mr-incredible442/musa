import { useCallback, useContext, useEffect, useState } from 'react';
import apiCall from '../../helpers/apiCall';
import { ShopA2Context } from '../../context/ShopA2Context';
import { AuthContext } from '../../context/AuthContext';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import AddCashier from './modals/AddCashier';

import { SHOPA2_URL } from '../../helpers/variables';

import AddAcountant from './modals/AddAcountant';
import AddCheckedBy from './modals/AddCheckedBy';
import NextShift from './modals/NextShift';
import AddDate from './modals/AddDateIn';
import AddDateOut from './modals/AddDateOut';

function Final() {
  const [result, setResult] = useState([]);
  const [disable, setDisable] = useState(true);
  const [shopA2ShiftT, setShopA2ShiftT] = useState({});

  const { shopA2Shift } = useContext(ShopA2Context);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    setShopA2ShiftT(shopA2Shift);
  }, [shopA2Shift]);

  let totalSales = 0;
  if (Object.keys(shopA2ShiftT).length > 0) {
    const calculateTotalSales = (stock) => {
      return (
        (stock.ostock + stock.received - stock.damage - stock.cstock) *
        stock.price
      );
    };

    totalSales = shopA2ShiftT.stock.reduce((total, stock) => {
      return total + calculateTotalSales(stock);
    }, 0);
  }

  const check = useCallback(() => {
    if (Object.keys(shopA2ShiftT).length > 0) {
      const cashierLength = shopA2ShiftT.cashier.length;
      const acountantLength = shopA2ShiftT.acountant.length;
      const dateInLength = shopA2ShiftT.dateIn.length;
      const dateOutLength = shopA2ShiftT.dateOut.length;
      const checkedByLength = shopA2ShiftT.checkedBy.length;

      if (
        cashierLength > 0 &&
        acountantLength > 0 &&
        dateInLength > 0 &&
        dateOutLength > 0 &&
        checkedByLength > 0
      ) {
        setDisable(false);
      } else {
        setDisable(true);
      }
    }
  }, [shopA2ShiftT]);

  useEffect(() => {
    if (Object.keys(shopA2ShiftT).length > 0) {
      setResult(
        shopA2ShiftT.cash.reduce((a, b) => a + b, 0) +
          shopA2ShiftT.credit.reduce(
            (total, credit) => total + credit.amount,
            0,
          ) -
          totalSales,
      );
    }
    check();
  }, [shopA2ShiftT, totalSales, check]);

  const handleDeleteCashier = (name) => {
    apiCall
      .post(`${SHOPA2_URL}/${shopA2ShiftT._id}/removecashier`, {
        name: name.toLowerCase(),
      })
      .then(() => {
        check();
      });
  };
  const handleDeleteAcountant = () => {
    apiCall
      .post(`${SHOPA2_URL}/${shopA2ShiftT._id}/removeaccountant`)
      .then(() => {
        check();
      });
  };
  const handleDeleteCheckedBy = () => {
    apiCall
      .post(`${SHOPA2_URL}/${shopA2ShiftT._id}/removecheckedby`)
      .then(() => {
        check();
      });
  };

  const handleDeleteDateIn = () => {
    apiCall.post(`${SHOPA2_URL}/${shopA2ShiftT._id}/deletedatein`).then(() => {
      check();
    });
  };
  const handleDeleteDateOut = () => {
    apiCall.post(`${SHOPA2_URL}/${shopA2ShiftT._id}/deletedateout`).then(() => {
      check();
    });
  };

  if (Object.keys(shopA2ShiftT).length === 0) {
    return null;
  }

  return (
    <Container>
      {Object.keys(shopA2ShiftT).length !== 0 && (
        <Row className='mx-1'>
          <Col className='d-flex flex-column align-items-center border pt-3 me-1 '>
            <p>
              Cash : K
              {shopA2ShiftT.cash.reduce((a, b) => a + b, 0).toLocaleString()}
            </p>

            <p>
              Credit: K
              {shopA2ShiftT.credit
                .reduce((total, credit) => total + credit.amount, 0)
                .toLocaleString()}
            </p>
            {user !== null && user.role === 'admin' && (
              <p>Sales Total : K{totalSales.toLocaleString()}</p>
            )}
            {user && user.role === 'admin' && (
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
          <Col className='border py-3 ms-1 '>
            <p className='text-center text-muted '>
              Double click on any of the fields below to delete
            </p>
            <div className='d-flex justify-content-around'>
              <div className='d-flex align-items-center prevent-select'>
                <h6 className='me-1'>Date In :</h6>
                {shopA2ShiftT.dateIn.length > 0 ? (
                  <h6
                    onDoubleClick={handleDeleteDateIn}
                    style={{ cursor: 'pointer' }}>
                    {' '}
                    {shopA2ShiftT.dateIn}
                  </h6>
                ) : (
                  <AddDate id={shopA2ShiftT._id} />
                )}
              </div>
              <div className='d-flex align-items-center prevent-select'>
                <h6 className='me-1'>Date Out :</h6>
                {shopA2ShiftT.dateOut.length > 0 ? (
                  <h6
                    onDoubleClick={handleDeleteDateOut}
                    style={{ cursor: 'pointer' }}>
                    {' '}
                    {shopA2ShiftT.dateOut}
                  </h6>
                ) : (
                  <AddDateOut id={shopA2ShiftT._id} />
                )}
              </div>
            </div>
            <hr className=' w-100 ' />
            <div className='d-flex justify-content-evenly'>
              <h6 className='d-flex align-items-center'>Cashier : </h6>
              {shopA2ShiftT.cashier.map((cashier) => (
                <h6
                  className='pt-1 prevent-select text-capitalize '
                  key={cashier}
                  style={{ cursor: 'pointer' }}
                  onDoubleClick={() => handleDeleteCashier(cashier)}>
                  {cashier}
                </h6>
              ))}
              {shopA2ShiftT.cashier.length >= 0 &&
                shopA2ShiftT.cashier.length < 1 && (
                  <AddCashier id={shopA2ShiftT._id} />
                )}
            </div>
            <hr className=' w-100 ' />
            <div className='d-flex align-items-center justify-content-evenly'>
              <h6>Accountant : </h6>
              {shopA2ShiftT.acountant.length > 0 ? (
                <>
                  <h6
                    className='ms-2 pt-1 prevent-select text-capitalize'
                    style={{ cursor: 'pointer' }}
                    onDoubleClick={() => handleDeleteAcountant()}>
                    {shopA2ShiftT.acountant}
                  </h6>
                </>
              ) : (
                <AddAcountant id={shopA2ShiftT._id} />
              )}
            </div>
            <hr className=' w-100 ' />
            <div className='d-flex align-items-center justify-content-evenly'>
              <h6>Checked By : </h6>
              {shopA2ShiftT.checkedBy.length > 0 ? (
                <>
                  <h6
                    className='ms-2 pt-1 prevent-select text-capitalize'
                    style={{ cursor: 'pointer' }}
                    onDoubleClick={() => handleDeleteCheckedBy()}>
                    {shopA2ShiftT.checkedBy}
                  </h6>
                </>
              ) : (
                user &&
                user.role === 'admin' && <AddCheckedBy id={shopA2ShiftT._id} />
              )}
            </div>
            <div className='d-flex justify-content-center mt-5 '>
              {!disable && <NextShift id={shopA2ShiftT._id} />}
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Final;
