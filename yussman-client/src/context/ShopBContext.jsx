import { createContext, useEffect, useReducer, useState } from 'react';
import socket from '../helpers/socket';
import apiCall from '../helpers/apiCall';

import { SHOPB_URL } from '../helpers/variables';

export const ShopBContext = createContext();

const ShopBReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SHIFT':
      return {
        shift: action.payload,
      };
    default:
      return state;
  }
};

// eslint-disable-next-line react/prop-types
export const ShopBContextProvider = ({ children }) => {
  const [shift, dispatch] = useReducer(ShopBReducer, { shift: null });
  const [updatedStock, setUpdatedStock] = useState({});

  useEffect(() => {
    apiCall.get(SHOPB_URL).then((response) => {
      sumReceivedAmounts(response.data);
    });
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.on('shopb', (data) => {
      dispatch({ type: 'SET_SHIFT', payload: data });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      socket.off('shopb');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  const sumReceivedAmounts = (data) => {
    if (data !== null) {
      const receivedMap = {};
      if (data.received && Array.isArray(data.received)) {
        data.received.forEach((transaction) => {
          const code = transaction.code;
          const amount = transaction.amount;
          if (receivedMap[code] === undefined) {
            receivedMap[code] = amount;
          } else {
            receivedMap[code] += amount;
          }
        });
      }
      // Update the stock array with the summed received amounts
      const updatedData = {
        ...data,
        stock: data.stock.map((prod) => {
          const code = prod.code;
          if (receivedMap[code] !== undefined) {
            return {
              ...prod,
              received: receivedMap[code],
            };
          }
          return prod;
        }),
      };

      updatedData.stock.sort((a, b) => a.name.localeCompare(b.name));
      setUpdatedStock(updatedData);
    }
  };

  useEffect(() => {
    sumReceivedAmounts(shift.shift);
  }, [shift.shift]);

  return (
    <ShopBContext.Provider value={{ shopBShift: updatedStock, dispatch }}>
      {children}
    </ShopBContext.Provider>
  );
};
