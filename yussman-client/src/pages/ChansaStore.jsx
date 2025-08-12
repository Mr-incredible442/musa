import { useContext, useEffect } from 'react';
import { Container } from 'react-bootstrap';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import Stock from '../components/chansaStore/Stock';
import Issued from '../components/chansaStore/Issued';
import Received from '../components/chansaStore/Received';
import AllShifts from '../components/chansaStore/AllShifts';
import Final from '../components/chansaStore/Final';

import { AuthContext } from '../context/AuthContext';

import { ChansaStoreContextProvider } from '../context/ChansaStoreContext';

function Store() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    document.title = 'Yussman - Chansa Store';
  }, []);

  return (
    <ChansaStoreContextProvider>
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
    </ChansaStoreContextProvider>
  );
}

export default Store;
