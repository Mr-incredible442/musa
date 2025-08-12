import { useContext, useState } from 'react';
import apiCall from '../../helpers/apiCall';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { Table, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

import NewProductModal from '../orders/modals/NewProductModal';
import DeleteProduct from '../orders/modals/DeleteProduct';
import { OrdersContext } from '../../context/OrdersContext';
import Date from '../orders/Date';
import EditProductModal from '../orders/modals/EditProductModal';
import NoneExisttingProductModal from '../orders/modals/NoneExisttingProductModal';

import { ORDERS_URL } from '../../helpers/variables';
import NewOrdersModal from './modals/NewOrders';

function OrdersList() {
  const { orders, dispatch } = useContext(OrdersContext);
  const [loading, setLoading] = useState(false);

  const createOrder = async () => {
    setLoading(true);
    const currentDate = new window.Date().toISOString().split('T')[0];
    try {
      const response = await apiCall.post(`${ORDERS_URL}`, {
        date: currentDate,
      });
      dispatch({ type: 'SET_ORDERS', payload: response.data });
      setLoading(false);
    } catch (error) {
      console.error('Error creating order:', error);
      setLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Order List', 14, 22);

    const tableColumn = [
      '#',
      'Name',
      'Quantity',
      'Comment',
      ' ',
      ' ',
      ' ',
      ' ',
      ' ',
      ' ',
      ' ',
      ' ',
      ' ',
      ' ',
      ' ',
      ' ',
      ' ',
      ' ',
      ' ',
    ];
    const tableRows = [];

    orders?.products?.forEach((product, index) => {
      const productData = [
        index + 1,
        product.name,
        product.quantity,
        product.comment,
      ];
      tableRows.push(productData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save(`orders-${orders?.date}.pdf`);
  };
  return (
    <div>
      {!orders || orders.length === 0 ? (
        <div className='d-flex justify-content-center align-items-center p-3'>
          <Button
            size='sm'
            variant='outline-success'
            onClick={createOrder}
            disabled={loading}>
            Create new Order
          </Button>
        </div>
      ) : (
        <div className='d-flex justify-content-between align-items-center p-3'>
          {!orders || orders.date.length === 0 ? (
            <Date orders={orders} />
          ) : (
            <>
              <OverlayTrigger
                placement='top'
                overlay={
                  <Tooltip id={`tooltip-${orders._id}`}>
                    Double click to delete
                  </Tooltip>
                }>
                <span>
                  <Date orders={orders} />
                </span>
              </OverlayTrigger>
            </>
          )}
          <NewProductModal id={orders?._id} />
          <NoneExisttingProductModal id={orders?._id} />
          {!orders || orders.date.length === 0 ? (
            <>
              <OverlayTrigger
                placement='top'
                overlay={
                  <Tooltip id={`tooltip-${orders._id}`}>
                    Please enter date for this button to be enabled
                  </Tooltip>
                }>
                <span>
                  <Button
                    size='sm'
                    variant='outline-success'
                    onClick={exportPDF}
                    disabled={!(orders?.date?.length > 0)}>
                    {!(orders?.date?.length > 0)
                      ? 'Enter Date'
                      : 'Export as PDF'}
                  </Button>
                </span>
              </OverlayTrigger>
              <OverlayTrigger
                placement='top'
                overlay={
                  <Tooltip id={`tooltip-${orders._id}`}>
                    Please enter date for this button to be enabled
                  </Tooltip>
                }>
                <span>
                  <NewOrdersModal disabled={!(orders?.date?.length > 0)} />
                </span>
              </OverlayTrigger>
            </>
          ) : (
            <>
              <Button
                size='sm'
                variant='outline-success'
                onClick={exportPDF}
                disabled={!(orders?.date?.length > 0)}>
                {!(orders?.date?.length > 0) ? 'Enter Date' : 'Export as PDF'}
              </Button>
              <NewOrdersModal />
            </>
          )}
        </div>
      )}
      <Table responsive size='sm' className='text-capitalize text-center my-3'>
        <thead>
          <tr>
            <th>#</th>
            <th>Code</th>
            <th>Name</th>
            <th>Available</th>
            <th>Quantity</th>
            <th>Comment</th>
            <th>A</th>
          </tr>
        </thead>
        <tbody className='table-group-divider'>
          {orders?.products?.length > 0 ? (
            orders.products.map((product, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{product.code}</td>
                <td>{product.name}</td>
                <td>{product.available}</td>
                <td>{product.quantity}</td>
                <td>{product.comment}</td>
                <td className='d-flex gap-3 justify-content-center'>
                  <EditProductModal
                    product={product}
                    qtt={product.quantity}
                    coment={product.comment}
                    id={orders?._id}
                    prodId={product._id}
                  />
                  <DeleteProduct id={product._id} shiftId={orders?._id} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan='7'>No products available</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default OrdersList;
