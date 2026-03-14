import { useCallback, useContext, useEffect, useState } from 'react';
import apiCall from '../../helpers/apiCall';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import { Button, Spinner, Alert } from 'react-bootstrap';
import Pagination from 'react-bootstrap/Pagination';
import { Link } from 'react-router-dom';

import { ReportContext } from '../../context/ReportContext';
import DeleteShift from './modals/DeleteShift';

function All() {
  const { baseUrl, listPath } = useContext(ReportContext);
  const today = new Date();
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = today.getFullYear();

  const [reports, setReports] = useState(null);
  const [currentPage, setCurrentPage] = useState(
    `/${currentYear}/${currentMonth}`,
  );
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(() => {
    setLoading(true);
    setError(null);
    apiCall
      .get(`${baseUrl}/paginatedreports${currentPage}`)
      .then((res) => {
        setReports(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setError('Failed to load reports. Please try again.');
        setLoading(false);
      });
  }, [currentPage, baseUrl]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  let sortedReports = null;
  if (reports !== null) {
    sortedReports = [...reports.reports].sort((a, b) => {
      if (a.status === 'current' && b.status !== 'current') return -1;
      if (a.status !== 'current' && b.status === 'current') return 1;

      const dateA = a.date ? new Date(a.date).getTime() : null;
      const dateB = b.date ? new Date(b.date).getTime() : null;
      if (!dateA && !dateB) return 0;
      if (!dateA) return -1;
      if (!dateB) return 1;
      return dateB - dateA;
    });
  }

  const getCurrentYearMonth = () => {
    const parts = currentPage.replace('/', '').split('/');
    return { year: parseInt(parts[0]), month: parseInt(parts[1]) };
  };

  const getCurrentIndex = () => {
    if (!reports?.distinctYearsMonths) return -1;
    const { year, month } = getCurrentYearMonth();
    return reports.distinctYearsMonths.findIndex(
      (item) => item.year === year && item.month === month,
    );
  };

  const handlePrevious = () => {
    if (!reports?.distinctYearsMonths) return;
    const currentIndex = getCurrentIndex();
    if (currentIndex > 0) {
      const prevItem = reports.distinctYearsMonths[currentIndex - 1];
      const formattedMonth = prevItem.month.toString().padStart(2, '0');
      setCurrentPage(`/${prevItem.year}/${formattedMonth}`);
    }
  };

  const handleNext = () => {
    if (!reports?.distinctYearsMonths) return;
    const currentIndex = getCurrentIndex();
    if (currentIndex < reports.distinctYearsMonths.length - 1) {
      const nextItem = reports.distinctYearsMonths[currentIndex + 1];
      const formattedMonth = nextItem.month.toString().padStart(2, '0');
      setCurrentPage(`/${nextItem.year}/${formattedMonth}`);
    }
  };

  const handleFirst = () => {
    if (
      !reports?.distinctYearsMonths ||
      reports.distinctYearsMonths.length === 0
    )
      return;
    const firstItem = reports.distinctYearsMonths[0];
    const formattedMonth = firstItem.month.toString().padStart(2, '0');
    setCurrentPage(`/${firstItem.year}/${formattedMonth}`);
  };

  const handleLast = () => {
    if (
      !reports?.distinctYearsMonths ||
      reports.distinctYearsMonths.length === 0
    )
      return;
    const lastItem =
      reports.distinctYearsMonths[reports.distinctYearsMonths.length - 1];
    const formattedMonth = lastItem.month.toString().padStart(2, '0');
    setCurrentPage(`/${lastItem.year}/${formattedMonth}`);
  };

  const handleCurrentPage = (year, month) => {
    const formattedMonth = month.toString().padStart(2, '0');
    setCurrentPage(`/${year}/${formattedMonth}`);
  };

  const formatMonthDisplay = (year, month) => {
    const date = new Date(year, month - 1);
    const monthName = date.toLocaleString('default', { month: 'short' });
    return `${monthName} ${year}`;
  };

  const currentIndex = getCurrentIndex();
  const canGoPrevious = currentIndex > 0;
  const canGoNext =
    currentIndex < (reports?.distinctYearsMonths?.length ?? 0) - 1;
  const canGoFirst = currentIndex > 0;
  const canGoLast =
    currentIndex < (reports?.distinctYearsMonths?.length ?? 0) - 1;

  const getVisiblePaginationItems = () => {
    if (!reports?.distinctYearsMonths) return [];

    const totalItems = reports.distinctYearsMonths.length;
    const maxVisible = 7;
    const sideItems = 2;

    if (totalItems <= maxVisible) {
      return reports.distinctYearsMonths.map((date, index) => ({
        date,
        index,
        type: 'item',
      }));
    }

    const result = [];
    const firstIndex = 0;
    const lastIndex = totalItems - 1;

    result.push({
      date: reports.distinctYearsMonths[firstIndex],
      index: firstIndex,
      type: 'item',
    });

    let startIndex = Math.max(1, currentIndex - sideItems);
    let endIndex = Math.min(lastIndex - 1, currentIndex + sideItems);

    if (currentIndex <= sideItems + 1) {
      endIndex = Math.min(lastIndex - 1, maxVisible - 2);
    }

    if (currentIndex >= totalItems - sideItems - 2) {
      startIndex = Math.max(1, totalItems - maxVisible + 1);
    }

    if (startIndex > firstIndex + 1) {
      result.push({ type: 'ellipsis', position: 'start' });
    }

    for (let i = startIndex; i <= endIndex; i++) {
      result.push({
        date: reports.distinctYearsMonths[i],
        index: i,
        type: 'item',
      });
    }

    if (endIndex < lastIndex - 1) {
      result.push({ type: 'ellipsis', position: 'end' });
    }

    if (lastIndex !== firstIndex && lastIndex > endIndex) {
      result.push({
        date: reports.distinctYearsMonths[lastIndex],
        index: lastIndex,
        type: 'item',
      });
    }

    return result;
  };

  if (loading && reports === null) {
    return (
      <Container
        className='d-flex justify-content-center align-items-center py-4'
        style={{ minHeight: '400px' }}>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error && reports === null) {
    return (
      <Container className='py-4'>
        <Alert variant='danger' className='mt-3'>
          {error}
          <Button
            variant='outline-danger'
            size='sm'
            className='ms-2'
            onClick={fetchReports}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className='py-4'>
      <div className='d-flex justify-content-center align-items-center gap-2 my-3 position-relative'>
        {loading && (
          <div
            className='position-absolute'
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}>
            <Spinner animation='border' size='sm' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </Spinner>
          </div>
        )}
        {reports?.distinctYearsMonths && (
          <Pagination
            size='sm'
            className='mb-0'
            style={{ opacity: loading ? 0.5 : 1 }}>
            <Pagination.First
              onClick={handleFirst}
              disabled={!canGoFirst || loading}
              aria-label='First month (newest)'
            />
            <Pagination.Prev
              onClick={handlePrevious}
              disabled={!canGoPrevious || loading}
              aria-label='Previous month'
            />
            {getVisiblePaginationItems().map((item, idx) => {
              if (item.type === 'ellipsis') {
                return (
                  <Pagination.Ellipsis
                    key={`ellipsis-${item.position}-${idx}`}
                  />
                );
              }

              const { date, index } = item;
              const formattedMonth = date.month.toString().padStart(2, '0');
              const formattedDate = `/${date.year}/${formattedMonth}`;
              const isActive = formattedDate === currentPage;

              return (
                <Pagination.Item
                  onClick={() =>
                    !loading && handleCurrentPage(date.year, date.month)
                  }
                  active={isActive}
                  disabled={loading}
                  key={`${date.year}-${date.month}-${index}`}
                  aria-label={`View reports for ${formatMonthDisplay(
                    date.year,
                    date.month,
                  )}`}
                  aria-current={isActive ? 'page' : undefined}>
                  {formatMonthDisplay(date.year, date.month)}
                </Pagination.Item>
              );
            })}
            <Pagination.Next
              onClick={handleNext}
              disabled={!canGoNext || loading}
              aria-label='Next month'
            />
            <Pagination.Last
              onClick={handleLast}
              disabled={!canGoLast || loading}
              aria-label='Last month (oldest)'
            />
          </Pagination>
        )}
      </div>
      {error && (
        <Alert
          variant='warning'
          dismissible
          onClose={() => setError(null)}
          className='mt-2'>
          {error}
        </Alert>
      )}
      {loading && reports !== null && (
        <div className='d-flex justify-content-center my-3'>
          <Spinner animation='border' size='sm' role='status'>
            <span className='visually-hidden'>Loading reports...</span>
          </Spinner>
        </div>
      )}
      {!loading && sortedReports && sortedReports.length === 0 ? (
        <Alert variant='info' className='text-center mt-3'>
          No reports found for{' '}
          {formatMonthDisplay(
            getCurrentYearMonth().year,
            getCurrentYearMonth().month,
          )}
          .
        </Alert>
      ) : (
        <Table
          responsive
          bordered
          className='text-center text-capitalize'
          size='sm'
          style={{ opacity: loading ? 0.5 : 1 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedReports?.map((report) => (
              <tr key={report._id}>
                <td>{report.date}</td>
                <td>{report.status}</td>
                <td className='d-flex justify-content-center'>
                  {report.status === 'current' ? (
                    <DeleteShift id={report._id} fetchReports={fetchReports} />
                  ) : (
                    <Link to={`${listPath}/${report._id}`}>
                      <Button variant='outline-primary' size='sm'>
                        V
                      </Button>
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default All;
