import { useEffect, useState } from 'react';
import apiCall from '../helpers/apiCall';
import { LOGS_URL } from '../helpers/variables';
import { Button, Container, Table } from 'react-bootstrap';
import TablePlaceholder from '../utils/TablePlaceholder';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (pg) => {
    setLoading(true);
    const { data } = await apiCall(`${LOGS_URL}?page=${pg}`);
    setLogs(data.logs);
    setTotalPages(data.totalPages);
    setLoading(false);
  };
  useEffect(() => {
    document.title = 'Yussman - Logs';
    fetchLogs(page);
  }, [page]);

  //handle pagination
  const handleNextPage = () => {
    // Ensure the page number is not greater than the total number of pages
    if (page >= totalPages) return;

    setPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    // Ensure the page number is not less than 1
    if (page <= 1) return;

    setPage((prevPage) => prevPage - 1);
  };

  const handleFirstPage = () => {
    setPage(1);
  };

  const handleLastPage = () => {
    setPage(totalPages);
  };

  return (
    <Container>
      <div className='d-flex justify-content-evenly mt-3'>
        <Button onClick={handleFirstPage} size='sm' variant='outline-info'>
          First
        </Button>
        <Button onClick={handlePrevPage} size='sm' variant='outline-info'>
          Prev page
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button onClick={handleNextPage} size='sm' variant='outline-info'>
          Next page
        </Button>
        <Button onClick={handleLastPage} size='sm' variant='outline-info'>
          Last
        </Button>
      </div>

      <Table responsive size='sm' className='text-center mt-3'>
        <thead>
          <tr>
            <th>#</th>
            <th>IP</th>
            <th>Country</th>
            <th>OS</th>
            <th>Timestamp</th>
            <th>Status</th>
            <th>Method</th>
            <th>UserName</th>
            <th>URL</th>
          </tr>
        </thead>
        {loading ? (
          <TablePlaceholder cols={9} rows={10} />
        ) : (
          <tbody className='table-group-divider'>
            {logs.map((log, index) => (
              <tr key={log._id}>
                <td>{index + 1}</td>
                <td>{log.ip.split(',').join(', ')}</td>
                <td>{log.headers['cf-ipcountry']}</td>
                <td>{log.headers['sec-ch-ua-platform']}</td>
                <td>{log.timestamp}</td>
                <td>{log.statusCode}</td>
                <td>{log.method}</td>
                <td>{log.userName}</td>
                <td>{log.url.split('/').join(' / ')}</td>
              </tr>
            ))}
          </tbody>
        )}
      </Table>
    </Container>
  );
}

export default Logs;
