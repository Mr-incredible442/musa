import { useState } from 'react';
import { BsSun, BsMoonFill } from 'react-icons/bs';
import { Button } from 'react-bootstrap';

function Theme() {
  const [theme, setTheme] = useState('dark');

  document.body.dataset.bsTheme = theme;

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
    document.body.dataset.bsTheme = theme;
  };
  return (
    <Button
      variant='outline-secondary'
      size='sm'
      className='d-flex justify-content-center align-items-center p-2'
      onClick={toggleTheme}>
      {theme === 'light' ? <BsMoonFill /> : <BsSun />}
    </Button>
  );
}

export default Theme;
