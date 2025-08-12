import { useEffect, useContext, useState } from 'react';

import { Col, Container, Row } from 'react-bootstrap';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import Stock from '../components/shopB/Stock';
import Received from '../components/shopB/Received';
import Credit from '../components/shopB/Credit';
import CashAndChange from '../components/shopB/Cash';
import Final from '../components/shopB/Final';
import AllShifts from '../components/shopB/AllShifts';

import { AuthContext } from '../context/AuthContext';

import { ShopBContextProvider } from '../context/ShopBContext';

function ShopB() {
  const [activeTab, setActiveTab] = useState('stock');

  const { user } = useContext(AuthContext);

  useEffect(() => {
    document.title = 'Yussman - Shop B';
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
    <ShopBContextProvider>
      <Container fluid className='py-3'>
        <Tabs
          activeKey={activeTab}
          onSelect={handleTabSelect}
          id='shopB'
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
    </ShopBContextProvider>
  );
}

export default ShopB;
