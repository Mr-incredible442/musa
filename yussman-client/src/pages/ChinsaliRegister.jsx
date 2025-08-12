import { Container, Tab, Tabs } from 'react-bootstrap';
import Home from '../components/chinsaliRegister/Home';
import Expence from '../components/chinsaliRegister/Expence';
import Final from '../components/chinsaliRegister/Final';
import { useEffect } from 'react';
import All from '../components/chinsaliRegister/All';

import { ChinsaliRegisterContextProvider } from '../context/ChinsaliRegisterContext';
import { ChinsaliStoreContextProvider } from '../context/ChinsaliStoreContext';
import { ChinsaliRestaurantContextProvider } from '../context/ChinsaliRestaurantContext';

function Register() {
  useEffect(() => {
    document.title = 'Yussman - Chinsali Register';
  }, []);

  return (
    <ChinsaliRegisterContextProvider>
      <ChinsaliStoreContextProvider>
        <ChinsaliRestaurantContextProvider>
          <Container className='my-5' fluid>
            <Tabs defaultActiveKey='stock' justify>
              <Tab eventKey='stock' title='Stock'>
                <Home />
              </Tab>
              <Tab eventKey='expence' title='Expence'>
                <Expence />
              </Tab>
              <Tab eventKey='final' title='Final'>
                <Final />
              </Tab>
              <Tab eventKey='all' title='All'>
                <All />
              </Tab>
            </Tabs>
          </Container>
        </ChinsaliRestaurantContextProvider>
      </ChinsaliStoreContextProvider>
    </ChinsaliRegisterContextProvider>
  );
}

export default Register;
