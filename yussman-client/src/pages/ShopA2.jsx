import { useEffect, useContext, useState } from 'react';

import { Col, Container, Row } from 'react-bootstrap';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import Stock from '../components/shopA2/Stock';
import Received from '../components/shopA2/Received';
import Credit from '../components/shopA2/Credit';
import CashAndChange from '../components/shopA2/Cash';
import Final from '../components/shopA2/Final';
import AllShifts from '../components/shopA2/AllShifts';

import { AuthContext } from '../context/AuthContext';

import { ShopA2ContextProvider } from '../context/ShopA2Context';

function ShopA2() {
  const [activeTab, setActiveTab] = useState('stock');

  const { user } = useContext(AuthContext);

  useEffect(() => {
    document.title = 'Yussman - Shop A2';
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
    <ShopA2ContextProvider>
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
    </ShopA2ContextProvider>
  );
}

export default ShopA2;

// Total KGs : 23
// Total Amount : K 575
// Date : 2024-01-05

// Collection Date : 2024-01-08
