import { useState, useEffect } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
//

import LoginPage from './pages/LoginPage';
import Page404 from './pages/Page404';
import DashboardAppPage from './pages/DashboardAppPage';
import SignupPage from './pages/SignupPage';
import { Protected } from './pages/Protected';
import { ProtectedLogin } from './pages/ProtectedLogin';
import HistoryPage from './pages/HistoryPage';
import TransactionsPage from './pages/TransactionsPage';
import BankPage from './pages/BankPage';
import BankTransactionsPage from './pages/BankTransactionsPage';

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: '/dashboard',
      element: (
        <Protected>
          {' '}
          <DashboardLayout />{' '}
        </Protected>
      ),
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: 'app', element: <DashboardAppPage /> },
        { path: 'history', element: <HistoryPage /> },
        { path: 'transactions', element: <TransactionsPage /> },
        { path: 'bank-history', element: <BankPage /> },
        { path: 'bank-ops', element: <BankTransactionsPage /> },
      ],
    },
    {
      path: 'login',
      element: (
        <ProtectedLogin>
          {' '}
          <LoginPage />
        </ProtectedLogin>
      ),
    },
    {
      path: 'sign-up',
      element: <SignupPage />,
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
