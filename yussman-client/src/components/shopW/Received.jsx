/* eslint-disable react/prop-types */
import Table from 'react-bootstrap/Table';
import { Container, Form, InputGroup } from 'react-bootstrap';
// import Form from 'react-bootstrap/Form';

import { useCallback, useContext, useEffect, useState } from 'react';
import { ShopWContext } from '../../context/ShopWContext';

import ReceivedModal from './modals/ReceivedModal';
import Delete from './modals/Delete';

const endpoint = `deletereceived`;

function Received({ activeTab }) {
  const [received, setReceived] = useState([]);
  const [stock, setStock] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [shouldAutofocus, setShouldAutofocus] = useState(false);

  const { shopWShift } = useContext(ShopWContext);

  useEffect(() => {
    if (Object.keys(shopWShift).length !== 0) {
      setReceived(shopWShift.received);
      setStock(shopWShift.stock);
      setFilteredStock(shopWShift.stock);
      setShouldAutofocus(true);
    }
  }, [shopWShift]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const searchInput = document.getElementById('searchInput');
      const resultsList = document.getElementById('resultsList');

      if (
        searchInput &&
        resultsList &&
        !searchInput.contains(event.target) &&
        !resultsList.contains(event.target)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();

    const filteredResults = stock.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.code.toString().includes(searchTerm),
    );
    setFilteredStock(filteredResults);
    setShowResults(true);
    setShowResults(!!searchTerm);
  };

  const handleListClick = (stockItem) => {
    setSelectedResult(stockItem);
    setShowResults(false);
  };

  const handleCloseModal = () => {
    setSelectedResult(null);
    setSearchInputValue('');
    setShouldAutofocus(true);
  };

  const handleAutoFocus = useCallback(() => {
    const searchInput = document.getElementById('searchInput');
    if (activeTab === 'received' && searchInput) {
      searchInput.focus();
    }
    if (shouldAutofocus && activeTab === 'received') {
      if (searchInput) {
        searchInput.focus();
        setShouldAutofocus(false);
      }
    }
  }, [activeTab, shouldAutofocus]);

  useEffect(() => {
    handleAutoFocus();
  }, [activeTab, handleAutoFocus]);

  useEffect(() => {
    handleAutoFocus();
  }, [activeTab, shouldAutofocus, handleAutoFocus]);

  return (
    <Container>
      <div className='w-50'>
        <Form onSubmit={(e) => e.preventDefault()}>
          <InputGroup className='mb-3'>
            <Form.Control
              type='text'
              autoComplete='off'
              required
              autoFocus
              placeholder='Code'
              name='search'
              id='searchInput'
              onChange={(e) => {
                handleSearch(e);
                setSearchInputValue(e.target.value);
              }}
              value={searchInputValue}
            />
            <ReceivedModal
              show={selectedResult !== null}
              result={selectedResult}
              handleClose={handleCloseModal}
              id={shopWShift._id}
            />
          </InputGroup>
          {showResults && (
            <ul
              id='resultsList'
              className='list-group'
              style={{
                position: 'absolute',
                zIndex: 1,
                width: '50%',
                cursor: 'pointer',
              }}>
              {filteredStock.map((stockItem) => (
                <li
                  key={stockItem.code}
                  className='list-group-item text-capitalize'
                  onClick={() => handleListClick(stockItem)}>
                  {stockItem.code} - {stockItem.name}
                </li>
              ))}
            </ul>
          )}
        </Form>
      </div>
      <Table responsive className='text-center' bordered size='sm'>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>A</th>
          </tr>
        </thead>
        <tbody className='table-group-divider'>
          {received.map((received) => (
            <tr key={received._id} id={received._id}>
              <td>{received.code}</td>
              <td className='text-capitalize'>{received.name}</td>
              <td>{received.amount}</td>
              <td className='d-flex justify-content-center align-items-center'>
                <Delete
                  endpoint={endpoint}
                  id={received._id}
                  shiftId={shopWShift._id}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default Received;
