import { useEffect, useContext, useState } from 'react';

import { Col, Container, Row } from 'react-bootstrap';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import Stock from '../components/shopW/Stock';
import Received from '../components/shopW/Received';
import Credit from '../components/shopW/Credit';
import CashAndChange from '../components/shopW/Cash';
import Final from '../components/shopW/Final';
import AllShifts from '../components/shopW/AllShifts';

import { AuthContext } from '../context/AuthContext';

import { ShopWContextProvider } from '../context/ShopWContext';

function ShopW() {
  const [activeTab, setActiveTab] = useState('stock');

  const { user } = useContext(AuthContext);

  useEffect(() => {
    document.title = 'Yussman - Shop W';
  }, []);

  const handleTabSelect = (selectedTab) => {
    setActiveTab(selectedTab);
  };

  const handleReceivedModalClose = () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.focus();
    }
  };

  return (
    <ShopWContextProvider>
      <Container fluid className='py-3'>
        <Tabs
          activeKey={activeTab}
          onSelect={handleTabSelect}
          id='shopW'
          className='mb-3'
          justify>
          <Tab eventKey='stock' title='Stock'>
            <Stock />
          </Tab>
          <Tab eventKey='received' title='Received'>
            <Received
              activeTab={activeTab}
              onModalClose={handleReceivedModalClose}
            />
          </Tab>
          <Tab eventKey='credit' title='Cash / Credit'>
            <Row>
              <Col>
                <CashAndChange />
              </Col>
              <Col>
                <Credit />
              </Col>
            </Row>
          </Tab>
          <Tab eventKey='final' title='Final'>
            <Final />
          </Tab>
          {user !== null && user.role === 'admin' && (
            <Tab eventKey='allShifts' title='All Shifts'>
              <AllShifts />
            </Tab>
          )}
        </Tabs>
      </Container>
    </ShopWContextProvider>
  );
}

export default ShopW;
