import { useContext, useEffect } from 'react';
import { Container } from 'react-bootstrap';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import Stock from '../components/bomaStore/Stock';
import Issued from '../components/bomaStore/Issued';
import Received from '../components/bomaStore/Received';
import AllShifts from '../components/bomaStore/AllShifts';
import Final from '../components/bomaStore/Final';

import { AuthContext } from '../context/AuthContext';

import { BomaStoreContextProvider } from '../context/BomaStoreContext';

function Store() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    document.title = 'Yussman - Boma Store';
  }, []);

  return (
    <BomaStoreContextProvider>
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
    </BomaStoreContextProvider>
  );
}

export default Store;
