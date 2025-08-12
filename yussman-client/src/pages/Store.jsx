import { useContext, useEffect } from 'react';
import { Container } from 'react-bootstrap';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import Stock from '../components/store/Stock';
import Issued from '../components/store/Issued';
import Received from '../components/store/Received';
import AllShifts from '../components/store/AllShifts';
import Final from '../components/store/Final';

import { AuthContext } from '../context/AuthContext';

import { StoreContextProvider } from '../context/StoreContext';

function Store() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    document.title = 'Yussman - Store';
  }, []);

  return (
    <StoreContextProvider>
      <Container fluid className='py-3'>
        <Tabs justify>
          <Tab eventKey='stock' title='Stock'>
            <Stock />
          </Tab>
          <Tab eventKey='issued' title='Issued / Out'>
            <Issued />
          </Tab>
          <Tab eventKey='received' title='Received / In'>
            <Received />
          </Tab>
          <Tab eventKey='final' title='Final'>
            <Final />
          </Tab>
          {user && user.role === 'admin' && (
            <Tab eventKey='allShifts' title='All Shifts'>
              <AllShifts />
            </Tab>
          )}
        </Tabs>
      </Container>
    </StoreContextProvider>
  );
}

export default Store;
