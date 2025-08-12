import { useEffect } from 'react';

import { Container, Tab, Tabs } from 'react-bootstrap';
import Unpaid from '../components/credit/Unpaid';
import Paid from '../components/credit/Paid';

import { CreditContextProvider } from '../context/CreditContext';

function Credit() {
  useEffect(() => {
    document.title = 'Yussman - Credit';
  }, []);

  return (
    <CreditContextProvider>
      <Container className='py-4'>
        <Tabs justify>
          <Tab eventKey='unpaid' title='Unpaid'>
            <Unpaid />
          </Tab>
          <Tab eventKey='paid' title='Paid'>
            <Paid />
          </Tab>
        </Tabs>
      </Container>
    </CreditContextProvider>
  );
}

export default Credit;
