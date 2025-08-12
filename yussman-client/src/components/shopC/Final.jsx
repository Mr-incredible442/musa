import { useCallback, useContext, useEffect, useState } from 'react';
import apiCall from '../../helpers/apiCall';
import { ShopCContext } from '../../context/ShopCContext';
import { AuthContext } from '../../context/AuthContext';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import AddCashier from './modals/AddCashier';

import { SHOPC_URL } from '../../helpers/variables';

import AddAcountant from './modals/AddAcountant';
import AddCheckedBy from './modals/AddCheckedBy';
import NextShift from './modals/NextShift';
import AddDate from './modals/AddDateIn';
import AddDateOut from './modals/AddDateOut';

function Final() {
  const [result, setResult] = useState([]);
  const [disable, setDisable] = useState(true);
  const [shopCShiftT, setShopCShiftT] = useState({});

  const { shopCShift } = useContext(ShopCContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    setShopCShiftT(shopCShift);
  }, [shopCShift]);

  let totalSales = 0;
  if (Object.keys(shopCShiftT).length > 0) {
    const calculateTotalSales = (stock) => {
      return (
        (stock.ostock + stock.received - stock.damage - stock.cstock) *
        stock.price
      );
    };

    totalSales = shopCShiftT.stock.reduce((total, stock) => {
      return total + calculateTotalSales(stock);
    }, 0);
  }

  const check = useCallback(() => {
    if (Object.keys(shopCShiftT).length > 0) {
      const cashierLength = shopCShiftT.cashier.length;
      const acountantLength = shopCShiftT.acountant.length;
      const dateInLength = shopCShiftT.dateIn.length;
      const dateOutLength = shopCShiftT.dateOut.length;
      const checkedByLength = shopCShiftT.checkedBy.length;

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
  }, [shopCShiftT]);

  useEffect(() => {
    if (Object.keys(shopCShiftT).length > 0) {
      setResult(
        shopCShiftT.cash.reduce((a, b) => a + b, 0) +
          shopCShiftT.credit.reduce(
            (total, credit) => total + credit.amount,
            0,
          ) -
          totalSales,
      );
    }
    check();
  }, [shopCShiftT, totalSales, check]);

  const handleDeleteCashier = (name) => {
    apiCall
      .post(`${SHOPC_URL}/${shopCShiftT._id}/removecashier`, {
        name: name.toLowerCase(),
      })
      .then(() => {
        check();
      });
  };
  const handleDeleteAcountant = () => {
    apiCall
      .post(`${SHOPC_URL}/${shopCShiftT._id}/removeaccountant`)
      .then(() => {
        check();
      });
  };
  const handleDeleteCheckedBy = () => {
    apiCall.post(`${SHOPC_URL}/${shopCShiftT._id}/removecheckedby`).then(() => {
      check();
    });
  };

  const handleDeleteDateIn = () => {
    apiCall.post(`${SHOPC_URL}/${shopCShiftT._id}/deletedatein`).then(() => {
      check();
    });
  };
  const handleDeleteDateOut = () => {
    apiCall.post(`${SHOPC_URL}/${shopCShiftT._id}/deletedateout`).then(() => {
      check();
    });
  };

  if (Object.keys(shopCShiftT).length === 0) {
    return null;
  }

  return (
    <Container>
      {Object.keys(shopCShiftT).length !== 0 && (
        <Row className='mx-1'>
          <Col className='d-flex flex-column align-items-center border pt-3 me-1 '>
            <p>
              Cash : K
              {shopCShiftT.cash.reduce((a, b) => a + b, 0).toLocaleString()}
            </p>

            <p>
              Credit: K
              {shopCShiftT.credit
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
                {shopCShiftT.dateIn.length > 0 ? (
                  <h6
                    onDoubleClick={handleDeleteDateIn}
                    style={{ cursor: 'pointer' }}>
                    {' '}
                    {shopCShiftT.dateIn}
                  </h6>
                ) : (
                  <AddDate id={shopCShiftT._id} />
                )}
              </div>
              <div className='d-flex align-items-center prevent-select'>
                <h6 className='me-1'>Date Out :</h6>
                {shopCShiftT.dateOut.length > 0 ? (
                  <h6
                    onDoubleClick={handleDeleteDateOut}
                    style={{ cursor: 'pointer' }}>
                    {' '}
                    {shopCShiftT.dateOut}
                  </h6>
                ) : (
                  <AddDateOut id={shopCShiftT._id} />
                )}
              </div>
            </div>
            <hr className=' w-100 ' />
            <div className='d-flex justify-content-evenly'>
              <h6 className='d-flex align-items-center'>Cashier : </h6>
              {shopCShiftT.cashier.map((cashier) => (
                <h6
                  className='pt-1 prevent-select text-capitalize '
                  key={cashier}
                  style={{ cursor: 'pointer' }}
                  onDoubleClick={() => handleDeleteCashier(cashier)}>
                  {cashier}
                </h6>
              ))}
              {shopCShiftT.cashier.length >= 0 &&
                shopCShiftT.cashier.length < 1 && (
                  <AddCashier id={shopCShiftT._id} />
                )}
            </div>
            <hr className=' w-100 ' />
            <div className='d-flex align-items-center justify-content-evenly'>
              <h6>Accountant : </h6>
              {shopCShiftT.acountant.length > 0 ? (
                <>
                  <h6
                    className='ms-2 pt-1 prevent-select text-capitalize'
                    style={{ cursor: 'pointer' }}
                    onDoubleClick={() => handleDeleteAcountant()}>
                    {shopCShiftT.acountant}
                  </h6>
                </>
              ) : (
                <AddAcountant id={shopCShiftT._id} />
              )}
            </div>
            <hr className=' w-100 ' />
            <div className='d-flex align-items-center justify-content-evenly'>
              <h6>Checked By : </h6>
              {shopCShiftT.checkedBy.length > 0 ? (
                <>
                  <h6
                    className='ms-2 pt-1 prevent-select text-capitalize'
                    style={{ cursor: 'pointer' }}
                    onDoubleClick={() => handleDeleteCheckedBy()}>
                    {shopCShiftT.checkedBy}
                  </h6>
                </>
              ) : (
                user &&
                user.role === 'admin' && <AddCheckedBy id={shopCShiftT._id} />
              )}
            </div>
            <div className='d-flex justify-content-center mt-5 '>
              {!disable && <NextShift id={shopCShiftT._id} />}
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Final;
