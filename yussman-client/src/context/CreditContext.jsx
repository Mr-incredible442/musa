import { createContext, useEffect, useReducer } from 'react';
import socket from '../helpers/socket';
import apiCall from '../helpers/apiCall';

import { CREDIT_URL } from '../helpers/variables';

export const CreditContext = createContext();
const creditReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CREDIT':
      return {
        credit: action.payload,
      };
    default:
      return state;
  }
};

// eslint-disable-next-line react/prop-types
export const CreditContextProvider = ({ children }) => {
  const [credit, dispatch] = useReducer(creditReducer, { credit: null });

  useEffect(() => {
    apiCall.get(CREDIT_URL).then((response) => {
      dispatch({ type: 'SET_CREDIT', payload: response.data });
    });
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.on('credit', (data) => {
      dispatch({ type: 'SET_SHIFT', payload: data });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      socket.off('credit');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  // console.log(credit.credit);

  return (
    <CreditContext.Provider value={{ credit: credit.credit, dispatch }}>
      {children}
    </CreditContext.Provider>
  );
};
