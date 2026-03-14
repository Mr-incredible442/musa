/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiCall from '../../helpers/apiCall';
import { REPORT_URL } from '../../helpers/variables';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Button, Table } from 'react-bootstrap';
import { BsArrowLeftShort } from 'react-icons/bs';

const CASH_IN_LABELS = {
  previousDayBalance: 'Previous Day Balance',
  shop: 'Shop',
};

const formatCashInLabel = (name = '') => {
  if (CASH_IN_LABELS[name]) {
    return CASH_IN_LABELS[name];
  }

  const spaced = name
    .replace(/([a-z])([A-Z0-9])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .trim();

  return spaced
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatCurrency = (value) => {
  const number = Number(value) || 0;
  return number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

function ReportDetail() {
  const [report, setReport] = useState(null);
  const { id } = useParams();
  const baseUrl = REPORT_URL;
  const listPath = '/report';

  useEffect(() => {
    apiCall.get(`${baseUrl}/${id}`).then((res) => {
      setReport(res.data);
    });
  }, [id, baseUrl]);

  const { cashInTotal, cashOutTotal, cashMobileTotal } = useMemo(() => {
    const cashInTotal = report?.cashIn?.reduce(
      (acc, item) => acc + (Number(item.amount) || 0),
      0,
    );
    const cashOutTotal = report?.cashOut?.reduce(
      (acc, item) => acc + (Number(item.amount) || 0),
      0,
    );
    const cashMobileTotal = report?.cashMobile?.reduce(
      (acc, item) => acc + (Number(item.amount) || 0),
      0,
    );

    return {
      cashInTotal,
      cashOutTotal,
      cashMobileTotal,
    };
  }, [report]);
  const difference = (cashInTotal || 0) - (cashOutTotal || 0);

  if (!report) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <div className='d-flex justify-content-evenly align-items-center'>
        <Link to={listPath}>
          <Button variant='outline-info' size='sm' className='m-3'>
            <BsArrowLeftShort />
            Back
          </Button>
        </Link>
        <h5 className='my-3'>
          Date : <span>{report.date}</span>
        </h5>
        <h5>
          Difference :{' K '}
          <span className={difference < 0 ? 'text-danger' : ''}>
            {formatCurrency(difference)}
          </span>
        </h5>
      </div>
      <hr />
      <Row>
        <Col>
          <h6 className='my-1 text-center '>Cash In</h6>
          <Table responsive bordered size='sm'>
            <thead>
              <tr>
                <th className='d-flex ps-5 align-items-center justify-content-between fw-bold'>
                  <span>Total</span>
                </th>
                <th className='fw-bold'>K {formatCurrency(cashInTotal)}</th>
              </tr>
              <tr>
                <th>Name</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {report.cashIn?.map((item, index) => (
                <tr key={item.name || index}>
                  <td>{formatCashInLabel(item.name)}</td>
                  <td>K {formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <h6 className='my-1 text-center '>Cash / Mobile Money</h6>
          <Table responsive bordered size='sm'>
            <thead>
              <tr>
                <th className='d-flex ps-5 align-items-center justify-content-between fw-bold'>
                  <span>Total</span>
                </th>
                <th className='fw-bold'>K {formatCurrency(cashMobileTotal)}</th>
              </tr>
              <tr>
                <th>Name</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {report.cashMobile?.map((item, index) => (
                <tr key={item.name || index}>
                  <td>{formatCashInLabel(item.name)}</td>
                  <td>K {formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
        <Col>
          <h6 className='my-1 text-center '>Cash Out</h6>
          <Table responsive bordered size='sm'>
            <thead>
              <tr>
                <th className='d-flex ps-5 align-items-center justify-content-between fw-bold'>
                  <span>Total</span>
                </th>
                <th className='fw-bold'>K {formatCurrency(cashOutTotal)}</th>
              </tr>
              <tr>
                <th>Name</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {report.cashOut?.map((item, index) => (
                <tr key={item._id || index}>
                  <td className='text-capitalize'>{item.description || ''}</td>
                  <td>K {formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default ReportDetail;
