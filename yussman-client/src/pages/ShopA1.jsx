import { useEffect, useContext, useState } from 'react';

import { Col, Container, Row } from 'react-bootstrap';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import Stock from '../components/shopA1/Stock';
import Received from '../components/shopA1/Received';
import Credit from '../components/shopA1/Credit';
import CashAndChange from '../components/shopA1/Cash';
import Final from '../components/shopA1/Final';
import AllShifts from '../components/shopA1/AllShifts';

import { AuthContext } from '../context/AuthContext';

import { ShopA1ContextProvider } from '../context/ShopA1Context';

function ShopA1() {
  const [activeTab, setActiveTab] = useState('stock');

  const { user } = useContext(AuthContext);

  useEffect(() => {
    document.title = 'Yussman - Shop A1';
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
    <ShopA1ContextProvider>
      <Container fluid className='py-3'>
        <Tabs
          activeKey={activeTab}
          onSelect={handleTabSelect}
          id='shopA1'
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
    </ShopA1ContextProvider>
  );
}

export default ShopA1;
