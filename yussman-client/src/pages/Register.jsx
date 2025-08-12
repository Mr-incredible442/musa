import { Container, Tab, Tabs } from 'react-bootstrap';
import Home from '../components/register/Home';
import Expence from '../components/register/Expence';
import Final from '../components/register/Final';
import { useEffect } from 'react';
import All from '../components/register/All';

import { RegisterContextProvider } from '../context/RegisterContext';
import { ShopA1ContextProvider } from '../context/ShopA1Context';
import { ShopA2ContextProvider } from '../context/ShopA2Context';
import { ShopBContextProvider } from '../context/ShopBContext';
import { ShopWContextProvider } from '../context/ShopWContext';
import { StoreContextProvider } from '../context/StoreContext';
import { ShopCContextProvider } from '../context/ShopCContext';

function Register() {
  useEffect(() => {
    document.title = 'Yussman - Register';
  }, []);

  return (
    <RegisterContextProvider>
      <ShopA1ContextProvider>
        <ShopA2ContextProvider>
          <ShopBContextProvider>
            <ShopWContextProvider>
              <StoreContextProvider>
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
              </StoreContextProvider>
            </ShopWContextProvider>
          </ShopBContextProvider>
        </ShopA2ContextProvider>
      </ShopA1ContextProvider>
    </RegisterContextProvider>
  );
}

export default Register;
