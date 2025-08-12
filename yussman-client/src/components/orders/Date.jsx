/* eslint-disable react/prop-types */
import apiCall from '../../helpers/apiCall';
import AddDate from './modals/AddDate';

import { ORDERS_URL } from '../../helpers/variables';

function Date({ orders = {} } = {}) {
  const deleteDate = async (id) => {
    await apiCall.patch(`${ORDERS_URL}/${id}`, { date: '' });
  };

  return (
    <p
      className='d-flex justify-content-center align-items-center user-select-none'
      style={{ cursor: 'pointer' }}
      onDoubleClick={() => deleteDate(orders?._id)}>
      Date :{' '}
      {orders?.date?.length <= 0 ? <AddDate id={orders?._id} /> : orders?.date}
    </p>
  );
}

export default Date;
