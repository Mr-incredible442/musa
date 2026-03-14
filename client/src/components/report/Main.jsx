import { useContext, useMemo } from 'react';
import apiCall from '../../helpers/apiCall';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';

import EditCashIn from './modals/EditCashIn';
import AddCashOut from './modals/AddCashOut';
import AddCashIn from './modals/AddCashin';
import UpdateCashOut from './modals/UpdateCashOut';
import DeleteCashOut from './modals/DeleteCashOut';
import AddDate from './modals/AddDate';
import NextShift from './modals/NextShift';
import EditCashMobile from './modals/EditCashMobile';

import { ReportContext } from '../../context/ReportContext';

const CASH_IN_LABELS = {
  previousDayBalance: 'Previous Day Balance',
  shop: 'Shop',
};

const formatCashInLabel = (name = '') => {
  if (CASH_IN_LABELS[name]) return CASH_IN_LABELS[name];
  const spaced = name
    .replace(/([a-z])([A-Z0-9])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .trim();
  return spaced
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const formatCurrency = (value) => {
  const n = Number(value) || 0;
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

function Main() {
  const { report, loading, error, baseUrl } = useContext(ReportContext);

  const { cashInTotal, cashOutTotal, cashMobileTotal } = useMemo(() => {
    const cashInTotal = report?.cashIn?.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const cashOutTotal = report?.cashOut?.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const cashMobileTotal = report?.cashMobile?.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    return { cashInTotal, cashOutTotal, cashMobileTotal };
  }, [report]);

  const handleDeleteDate = () => {
    if (report?._id) apiCall.post(`${baseUrl}/${report._id}/deletedate`).then(() => {});
  };

  const difference = (cashInTotal || 0) - (cashOutTotal || 0);
  const result = difference - cashMobileTotal;

  if (loading) return <Container className="py-5">Loading...</Container>;
  if (error) return <Container className="py-5"><div className="text-danger">Failed to load report</div></Container>;
  if (!report) return <Container className="py-5">No report available</Container>;

  return (
    <Container>
      <div className="d-flex justify-content-evenly align-items-center">
        <h5 className="my-3">
          Date :{' '}
          <span style={{ cursor: 'pointer', userSelect: 'none' }} onDoubleClick={handleDeleteDate}>
            {report.date ? <span>{report.date}</span> : <AddDate id={report._id} />}
          </span>
        </h5>
        <h5>Difference : K <span className={difference < 0 ? 'text-danger' : ''}>{formatCurrency(difference)}</span></h5>
        <h5>{cashMobileTotal > difference ? 'Extra Cash' : 'Short Cash'}: K <span className={result > 0 ? 'text-danger' : 'text-success'}>{formatCurrency(Math.abs(result))}</span></h5>
        <OverlayTrigger placement="top" overlay={<Tooltip id="next-shift-tooltip">Please add a date first to enable the next shift button.</Tooltip>}>
          <span><NextShift disabled={!report.date} /></span>
        </OverlayTrigger>
      </div>
      <hr />
      <Row>
        <Col>
          <h6 className="my-1 text-center">Cash In</h6>
          <Table responsive bordered size="sm">
            <thead>
              <tr>
                <th className="d-flex ps-5 align-items-center justify-content-between fw-bold"><span>Total</span></th>
                <th className="fw-bold">K {formatCurrency(cashInTotal)}</th>
                <th className="text-center"><AddCashIn id={report._id} /></th>
              </tr>
              <tr><th>Name</th><th>Amount</th><th className="text-center">Action</th></tr>
            </thead>
            <tbody>
              {report.cashIn?.map((item, index) => (
                <tr key={item.name || index}>
                  <td>{formatCashInLabel(item.name)}</td>
                  <td>K {formatCurrency(item.amount)}</td>
                  <td className="d-flex gap-2 justify-content-center align-items-center">
                    <EditCashIn field={item.name} fieldIndex={index} id={report._id} value={item.amount} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <h6 className="my-1 text-center">Cash / Mobile Money</h6>
          <Table responsive bordered size="sm">
            <thead>
              <tr>
                <th className="d-flex ps-5 align-items-center justify-content-between fw-bold"><span>Total</span></th>
                <th className="fw-bold">K {formatCurrency(cashMobileTotal)}</th>
                <th className="text-center"></th>
              </tr>
              <tr><th>Name</th><th>Amount</th><th className="text-center">Action</th></tr>
            </thead>
            <tbody>
              {report.cashMobile?.map((item, index) => (
                <tr key={item.name || index}>
                  <td>{formatCashInLabel(item.name)}</td>
                  <td>K {formatCurrency(item.amount)}</td>
                  <td className="d-flex gap-2 justify-content-center align-items-center">
                    <EditCashMobile field={item.name} fieldIndex={index} id={report._id} value={item.amount} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
        <Col>
          <h6 className="my-1 text-center">Cash Out</h6>
          <Table responsive bordered size="sm">
            <thead>
              <tr>
                <th className="text-end fw-bold">Total</th>
                <th className="fw-bold">K {formatCurrency(cashOutTotal)}</th>
                <th className="text-center"><AddCashOut id={report._id} /></th>
              </tr>
              <tr><th>Description</th><th>Amount</th><th className="text-center">Action</th></tr>
            </thead>
            <tbody>
              {report.cashOut?.length ? (
                report.cashOut.map((item) => (
                  <tr key={item._id}>
                    <td className="text-capitalize">{item.description}</td>
                    <td>K {formatCurrency(item.amount)}</td>
                    <td className="d-flex gap-2 justify-content-center align-items-center">
                      <UpdateCashOut id={report._id} cashOutId={item._id} description={item.description} amount={item.amount} />
                      <DeleteCashOut id={report._id} cashOutId={item._id} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="text-center text-muted">No cash out entries</td></tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default Main;
