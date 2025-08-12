import { createContext, useEffect, useReducer } from 'react';
import socket from '../helpers/socket';
import apiCall from '../helpers/apiCall';
import { GOAT_LOCAL_URL } from '../helpers/variables';

export const GoatContext = createContext();
const goatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SUPPLIERS':
      return {
        suppliers: action.payload,
      };
    default:
      return state;
  }
};

// eslint-disable-next-line react/prop-types
export const GoatContextProvider = ({ children }) => {
  const [suppliers, dispatch] = useReducer(goatReducer, { suppliers: null });

  useEffect(() => {
    apiCall.get(GOAT_LOCAL_URL).then((res) => {
      dispatch({ type: 'SET_SUPPLIERS', payload: res.data });
    });

    if (!socket.connected) {
      socket.connect();
    }
    socket.on('suppliers', (data) => {
      dispatch({ type: 'SET_SUPPLIERS', payload: data });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      socket.off('suppliers');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  return (
    <GoatContext.Provider value={[suppliers.suppliers, dispatch]}>
      {children}
    </GoatContext.Provider>
  );
};
