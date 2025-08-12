import { useCallback, useContext, useEffect, useState } from 'react';
import apiCall from '../../helpers/apiCall';
import { ShopWContext } from '../../context/ShopWContext';
import { AuthContext } from '../../context/AuthContext';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import AddCashier from './modals/AddCashier';

import { SHOPW_URL } from '../../helpers/variables';

import AddAcountant from './modals/AddAcountant';
import AddCheckedBy from './modals/AddCheckedBy';
import NextShift from './modals/NextShift';
import AddDate from './modals/AddDateIn';

function Final() {
  const [result, setResult] = useState([]);
  const [disable, setDisable] = useState(true);
  const [shopWShiftT, setShopWShiftT] = useState({});

  const { shopWShift } = useContext(ShopWContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    setShopWShiftT(shopWShift);
  }, [shopWShift]);

  let totalSales = 0;
  if (Object.keys(shopWShiftT).length > 0) {
    const calculateTotalSales = (stock) => {
      return (
        (stock.ostock + stock.received - stock.damage - stock.cstock) *
        stock.price
      );
    };

    totalSales = shopWShiftT.stock.reduce((total, stock) => {
      return total + calculateTotalSales(stock);
    }, 0);
  }

  const check = useCallback(() => {
    if (Object.keys(shopWShiftT).length > 0) {
      const cashierLength = shopWShiftT.cashier.length;
      const acountantLength = shopWShiftT.acountant.length;
      const dateInLength = shopWShiftT.dateIn.length;
      const checkedByLength = shopWShiftT.checkedBy.length;

      if (
        cashierLength > 0 &&
        acountantLength > 0 &&
        dateInLength > 0 &&
        checkedByLength > 0
      ) {
        setDisable(false);
      } else {
        setDisable(true);
      }
    }
  }, [shopWShiftT]);

  useEffect(() => {
    if (Object.keys(shopWShiftT).length > 0) {
      setResult(
        shopWShiftT.cash.reduce((a, b) => a + b, 0) +
          shopWShiftT.credit.reduce(
            (total, credit) => total + credit.amount,
            0,
          ) -
          totalSales,
      );
    }
    check();
  }, [shopWShiftT, totalSales, check]);

  const handleDeleteCashier = (name) => {
    apiCall
      .post(`${SHOPW_URL}/${shopWShiftT._id}/removecashier`, {
        name: name.toLowerCase(),
      })
      .then(() => {
        check();
      });
  };
  const handleDeleteAcountant = () => {
    apiCall
      .post(`${SHOPW_URL}/${shopWShiftT._id}/removeaccountant`)
      .then(() => {
        check();
      });
  };
  const handleDeleteCheckedBy = () => {
    apiCall.post(`${SHOPW_URL}/${shopWShiftT._id}/removecheckedby`).then(() => {
      check();
    });
  };

  const handleDeleteDateIn = () => {
    apiCall.post(`${SHOPW_URL}/${shopWShiftT._id}/deletedatein`).then(() => {
      check();
    });
  };

  if (Object.keys(shopWShiftT).length === 0) {
    return null;
  }

  return (
    <Container>
      {Object.keys(shopWShiftT).length !== 0 && (
        <Row className='mx-1'>
          <Col className='d-flex flex-column align-items-center border pt-3 me-1 '>
            <p>
              Cash : K
              {shopWShiftT.cash.reduce((a, b) => a + b, 0).toLocaleString()}
            </p>

            <p>
              Credit: K
              {shopWShiftT.credit
                .reduce((total, credit) => total + credit.amount, 0)
                .toLocaleString()}
            </p>
            {user !== null && user.role === 'admin' && (
              <p>Sales Total : K{totalSales.toLocaleString()}</p>
            )}
            <hr className=' w-100 ' />
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
                <h6 className='me-1'>Date :</h6>
                {shopWShiftT.dateIn.length > 0 ? (
                  <h6
                    onDoubleClick={handleDeleteDateIn}
                    style={{ cursor: 'pointer' }}>
                    {' '}
                    {shopWShiftT.dateIn}
                  </h6>
                ) : (
                  <AddDate id={shopWShiftT._id} />
                )}
              </div>
            </div>
            <hr className=' w-100 ' />
            <div className='d-flex justify-content-evenly'>
              <h6 className='d-flex align-items-center'>Cashier : </h6>
              {shopWShiftT.cashier.map((cashier) => (
                <h6
                  className='pt-1 prevent-select text-capitalize '
                  key={cashier}
                  style={{ cursor: 'pointer' }}
                  onDoubleClick={() => handleDeleteCashier(cashier)}>
                  {cashier}
                </h6>
              ))}
              {shopWShiftT.cashier.length >= 0 &&
                shopWShiftT.cashier.length < 1 && (
                  <AddCashier id={shopWShiftT._id} />
                )}
            </div>
            <hr className=' w-100 ' />
            <div className='d-flex align-items-center justify-content-evenly'>
              <h6>Accountant : </h6>
              {shopWShiftT.acountant.length > 0 ? (
                <>
                  <h6
                    className='ms-2 pt-1 prevent-select text-capitalize'
                    style={{ cursor: 'pointer' }}
                    onDoubleClick={() => handleDeleteAcountant()}>
                    {shopWShiftT.acountant}
                  </h6>
                </>
              ) : (
                <AddAcountant id={shopWShiftT._id} />
              )}
            </div>
            <hr className=' w-100 ' />
            <div className='d-flex align-items-center justify-content-evenly'>
              <h6>Checked By : </h6>
              {shopWShiftT.checkedBy.length > 0 ? (
                <>
                  <h6
                    className='ms-2 pt-1 prevent-select text-capitalize'
                    style={{ cursor: 'pointer' }}
                    onDoubleClick={() => handleDeleteCheckedBy()}>
                    {shopWShiftT.checkedBy}
                  </h6>
                </>
              ) : (
                user &&
                user.role === 'admin' && <AddCheckedBy id={shopWShiftT._id} />
              )}
            </div>
            <div className='d-flex justify-content-center mt-5 '>
              {!disable && <NextShift id={shopWShiftT._id} />}
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Final;
