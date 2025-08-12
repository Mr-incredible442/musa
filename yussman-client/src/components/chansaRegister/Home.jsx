import { useContext, useEffect, useState } from 'react';

import { Table } from 'react-bootstrap';

import { ChansaRegisterContext } from '../../context/ChansaRegisterContext';
import { AuthContext } from '../../context/AuthContext';

import NewProductModal from './modals/NewProductModal';
import DeleteProduct from './modals/DeleteProduct';
import UpdateProductModal from './modals/UpdateProductModal';
import ChangePriceModal from './modals/ChangePriceModal';
import TablePlaceholder from '../../utils/TablePlaceholder';

function Home() {
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

  const { RegisterShift } = useContext(ChansaRegisterContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (Object.keys(RegisterShift).length !== 0) {
      const local = RegisterShift.stock.filter(
        (item) => item.section === 'local',
      );
      const outside = RegisterShift.stock.filter(
        (item) => item.section === 'outside',
      );
      const mearaj = RegisterShift.stock.filter(
        (item) => item.section === 'mearaj',
      );
      const ilyas = RegisterShift.stock.filter(
        (item) => item.section === 'ilyas',
      );
      const chansa = RegisterShift.stock.filter(
        (item) => item.section === 'chansa',
      );

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

      const totalProfit = RegisterShift.stock.reduce(
        (total, stock) =>
          total + (stock.quantity * stock.unitPrice - stock.priceBought),
        0,
      );

      setTotalProfit(totalProfit);
    }
  }, [RegisterShift]);

  return (
    <>
      <div className='d-flex justify-content-around   align-items-center py-2'>
        <NewProductModal id={RegisterShift._id} />
        {user && user.role === 'admin' && (
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
          <TablePlaceholder cols={user.role === 'admin' ? 10 : 7} rows={5} />
        ) : (
          <>
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
                    {/* <td>{item.section}</td> */}
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
                    <td>{item.section}</td>
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
                    <td>{item.section}</td>
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
                    <td>{item.section}</td>
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
                    <td>{item.section}</td>
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
                  <td>K{totalChansa.toLocaleString()}</td>
                  <td colSpan={5}></td>
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
