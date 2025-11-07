import { useContext, useEffect, useState } from 'react';

import { Table } from 'react-bootstrap';

import { BomaRegisterContext } from '../../context/BomaRegisterContext';
import { AuthContext } from '../../context/AuthContext';

import NewProductModal from './modals/NewProductModal';
import DeleteProduct from './modals/DeleteProduct';
import UpdateProductModal from './modals/UpdateProductModal';
import ChangePriceModal from './modals/ChangePriceModal';
import TablePlaceholder from '../../utils/TablePlaceholder';

function Home() {
  const [stocks, setStocks] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);

  const { RegisterShift } = useContext(BomaRegisterContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (Object.keys(RegisterShift).length !== 0 && RegisterShift.stock) {
      setStocks(RegisterShift.stock);

      const totalCost = RegisterShift.stock.reduce(
        (total, stock) => total + stock.priceBought,
        0,
      );

      setTotalCost(totalCost);

      const totalProfit = RegisterShift.stock.reduce(
        (total, stock) =>
          total + (stock.quantity * stock.unitPrice - stock.priceBought),
        0,
      );

      setTotalProfit(totalProfit);
    } else {
      setStocks([]);
      setTotalCost(0);
      setTotalProfit(0);
    }
  }, [RegisterShift]);

  return (
    <>
      <div className='d-flex justify-content-around   align-items-center py-2'>
        {RegisterShift && RegisterShift._id && (
          <NewProductModal id={RegisterShift._id} />
        )}
        {user && user.role === 'admin' && RegisterShift && (
          <>
            <ChangePriceModal />
            <h6>Total Profit: K{totalProfit.toLocaleString()}</h6>
          </>
        )}
      </div>
      <Table
        responsive
        size='sm'
        bordered
        className=' text-capitalize text-center'>
        <thead>
          <tr>
            <th>#</th>
            <th>Code</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>Price Bought</th>
            <th>Unit Price</th>
            <th>Price Sold</th>
            {user && user.role === 'admin' && <th>Profit</th>}
            {user && user.role === 'admin' && <th>Profit %</th>}
            {user && user.role === 'admin' && <th>Action</th>}
          </tr>
        </thead>
        {!RegisterShift || !RegisterShift.expense ? (
          <TablePlaceholder
            cols={user && user.role === 'admin' ? 10 : 7}
            rows={5}
          />
        ) : (
          <>
            {stocks.length > 0 && (
              <tbody className='table-group-divider'>
                {stocks.map((item, index) => (
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
                    {user && user.role === 'admin' && (
                      <>
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
                      </>
                    )}
                    {user && user.role === 'admin' && (
                      <td className='d-flex justify-content-center gap-2'>
                        <UpdateProductModal
                          id={RegisterShift._id}
                          item={item}
                        />
                        <DeleteProduct
                          id={item._id}
                          shiftId={RegisterShift._id}
                        />
                      </td>
                    )}
                  </tr>
                ))}
                <tr>
                  <td colSpan={4}>Total</td>
                  <td>K{totalCost.toLocaleString()}</td>
                  <td colSpan={user && user.role === 'admin' ? 5 : 2}></td>
                </tr>
              </tbody>
            )}
          </>
        )}
      </Table>
    </>
  );
}

export default Home;
