/* eslint-disable react/prop-types */
import { createContext, useEffect, useReducer, useState } from 'react';
import socket from '../helpers/socket';
import apiCall from '../helpers/apiCall';

import { CHINSALI_REGISTER_URL } from '../helpers/variables';

export const ChinsaliRegisterContext = createContext();

const ChinsaliRegisterReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SHIFT':
      return {
        shift: action.payload,
      };
    default:
      return state;
  }
};

export const ChinsaliRegisterContextProvider = ({ children }) => {
  const [shift, dispatch] = useReducer(ChinsaliRegisterReducer, {
    shift: null,
  });
  const [updatedStock, setUpdatedStock] = useState({});

  useEffect(() => {
    apiCall.get(CHINSALI_REGISTER_URL).then((response) => {
      sumReceivedAmounts(response.data);
    });
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.on('chinsaliregister', (data) => {
      dispatch({ type: 'SET_SHIFT', payload: data });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      socket.off('chinsaliregister');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  const sumReceivedAmounts = (data) => {
    if (data !== null) {
      // const sortedStock = data.stock.sort((a, b) =>
      //   a.name.localeCompare(b.name),
      // );
      // const updatedData = { ...data, stock: sortedStock };
      setUpdatedStock(data);
    }
  };

  useEffect(() => {
    sumReceivedAmounts(shift.shift);
  }, [shift.shift]);

  if (updatedStock === null) {
    return null;
  }

  return (
    <ChinsaliRegisterContext.Provider
      value={{ RegisterShift: updatedStock, dispatch }}>
      {children}
    </ChinsaliRegisterContext.Provider>
  );
};
