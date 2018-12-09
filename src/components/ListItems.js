import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Tooltip from '@material-ui/core/Tooltip';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import LayersIcon from '@material-ui/icons/Layers';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { Link } from 'react-router-dom'
import { routes } from '../routers/routes';

export const mainListItems = (
  <div>
    <ListItem button component={Link} to={routes.ccrlAccounting}>
      <Tooltip title = "Dasboard">
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
      </Tooltip>
      <ListItemText primary="Dashboard" />
      </ListItem>
   
    
    
    <ListItem button component={Link} to={routes.incomeStatement}>
      <Tooltip title = "Income Statement">
        <ListItemIcon>
          <BarChartIcon />
        </ListItemIcon>
      </Tooltip>
      <ListItemText primary="Income Statement" />
    </ListItem>
    
      <ListItem button component={Link} to={routes.cashflowStatement}>
        <Tooltip title = "Cash Flow Statement">
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
        </Tooltip>
        <ListItemText primary="Cash Flow Statement" />
      </ListItem>
   
    
    <ListItem button component={Link} to={routes.balanceSheet}>
      <Tooltip title = "Balance Sheet">
        <ListItemIcon>
          <BarChartIcon />
        </ListItemIcon>
      </Tooltip>
      <ListItemText primary="Balance Sheet" />
    </ListItem>
    

    <ListItem button component={Link} to={routes.transactionTotals}>
      <Tooltip title = "Transaction Totals">
        <ListItemIcon>
          <LayersIcon />
        </ListItemIcon>
      </Tooltip>
      <ListItemText primary="Transaction Totals" />
    </ListItem>

    
    <ListItem button component={Link} to={routes.invoiceList}>
      <Tooltip title = "Invoice List">
        <ListItemIcon>
          <ShoppingCartIcon />
        </ListItemIcon>
      </Tooltip>
      <ListItemText primary="Invoice List" />
    </ListItem>

  </div>
);

export const secondaryListItems = (
  <div>
    <ListSubheader inset>Saved reports</ListSubheader>
    <ListItem button>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Current month" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Last quarter" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Year-end sale" />
    </ListItem>
  </div>
);