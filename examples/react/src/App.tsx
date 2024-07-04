import {Link, Outlet, useMatch} from 'react-router-dom';
import {useAppState} from './hooks/appState';

const App = () => {
  const {userEmail, logout} = useAppState(state => ({
    userEmail: state.userEmail,
    logout: state.logout,
  }));
  const isLogin = useMatch('/login');
  const isCustomXps = useMatch('/xps-custom');
  const isCohortXps = useMatch('/xps-cohort');

  return (
    <div id='container'>
      <nav id='header' className='bg-muted'>
        <div>
          <div>
            <Link className='default' to='/'>
              React Example App
            </Link>
          </div>
          <div />
          {isCustomXps && (
            <div>
              Experience Space with Custom Login
              {userEmail ? (
                <div id='login-state'>
                  <p className='success'>Logged in as {userEmail}</p>
                  <button onClick={logout} type='button'>
                    Logout
                  </button>
                </div>
              ) : (
                <div id='login-state'>
                  <p className='attention'>Not logged in</p>
                  <Link to='/login'>
                    <button type='button'>Login</button>
                  </Link>
                </div>
              )}
            </div>
          )}
          {isCohortXps && <div>Experience Space with Cohort Login</div>}
          {isLogin && <div>Login</div>}
        </div>
      </nav>
      <div id='content'>
        <Outlet />
      </div>
    </div>
  );
};

export default App;
