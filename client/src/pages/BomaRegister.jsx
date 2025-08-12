import { useEffect } from 'react';
import { Container, Tab, Tabs } from 'react-bootstrap';

import Home from '../components/bomaRegister/Home';
import Expence from '../components/bomaRegister/Expence';
import Final from '../components/bomaRegister/Final';
import All from '../components/bomaRegister/All';

import { BomaRegisterContextProvider } from '../context/BomaRegisterContext';
import { BomaStoreContextProvider } from '../context/BomaStoreContext';
import { ShopCContextProvider } from '../context/ShopCContext';

function Register() {
  useEffect(() => {
    document.title = 'Yussman -Boma Register';
  }, []);

  return (
    <BomaRegisterContextProvider>
      <BomaStoreContextProvider>
        <ShopCContextProvider>
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
        </ShopCContextProvider>
      </BomaStoreContextProvider>
    </BomaRegisterContextProvider>
  );
}

export default Register;
