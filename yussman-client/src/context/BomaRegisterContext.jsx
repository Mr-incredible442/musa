/* eslint-disable react/prop-types */
import { createContext, useEffect, useReducer, useState } from 'react';
import socket from '../helpers/socket';
import apiCall from '../helpers/apiCall';

import { BOMA_REGISTER_URL } from '../helpers/variables';

export const BomaRegisterContext = createContext();

const BomaRegisterReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SHIFT':
      return {
        shift: action.payload,
      };
    default:
      return state;
  }
};

export const BomaRegisterContextProvider = ({ children }) => {
  const [shift, dispatch] = useReducer(BomaRegisterReducer, {
    shift: null,
  });
  const [updatedStock, setUpdatedStock] = useState({});

  useEffect(() => {
    apiCall.get(BOMA_REGISTER_URL).then((response) => {
      sumReceivedAmounts(response.data);
    });
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.on('bomaregister', (data) => {
      dispatch({ type: 'SET_SHIFT', payload: data });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      socket.off('bomaregister');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  const sumReceivedAmounts = (data) => {
    if (data !== null) {
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
    <BomaRegisterContext.Provider
      value={{ RegisterShift: updatedStock, dispatch }}>
      {children}
    </BomaRegisterContext.Provider>
  );
};
