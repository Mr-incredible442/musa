/* eslint-disable react/prop-types */
import { createContext, useEffect, useReducer, useState } from 'react';
import socket from '../helpers/socket';
import apiCall from '../helpers/apiCall';

import { STORE_LOCAL_URL } from '../helpers/variables';

export const StoreContext = createContext();

const storeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SHIFT':
      return {
        shift: action.payload,
      };
    default:
      return state;
  }
};

export const StoreContextProvider = ({ children }) => {
  const [shift, dispatch] = useReducer(storeReducer, { shift: null });
  const [updatedStock, setUpdatedStock] = useState({});

  useEffect(() => {
    apiCall.get(STORE_LOCAL_URL).then((response) => {
      sumReceivedAmounts(response.data);
    });
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.on('store', (data) => {
      dispatch({ type: 'SET_SHIFT', payload: data });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      socket.off('store');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  const sumReceivedAmounts = (data) => {
    if (data !== null) {
      const receivedMap = {};
      const issuedMap = {};

      if (data.received && Array.isArray(data.received)) {
        data.received.forEach((transaction) => {
          const { code, quantity } = transaction;
          receivedMap[code] = (receivedMap[code] || 0) + quantity;
        });
      }

      if (data.issued && Array.isArray(data.issued)) {
        data.issued.forEach((transaction) => {
          const { code, quantity } = transaction;
          issuedMap[code] = (issuedMap[code] || 0) + quantity;
        });
      }

      let updatedData = {
        ...data,
        stock: data.stock.map((prod) => {
          const { code, ostock, damage } = prod;
          const received = receivedMap[code] || 0;
          const issued = issuedMap[code] || 0;

          const cstock = ostock + received - damage - issued;

          return {
            ...prod,
            received,
            issued,
            cstock,
          };
        }),
      };

      updatedData.stock.sort((a, b) => a.name.localeCompare(b.name));
      setUpdatedStock(updatedData);
    }
  };

  useEffect(() => {
    sumReceivedAmounts(shift.shift);
  }, [shift.shift]);

  if (updatedStock === null) {
    return null;
  }

  return (
    <StoreContext.Provider value={{ storeShift: updatedStock, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};
