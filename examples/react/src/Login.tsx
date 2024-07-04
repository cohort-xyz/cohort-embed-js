import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAppState} from './hooks/appState';

const Login = () => {
  const login = useAppState(state => state.login);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  return (
    <div id='login'>
      <form
        onSubmit={e => {
          e.preventDefault();
          login(email);
          const urlParams = new URLSearchParams(window.location.search);
          const destination = urlParams.get('redirectUri');

          if (destination) {
            console.log('[PARENT] Redirecting to', destination);
            window.location.href = destination;
          } else {
            navigate('/xps-custom');
          }
        }}
      >
        <label>Email</label>
        <input type='email' value={email} onChange={e => setEmail(e.target.value)} required />
        <div>
          <button type='submit'>Login</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
