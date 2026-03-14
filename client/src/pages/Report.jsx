import { useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import Main from '../components/report/Main';
import All from '../components/report/All';
import { ReportContextProvider } from '../context/ReportContext';

function Report() {
  useEffect(() => {
    document.title = 'Report';
  }, []);
  return (
    <ReportContextProvider>
      <Container className="py-3">
        <Tabs defaultActiveKey="main" id="report-tabs" className="mb-3" justify>
          <Tab eventKey="main" title="Main">
            <Main />
          </Tab>
          <Tab eventKey="all" title="All">
            <All />
          </Tab>
        </Tabs>
      </Container>
    </ReportContextProvider>
  );
}

export default Report;
