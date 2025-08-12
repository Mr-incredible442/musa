import { useCallback, useContext, useEffect, useState } from 'react';

import apiCall from '../../helpers/apiCall';

import { Container, Row, Col } from 'react-bootstrap';

import { ChansaStoreContext } from '../../context/ChansaStoreContext';
import { AuthContext } from '../../context/AuthContext';

import AddDate from './modals/AddDate';
import AddAcountant from './modals/AddAcountant';
import AddKeeper from './modals/AddKeeper';
import AddCheckedBy from './modals/AddCheckedBy';
import NextShift from './modals/NextShift';

import { CHANSA_STORE_URL } from '../../helpers/variables';

function Final() {
  const [disable, setDisable] = useState(true);
  const { storeShift } = useContext(ChansaStoreContext);
  const { user } = useContext(AuthContext);

  const totalValue =
    storeShift && storeShift.stock
      ? storeShift.stock.reduce((sum, item) => {
          const stockValue = item.cstock * item.price;
          return sum + stockValue;
        }, 0)
      : 0;

  const check = useCallback(() => {
    if (storeShift !== null && Object.keys(storeShift).length > 0) {
      const dateLength =
        storeShift && storeShift.date ? storeShift.date.length : 0;
      const acountantLength =
        storeShift && storeShift.accountant ? storeShift.accountant.length : 0;
      const checkedByLength =
        storeShift && storeShift.checkedBy ? storeShift.checkedBy.length : 0;
      const keeperLength =
        storeShift && storeShift.keeper ? storeShift.keeper.length : 0;

      if (
        checkedByLength > 0 &&
        acountantLength > 0 &&
        dateLength > 0 &&
        keeperLength > 0
      ) {
        setDisable(false);
      } else {
        setDisable(true);
      }
    }
  }, [storeShift]);

  useEffect(() => {
    check();
  }, [check]);

  const handleDeleteDate = () => {
    apiCall
      .post(`${CHANSA_STORE_URL}/${storeShift._id}/deletedate`)
      .then(() => {
        check();
      });
  };

  const handleDeleteAccountant = () => {
    apiCall
      .post(`${CHANSA_STORE_URL}/${storeShift._id}/deleteaccountant`)
      .then(() => {
        check();
      });
  };

  const handleDeleteKeeper = () => {
    apiCall
      .post(`${CHANSA_STORE_URL}/${storeShift._id}/deletekeeper`)
      .then(() => {
        check();
      });
  };

  const handleDeleteCheckedBy = () => {
    apiCall
      .post(`${CHANSA_STORE_URL}/${storeShift._id}/deletecheckedby`)
      .then(() => {
        check();
      });
  };

  return (
    <Container className='mt-3'>
      <Row>
        <Col className='border mx-2 p-4 d-flex flex-column justify-content-center align-items-center'>
          <p className='fw-lighter'>Double click on names or date to delete.</p>
          <div className='d-flex align-items-center prevent-select py-2'>
            <h4 className='me-1'>Date :</h4>
            {storeShift && storeShift.date && storeShift.date.length > 0 ? (
              <h4
                onDoubleClick={handleDeleteDate}
                style={{ cursor: 'pointer' }}>
                {storeShift.date}
              </h4>
            ) : (
              <AddDate id={storeShift._id} />
            )}
          </div>
          <div className='d-flex align-items-center prevent-select py-2'>
            <h4 className='me-1'>Accountant :</h4>
            {storeShift &&
            storeShift.accountant &&
            storeShift.accountant.length > 0 ? (
              <h4
                className='text-capitalize'
                onDoubleClick={handleDeleteAccountant}
                style={{ cursor: 'pointer' }}>
                {storeShift.accountant}
              </h4>
            ) : (
              <AddAcountant id={storeShift._id} />
            )}
          </div>
          <div className='d-flex align-items-center prevent-select py-2'>
            <h4 className='me-1'>Chacked By :</h4>
            {storeShift &&
            storeShift.checkedBy &&
            storeShift.checkedBy.length > 0 ? (
              <h4
                className='text-capitalize'
                onDoubleClick={handleDeleteCheckedBy}
                style={{ cursor: 'pointer' }}>
                {storeShift.checkedBy}
              </h4>
            ) : user && user.role === 'admin' ? (
              <AddCheckedBy id={storeShift._id} />
            ) : null}
          </div>
          <div className='d-flex align-items-center prevent-select py-2'>
            <h4 className='me-1'>Keeper :</h4>
            {storeShift && storeShift.keeper && storeShift.keeper.length > 0 ? (
              <h4
                className='text-capitalize'
                onDoubleClick={handleDeleteKeeper}
                style={{ cursor: 'pointer' }}>
                {storeShift.keeper}
              </h4>
            ) : (
              <AddKeeper id={storeShift._id} />
            )}
          </div>
          <div className='d-flex justify-content-center align-items-center my-3 pt-2'>
            {!disable && <NextShift />}
          </div>
        </Col>
        {user && user.role === 'admin' && (
          <Col className='d-flex justify-content-center align-items-center border mx-2 p-4'>
            <p className='display-6'>
              Total :{' '}
              <span className={totalValue < 0 ? 'text-danger' : ''}>
                K{totalValue.toLocaleString()}
              </span>
            </p>
          </Col>
        )}
      </Row>
    </Container>
  );
}

export default Final;
