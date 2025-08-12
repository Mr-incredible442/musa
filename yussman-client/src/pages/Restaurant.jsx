import { useEffect, useContext, useState } from 'react';

import { Container } from 'react-bootstrap';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

//components
import Stock from '../components/restaurant/Stock';
import Received from '../components/restaurant/Received';
import Credit from '../components/restaurant/Credit';
import Busses from '../components/restaurant/Busses';
import CashAndChange from '../components/restaurant/CashAndChange';
import Final from '../components/restaurant/Final';
import AllShifts from '../components/restaurant/AllShifts';
import { RestaurantContextProvider } from '../context/RestaurantContext';

import { AuthContext } from '../context/AuthContext';

function Restaurant() {
  const [activeTab, setActiveTab] = useState('stock');

  const { user } = useContext(AuthContext);

  useEffect(() => {
    document.title = 'Yussman - Restaurant';
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
    <RestaurantContextProvider>
      <Container fluid className='py-3'>
        <Tabs
          activeKey={activeTab}
          onSelect={handleTabSelect}
          id='restaurant'
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
          <Tab eventKey='credit' title='Credit'>
            <Credit />
          </Tab>
          <Tab eventKey='busses' title='Busses'>
            <Busses />
          </Tab>
          <Tab eventKey='cash' title='Cash / Change'>
            <CashAndChange />
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
    </RestaurantContextProvider>
  );
}

export default Restaurant;
