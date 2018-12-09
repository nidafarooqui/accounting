import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css/normalize.css';
import Dashboard from './components/AccountingApp';
import AccountingApp from './components/AccountingApp';
import DashboardRoutes from './routers/DashboardRoutes';
import "./assets/css/material-dashboard-react.css";

  ReactDOM.render(<DashboardRoutes/>, document.getElementById('app'));
  