import { useEffect, useContext, useState } from 'react';

import { Container } from 'react-bootstrap';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

//components
import Stock from '../components/chansaRestaurant/Stock';
import Received from '../components/chansaRestaurant/Received';
import Credit from '../components/chansaRestaurant/Credit';
import Busses from '../components/chansaRestaurant/Busses';
import CashAndChange from '../components/chansaRestaurant/CashAndChange';
import Final from '../components/chansaRestaurant/Final';
import AllShifts from '../components/chansaRestaurant/AllShifts';

import { ChansaRestaurantContextProvider } from '../context/ChansaRestaurantContext';

import { AuthContext } from '../context/AuthContext';

function ChinsaliRestaurant() {
  const [activeTab, setActiveTab] = useState('stock');

  const { user } = useContext(AuthContext);

  useEffect(() => {
    document.title = 'Yussman -Chansa  Restaurant';
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
    <ChansaRestaurantContextProvider>
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
    </ChansaRestaurantContextProvider>
  );
}

export default ChinsaliRestaurant;
