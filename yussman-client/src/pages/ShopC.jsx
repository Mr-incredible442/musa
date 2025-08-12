import { useEffect, useContext, useState } from 'react';

import { Col, Container, Row } from 'react-bootstrap';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import Stock from '../components/shopC/Stock';
import Received from '../components/shopC/Received';
import Credit from '../components/shopC/Credit';
import CashAndChange from '../components/shopC/Cash';
import Final from '../components/shopC/Final';
import AllShifts from '../components/shopC/AllShifts';

import { AuthContext } from '../context/AuthContext';

import { ShopCContextProvider } from '../context/ShopCContext';

function ShopC() {
  const [activeTab, setActiveTab] = useState('stock');

  const { user } = useContext(AuthContext);

  useEffect(() => {
    document.title = 'Yussman - Shop Boma';
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
    <ShopCContextProvider>
      <Container fluid className='py-3'>
        <Tabs
          activeKey={activeTab}
          onSelect={handleTabSelect}
          id='shopC'
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
    </ShopCContextProvider>
  );
}

export default ShopC;
