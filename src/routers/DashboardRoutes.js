import React from 'react';
import AccountingApp from '../components/AccountingApp';
import NotFoundPage from '../components/NotFoundPage';
import IncomeStatement from '../components/Accounting/IncomeStatement';
import { BrowserRouter, Route, Switch} from 'react-router-dom';
import CashFlowStatement from '../components/Accounting/CashFlowStatement';
import BalanceSheet from '../components/Accounting/BalanceSheet';
import TransactionTotals from '../components/Accounting/TransactionTotals';
import InvoiceList from '../components/Accounting/InvoiceList';
import InvoiceDetails from '../components/Accounting/InvoiceDetails';
import { routes } from '../routers/routes';
const DashboardRoutes = () => (
    <BrowserRouter>
            <Switch>
                <Route exact = {true} path = '/' component = {AccountingApp} />
                <Route exact = {true} path = {routes.ccrlAccounting} component = {AccountingApp} />
                <Route path = {routes.incomeStatement} component = {IncomeStatement} />
                <Route path = {routes.cashflowStatement} component = {CashFlowStatement}  />
                <Route path = {routes.balanceSheet}  component = {BalanceSheet}/>
                <Route path = {routes.transactionTotals} component = {TransactionTotals} />
                <Route path= {routes.invoiceList} component={InvoiceList} exact/>
                <Route path= {routes.invoiceDetails} component={InvoiceDetails}/>
                <Route path= {routes.nimbus} component={() => window.location = 'https://nimbusrms.com/Home/Index'}/>
                <Route component={NotFoundPage} />
            </Switch>
    </BrowserRouter>
);

export default DashboardRoutes;