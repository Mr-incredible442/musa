/* eslint-disable react/prop-types */
import { createContext, useEffect, useReducer, useState } from 'react';
import socket from '../helpers/socket';
import apiCall from '../helpers/apiCall';

import { REPORT_URL } from '../helpers/variables';

export const ReportContext = createContext();

const initialState = {
  report: null,
};

const reportReducer = (state, action) => {
  switch (action.type) {
    case 'SET_REPORT':
      return {
        ...state,
        report: action.payload,
      };
    default:
      return state;
  }
};

export const ReportContextProvider = ({
  children,
  baseUrl = REPORT_URL,
  socketEvent = 'report',
  listPath = '/report',
}) => {
  const [state, dispatch] = useReducer(reportReducer, initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await apiCall.get(baseUrl);
        dispatch({ type: 'SET_REPORT', payload: response.data });
      } catch (err) {
        console.error('Failed to fetch report:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [baseUrl]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleReportUpdate = (data) => {
      dispatch({ type: 'SET_REPORT', payload: data });
    };

    socket.on(socketEvent, handleReportUpdate);
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError(err);
    });

    return () => {
      socket.off(socketEvent, handleReportUpdate);
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [socketEvent]);

  return (
    <ReportContext.Provider
      value={{
        report: state.report,
        loading,
        error,
        dispatch,
        baseUrl,
        listPath,
      }}>
      {children}
    </ReportContext.Provider>
  );
};
