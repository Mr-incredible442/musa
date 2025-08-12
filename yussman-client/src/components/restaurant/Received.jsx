/* eslint-disable react/prop-types */
import Table from 'react-bootstrap/Table';
import { Container, Form, InputGroup } from 'react-bootstrap';

import { useCallback, useContext, useEffect, useState } from 'react';
import { RestaurantContext } from '../../context/RestaurantContext';
import { AuthContext } from '../../context/AuthContext';

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

  const [activeIndex, setActiveIndex] = useState(-1); // -1 means no selection

  const { shift } = useContext(RestaurantContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (Object.keys(shift).length !== 0) {
      setReceived(shift.received);
      setStock(shift.stock);
      setFilteredStock(shift.stock);
      setShouldAutofocus(true);
    }
  }, [shift]);

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
    setActiveIndex(-1);
    setShowResults(!!searchTerm);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' && activeIndex < filteredStock.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else if (e.key === 'ArrowUp' && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleListClick(filteredStock[activeIndex]);
    }
  };

  const handleListClick = (stockItem) => {
    setSelectedResult(stockItem);
    setShowResults(false);
    setActiveIndex(-1);
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
              onKeyDown={handleKeyDown}
              value={searchInputValue}
            />
            <ReceivedModal
              show={selectedResult !== null}
              result={selectedResult}
              handleClose={handleCloseModal}
              id={shift._id}
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
              {filteredStock.map((stockItem, index) => (
                <li
                  key={stockItem.code}
                  className={`list-group-item text-capitalize ${
                    index === activeIndex ? 'active' : ''
                  }`}
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
            {user !== null && user.role === 'admin' && <th>A</th>}
          </tr>
        </thead>
        <tbody className='table-group-divider'>
          {received.map((received) => (
            <tr key={received._id} id={received._id}>
              <td>{received.code}</td>
              <td className='text-capitalize'>{received.name}</td>
              <td>{received.amount}</td>
              {user !== null && user.role === 'admin' && (
                <td className='d-flex justify-content-center align-items-center'>
                  <Delete
                    endpoint={endpoint}
                    id={received._id}
                    shiftId={shift._id}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default Received;
