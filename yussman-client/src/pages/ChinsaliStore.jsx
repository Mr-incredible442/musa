import { useContext, useEffect } from 'react';
import { Container } from 'react-bootstrap';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import Stock from '../components/chinsaliStore/Stock';
import Issued from '../components/chinsaliStore/Issued';
import Received from '../components/chinsaliStore/Received';
import AllShifts from '../components/chinsaliStore/AllShifts';
import Final from '../components/chinsaliStore/Final';

import { AuthContext } from '../context/AuthContext';

import { ChinsaliStoreContextProvider } from '../context/ChinsaliStoreContext';

function Store() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    document.title = 'Yussman - Chinsali Store';
  }, []);

  return (
    <ChinsaliStoreContextProvider>
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
    </ChinsaliStoreContextProvider>
  );
}

export default Store;
