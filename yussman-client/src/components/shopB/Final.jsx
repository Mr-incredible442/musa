import { useCallback, useContext, useEffect, useState } from 'react';
import apiCall from '../../helpers/apiCall';
import { ShopBContext } from '../../context/ShopBContext';
import { AuthContext } from '../../context/AuthContext';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import AddCashier from './modals/AddCashier';

import { SHOPB_URL } from '../../helpers/variables';

import AddAcountant from './modals/AddAcountant';
import AddCheckedBy from './modals/AddCheckedBy';
import NextShift from './modals/NextShift';
import AddDate from './modals/AddDateIn';
import AddDateOut from './modals/AddDateOut';

function Final() {
  const [result, setResult] = useState([]);
  const [disable, setDisable] = useState(true);
  const [shopBShiftT, setShopBShiftT] = useState({});

  const { shopBShift } = useContext(ShopBContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    setShopBShiftT(shopBShift);
  }, [shopBShift]);

  let totalSales = 0;
  if (Object.keys(shopBShiftT).length > 0) {
    const calculateTotalSales = (stock) => {
      return (
        (stock.ostock + stock.received - stock.damage - stock.cstock) *
        stock.price
      );
    };

    totalSales = shopBShiftT.stock.reduce((total, stock) => {
      return total + calculateTotalSales(stock);
    }, 0);
  }

  const check = useCallback(() => {
    if (Object.keys(shopBShiftT).length > 0) {
      const cashierLength = shopBShiftT.cashier.length;
      const acountantLength = shopBShiftT.acountant.length;
      const dateInLength = shopBShiftT.dateIn.length;
      const dateOutLength = shopBShiftT.dateOut.length;
      const checkedByLength = shopBShiftT.checkedBy.length;

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
  }, [shopBShiftT]);

  useEffect(() => {
    if (Object.keys(shopBShiftT).length > 0) {
      setResult(
        shopBShiftT.cash.reduce((a, b) => a + b, 0) +
          shopBShiftT.credit.reduce(
            (total, credit) => total + credit.amount,
            0,
          ) -
          totalSales,
      );
    }
    check();
  }, [shopBShiftT, totalSales, check]);

  const handleDeleteCashier = (name) => {
    apiCall
      .post(`${SHOPB_URL}/${shopBShiftT._id}/removecashier`, {
        name: name.toLowerCase(),
      })
      .then(() => {
        check();
      });
  };
  const handleDeleteAcountant = () => {
    apiCall
      .post(`${SHOPB_URL}/${shopBShiftT._id}/removeaccountant`)
      .then(() => {
        check();
      });
  };
  const handleDeleteCheckedBy = () => {
    apiCall.post(`${SHOPB_URL}/${shopBShiftT._id}/removecheckedby`).then(() => {
      check();
    });
  };

  const handleDeleteDateIn = () => {
    apiCall.post(`${SHOPB_URL}/${shopBShiftT._id}/deletedatein`).then(() => {
      check();
    });
  };
  const handleDeleteDateOut = () => {
    apiCall.post(`${SHOPB_URL}/${shopBShiftT._id}/deletedateout`).then(() => {
      check();
    });
  };

  if (Object.keys(shopBShiftT).length === 0) {
    return null;
  }

  return (
    <Container>
      {Object.keys(shopBShiftT).length !== 0 && (
        <Row className='mx-1'>
          <Col className='d-flex flex-column align-items-center border pt-3 me-1 '>
            <p>
              Cash : K
              {shopBShiftT.cash.reduce((a, b) => a + b, 0).toLocaleString()}
            </p>

            <p>
              Credit: K
              {shopBShiftT.credit
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
                {shopBShiftT.dateIn.length > 0 ? (
                  <h6
                    onDoubleClick={handleDeleteDateIn}
                    style={{ cursor: 'pointer' }}>
                    {' '}
                    {shopBShiftT.dateIn}
                  </h6>
                ) : (
                  <AddDate id={shopBShiftT._id} />
                )}
              </div>
              <div className='d-flex align-items-center prevent-select'>
                <h6 className='me-1'>Date Out :</h6>
                {shopBShiftT.dateOut.length > 0 ? (
                  <h6
                    onDoubleClick={handleDeleteDateOut}
                    style={{ cursor: 'pointer' }}>
                    {' '}
                    {shopBShiftT.dateOut}
                  </h6>
                ) : (
                  <AddDateOut id={shopBShiftT._id} />
                )}
              </div>
            </div>
            <hr className=' w-100 ' />
            <div className='d-flex justify-content-evenly'>
              <h6 className='d-flex align-items-center'>Cashier : </h6>
              {shopBShiftT.cashier.map((cashier) => (
                <h6
                  className='pt-1 prevent-select text-capitalize '
                  key={cashier}
                  style={{ cursor: 'pointer' }}
                  onDoubleClick={() => handleDeleteCashier(cashier)}>
                  {cashier}
                </h6>
              ))}
              {shopBShiftT.cashier.length >= 0 &&
                shopBShiftT.cashier.length < 1 && (
                  <AddCashier id={shopBShiftT._id} />
                )}
            </div>
            <hr className=' w-100 ' />
            <div className='d-flex align-items-center justify-content-evenly'>
              <h6>Accountant : </h6>
              {shopBShiftT.acountant.length > 0 ? (
                <>
                  <h6
                    className='ms-2 pt-1 prevent-select text-capitalize'
                    style={{ cursor: 'pointer' }}
                    onDoubleClick={() => handleDeleteAcountant()}>
                    {shopBShiftT.acountant}
                  </h6>
                </>
              ) : (
                <AddAcountant id={shopBShiftT._id} />
              )}
            </div>
            <hr className=' w-100 ' />
            <div className='d-flex align-items-center justify-content-evenly'>
              <h6>Checked By : </h6>
              {shopBShiftT.checkedBy.length > 0 ? (
                <>
                  <h6
                    className='ms-2 pt-1 prevent-select text-capitalize'
                    style={{ cursor: 'pointer' }}
                    onDoubleClick={() => handleDeleteCheckedBy()}>
                    {shopBShiftT.checkedBy}
                  </h6>
                </>
              ) : (
                user &&
                user.role === 'admin' && <AddCheckedBy id={shopBShiftT._id} />
              )}
            </div>
            <div className='d-flex justify-content-center mt-5 '>
              {!disable && <NextShift id={shopBShiftT._id} />}
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Final;
