import { createContext, useEffect, useReducer } from 'react';
import socket from '../helpers/socket';
import apiCall from '../helpers/apiCall';
import { ORDERS_URL } from '../helpers/variables';

export const OrdersContext = createContext();

const ordersReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ORDERS':
      return { orders: action.payload };
    default:
      return state;
  }
};

// eslint-disable-next-line react/prop-types
export const OrdersContextProvider = ({ children }) => {
  const [ordersState, dispatch] = useReducer(ordersReducer, { order: null });

  // Fetch initial orders
  useEffect(() => {
    apiCall.get(ORDERS_URL).then((response) => {
      const ordersObject = response.data;
      dispatch({ type: 'SET_ORDERS', payload: ordersObject[0] });
    });
  }, []);

  //   Listen for real-time order updates via existing 'orders' socket event
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.on('orders', (updatedOrders) => {
      const normalizedOrders = Array.isArray(updatedOrders)
        ? updatedOrders[0]
        : updatedOrders;

      dispatch({ type: 'SET_ORDERS', payload: normalizedOrders });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      socket.off('orders');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  return (
    <OrdersContext.Provider value={{ orders: ordersState.orders, dispatch }}>
      {children}
    </OrdersContext.Provider>
  );
};
