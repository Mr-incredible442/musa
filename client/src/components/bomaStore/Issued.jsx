import { useContext, useEffect, useState } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';

import { Container, Form, Table } from 'react-bootstrap';

import { BomaStoreContext } from '../../context/BomaStoreContext';
import { AuthContext } from '../../context/AuthContext';

import AddIssued from './modals/IssuedModal';
import DeleteModal from './modals/DeleteModal';

function Issued() {
  const [issued, setIssued] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const { storeShift } = useContext(BomaStoreContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (Object.keys(storeShift).length !== 0) {
      setIssued(storeShift.issued);
    }
  }, [storeShift]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    const results = storeShift.stock.filter(
      (item) =>
        item.name.toLowerCase().includes(term.toLowerCase()) ||
        item.code.toString().includes(term),
    );

    setSearchResults(results);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <Container className='my-3'>
      <div className='pb-3 w-50 '>
        <Form.Control
          type='text'
          placeholder='Search'
          value={searchTerm}
          onChange={handleSearch}
          autoFocus
        />
        {searchTerm && (
          <ListGroup className='position-absolute w-50 mt-1'>
            {searchResults.map((item) => (
              <AddIssued
                key={item._id}
                product={item}
                storeShift={storeShift}
                clear={handleClearSearch}>
                <ListGroup.Item key={item._id} action>
                  {item.code} - {item.name}
                </ListGroup.Item>
              </AddIssued>
            ))}
          </ListGroup>
        )}
      </div>
      <Table responsive bordered size='sm' className='text-center'>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>To</th>
            {user && user.role === 'admin' && <th>Action</th>}
          </tr>
        </thead>
        <tbody className='table-group-divider'>
          {issued.map((item) => (
            <tr key={item._id}>
              <td>{item.code}</td>
              <td className='text-capitalize'>{item.name}</td>
              <td>{item.quantity}</td>
              <td className='text-capitalize'>{item.to}</td>
              {user && user.role === 'admin' && (
                <td className='d-flex justify-content-center align-items-center'>
                  <DeleteModal
                    endpoint={'deleteissued'}
                    id={item._id}
                    shiftId={storeShift._id}
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

export default Issued;
