import React from 'react';
import ReactDOM from 'react-dom/client';
import {RouterProvider, createBrowserRouter} from 'react-router-dom';

import App from './App.tsx';
import './index.css';
import Login from './Login.tsx';
import ExperienceSpaceWithCohortLogin from './pages/ExperienceSpaceWithCohortLogin.tsx';
import ExperienceSpaceWithCustomLogin from './pages/ExperienceSpaceWithCustomLogin.tsx';
import Home from './pages/Home.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'xps-custom',
        element: <ExperienceSpaceWithCustomLogin />,
      },
      {
        path: 'xps-cohort',
        element: <ExperienceSpaceWithCohortLogin />,
      },
    ],
  },
]);

// biome-ignore lint/style/noNonNullAssertion:
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
