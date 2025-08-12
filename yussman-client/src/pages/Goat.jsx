import GoatMain from '../components/goat/GoatMain';

import { GoatContextProvider } from '../context/GoatContext';

function Goat() {
  return (
    <GoatContextProvider>
      <GoatMain />
    </GoatContextProvider>
  );
}

export default Goat;
