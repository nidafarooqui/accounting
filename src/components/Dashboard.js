import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Store from "@material-ui/icons/Store";
import DateRange from "@material-ui/icons/DateRange";
import Table from "./Table/Table";
import Grid from '@material-ui/core/Grid';
import Card from "./Card/Card";
import CardHeader from "./Card/CardHeader";
import CardIcon from "./Card/CardIcon";
import CardBody from "./Card/CardBody";
import CardFooter from "./Card/CardFooter";
import Sidebar from './Sidebar';
import { Link } from 'react-router-dom'
import axios from 'axios';
import {balanceSheet, cashFlowStatement, incomeStatement, transactionTotals } from '../../src/endpoints.js';
import { routes } from '../routers/routes';


const drawerWidth = 240;

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: '100%',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 9,
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    height: '100vh',
    overflow: 'auto',
  },
  chartContainer: {
    marginLeft: -22,
  },
  tableContainer: {
    height: 320,
  },
  stats: {
    color: "#999999",
    display: "inline-flex",
    fontSize: "12px",
    lineHeight: "22px",
    "& svg": {
      top: "4px",
      width: "16px",
      height: "16px",
      position: "relative",
      marginRight: "3px",
      marginLeft: "3px"
    },
    "& .fab,& .fas,& .far,& .fal,& .material-icons": {
      top: "4px",
      fontSize: "16px",
      position: "relative",
      marginRight: "3px",
      marginLeft: "3px"
    }
  },
  cardCategory: {
    color: "#999999",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    paddingTop: "10px",
    marginBottom: "0"
  },
  cardCategoryWhite: {
    color: "rgba(255,255,255,.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0"
  },
  cardTitle: {
    color: "#3C4858",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: "#777",
      fontWeight: "400",
      lineHeight: "1"
    }
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: "#777",
      fontWeight: "400",
      lineHeight: "1"
    }
  }
});

class Dashboard extends React.Component {

  state = {
    incomeStatement: [],
    cashFlowStatement: [],
    balanceSheet: [],
    transactionTotals: [],
    today: new Date()
  }

  fetchCashFlowStatement(fromDate, toDate) {

    const xmls = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"\
                            xmlns:web="http://cashflow.ws.accounting">\
            <soapenv:Header/>\
            <soapenv:Body>\
              <web:getCashFlowStatement>\
                  <web:fromDate>${fromDate}</web:fromDate>\
                  <web:toDate>${toDate}</web:toDate>\
              </web:getCashFlowStatement>\
            </soapenv:Body>\
          </soapenv:Envelope>`;

    axios.post(cashFlowStatement,
      xmls,
      {
        headers:
          { 'crossDomain': true, 'Content-Type': 'xml', SOAPAction: "", "Access-Control-Allow-Origin": "*" }
      }).then(res => {

        this.setState(() => {
          return {
            cashFlowStatement: [],
            // rowsPeriodCB: [],
            // rowsClosingCB: [],
            // totalCB: []
          }

        });
        const oParser = new DOMParser();
        const oDOM = oParser.parseFromString(res.data, "application/xml");
        const list = oDOM.getElementsByTagName('getCashFlowStatementReturn')[0];
        let openingCashBalance = [];
        // let periodCashBalance = [];
        // let closingCashBalance = [];
        // let totalBalance = [];
        let unsortedData = {};

        for (let table of list.children) {
          unsortedData[table.tagName] = {};
          for (let row of table.children) {
            if(row.tagName === "amount") {
              unsortedData[table.tagName][row.tagName] = Number(row.textContent).toLocaleString();
            }
            else {
              unsortedData[table.tagName][row.tagName] = row.textContent;
            }
            
          }
        }
        console.log(unsortedData);
        Object.entries(unsortedData).forEach(
          ([key, value]) => {
            if (key.includes('Opening')) {

              if (key.includes('cash')) {
                openingCashBalance.push([value.gl_account_code, 'Cash', `$${value.amount}`]);
              }
              else if (key.includes('undepositedReceipts')) {
                openingCashBalance.push([value.gl_account_code, 'Undeposited Receipts', `$${value.amount}`]);
              }
              else if (key.includes('total')) {
                openingCashBalance.push([' ', 'Total Opening Cash Balance', `$${value.amount}`]);
              }
            }
            // else if (key.includes('Period')) {
            //   debugger;
            //   if(key.includes('cash')) {
            //     periodCashBalance.push(createFiveColumnData('PERIOD CASH BALANCE', ' ', ' ', ' ', ' '));
            //     periodCashBalance.push(createFiveColumnData(value.gl_account_code, 'CASH', `$${value.debit}`, `$${value.credit}`,`$${value.balance}`));
            //   }
            //   else if(key.includes('undepositedReceipts')) {
            //     periodCashBalance.push(createFiveColumnData(value.gl_account_code, 'UNDEPOSITED RECEIPTS',  `$${value.debit}`, `$${value.credit}`, `$${value.balance}`));
            //   }
            //   else if(key.includes('total') ) {
            //     periodCashBalance.push(createFiveColumnData(' ', 'TOTAL PERIOD CASH BALANCE', ' ', ' ', `$${value.amount}`));
            //     totalBalance.push(createTwoColumnData('PERIOD CASH BALANCE', `$${value.amount}`));
            //   }

            // }
            // else if (key.includes('Closing') || key.includes('End')) {

            //   if(key.includes('cash')) {
            //     closingCashBalance.push(createData('CLOSING CASH BALANCE', ' ', ' '));
            //     closingCashBalance.push(createData(value.gl_account_code, 'CASH', `$${value.amount}`));
            //   }
            //   else if(key.includes('undepositedReceipts')) {
            //     closingCashBalance.push(createData(value.gl_account_code, 'UNDEPOSITED RECEIPTS', `$${value.amount}`));
            //   }
            //   else if(key.includes('total') ) {
            //     closingCashBalance.push(createData(' ', 'TOTAL CLOSING CASH BALANCE', `$${value.amount}`));
            //     totalBalance.push(createTwoColumnData('ENDING CASH BALANCE', `$${value.amount}`));
            //   }
            // }
          });
        const openingRowOrder = ['Cash', 'Undeposited Receipts', 'Total Opening Cash Balance'];
        // const periodRowOrder = [' ', 'CASH', 'UNDEPOSITED RECEIPTS', 'TOTAL PERIOD CASH BALANCE'];
        // const closingRowOrder = [' ', 'CASH', 'UNDEPOSITED RECEIPTS', 'TOTAL CLOSING CASH BALANCE'];
        // const totalRowOrder = [' ','OPENING CASH BALANCE','PERIOD CASH BALANCE','ENDING CASH BALANCE' ];
        this.sortTable(openingCashBalance, openingRowOrder);
        // this.sortTable(periodCashBalance, periodRowOrder);
        // this.sortTable(closingCashBalance, closingRowOrder);
        // this.sortTable(totalBalance, totalRowOrder);

        console.log('openingCashBalance: ', openingCashBalance);
        // console.log('periodCashBalance: ',periodCashBalance);
        // console.log('closingCashBalance: ',closingCashBalance);
        this.setState(() => {
          return {
            cashFlowStatement: openingCashBalance,
            // rowsPeriodCB: periodCashBalance,
            // rowsClosingCB: closingCashBalance,
            // totalCB: totalBalance
          }
        });
      }).catch(err => { console.log(err.response.data); });
  }

  //function to sort the table in specific rows
  sortTable(array, rowOrder) {
    array.sort((a, b) => {
      const aRowIndex = rowOrder.indexOf(a[1]);
      const bRowIndex = rowOrder.indexOf(b[1]);
      if (aRowIndex === bRowIndex)
        return a.accId - b.accId;
      return aRowIndex - bRowIndex;
    });
  }

  fetchIncomeStatement(fromDate, throughDate) {
    const xmls = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"\
                            xmlns:web="http://incomeStatement.ofbiz.com">\
            <soapenv:Header/>\
            <soapenv:Body>\
              <web:getIncomeStatement>\
                <input>\
                  <web:fromDate>${fromDate}</web:fromDate>\
                  <web:throughDate>${throughDate}</web:throughDate>\
                  <web:fiscalGlType>string</web:fiscalGlType>\
                </input>\
              </web:getIncomeStatement>\
            </soapenv:Body>\
          </soapenv:Envelope>`;

    axios.post(incomeStatement,
      xmls,
      {
        headers:
          { 'crossDomain': true, 'Content-Type': 'xml', SOAPAction: "", "Access-Control-Allow-Origin": "*" }
      }).then(res => {
        this.setState(() => {
          incomeStatement: []
        });
        const oParser = new DOMParser();
        const oDOM = oParser.parseFromString(res.data, "application/xml");
        const list = oDOM.getElementsByTagName('getIncomeStatementReturn')[0];
        let tableData = [];
        let dataObject = {};
        for (let item of list.children) {
          if (item.tagName.includes('ID')) {
            dataObject['accountCode'] = item.textContent
          }
          else {
            let balance = parseFloat(item.textContent).toFixed(2)
            
            dataObject['balance'] = `\$${ Number(balance).toLocaleString()}`;
            let text = item.tagName;
            let result = text.replace(/([A-Z])/g, " $1");
            let finalResult = result.charAt(0).toUpperCase() + result.slice(1); // capitalize the first letter - as an example.
            dataObject['accountName'] = finalResult;
          }
          if (dataObject.balance !== undefined && dataObject.accountCode !== undefined) {
            tableData.push([dataObject.accountCode, dataObject.accountName, dataObject.balance]);
            dataObject = {};
          }
        }
        this.setState(() => {
          return {
            incomeStatement: tableData
          }
        });
      }).catch(err => { console.log(err.response.data); });
  }


  fetchBalanceSheet(toDate) {
    const xmls = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"\
                            xmlns:web="http://balancesheet.ws.accounting">\
            <soapenv:Header/>\
            <soapenv:Body>\
              <web:getBalanceSheetStatement>\
                  <web:toDate>${toDate}</web:toDate>\
              </web:getBalanceSheetStatement>\
            </soapenv:Body>\
          </soapenv:Envelope>`;

    axios.post(balanceSheet,
      xmls,
      {
        headers:
          { 'crossDomain': true, 'Content-Type': 'xml', SOAPAction: "", "Access-Control-Allow-Origin": "*" }
      }).then(res => {

        this.setState(() => {
          return {
            balanceSheet: []
          }

        });
        const oParser = new DOMParser();
        const oDOM = oParser.parseFromString(res.data, "application/xml");
        const list = oDOM.getElementsByTagName('getBalanceSheetStatementReturn')[0];
        let balanceSheet = [];
        let unsortedData = {};

        for (let table of list.children) {
          unsortedData[table.tagName] = {};
          for (let row of table.children) {
            if (row.tagName === "amount") {
              unsortedData[table.tagName][row.tagName] = Number(row.textContent).toLocaleString();
            }
            else if (row.tagName === "name") {
              unsortedData[table.tagName][row.tagName] = row.textContent.toProperCase();
            }
            else {
              unsortedData[table.tagName][row.tagName] = row.textContent;
            }

          }
        }
        debugger;
        console.log(unsortedData);
        Object.entries(unsortedData).forEach(
          ([key, value]) => {
            if (key.includes('cash') || key.includes('undepositedReceipts') || key === 'accountsReceivable' || key.includes('accountsReceivableCreditCard')
              // || key.includes('inventory')
            ) {
              balanceSheet.push([value.gl_account_code, value.name, `$${value.amount}`]);
            }
            // else if (key.includes('totalAssets') || key.includes('totalAccumulatedDepreciation')) {
            //   balanceSheet.push([" ", value.name, `$${value.amount}`]);
            // }
          });

        const assetsRowOrder = [' ', 'Cash', 'Undeposited Receipts', 'Accounts Receivable', 'Accounts Receivable - Master Card / Visa', 'Inventory', 'Total Assets', 'Total Accumulated Depreciation'];


        this.sortTable(balanceSheet, assetsRowOrder);

        console.log('assets: ', balanceSheet);
        this.setState(() => {
          return {
            balanceSheet: balanceSheet
          }
        });
      }).catch(err => { console.log(err.response.data); });

  }

  fetchTransactionTotals(fromDate, toDate) {
    const xmls = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"\
                            xmlns:web="http://transactionTotals.ofbiz.com">\
            <soapenv:Header/>\
            <soapenv:Body>\
              <web:transactionTotal>\
                <input>\
                  <web:fromDate>${fromDate}</web:fromDate>\
                  <web:throughDate>${toDate}</web:throughDate>\
                  <web:fiscalGlType>string</web:fiscalGlType>\
                </input>\
              </web:transactionTotal>\
            </soapenv:Body>\
          </soapenv:Envelope>`;

    axios.post(transactionTotals,
      xmls,
      {
        headers:
          { 'crossDomain': true, 'Content-Type': 'xml', SOAPAction: "", "Access-Control-Allow-Origin": "*" }
      }).then(res => {

        this.setState(() => {
          return {
            transactionTotals: [],
          }

        });
        const oParser = new DOMParser();
        const oDOM = oParser.parseFromString(res.data, "application/xml");
        const list = oDOM.getElementsByTagName('transactionTotalReturn')[0];
        let transactionTotals = [];
        let unsortedData = {};
        let col = 0;
        for (let row of list.children) {

          if (row.tagName.includes('ID')) {
            col = 0;
            unsortedData['accountCode'] = row.textContent
            let text = row.tagName.slice(0, -2);
            let result = text.replace(/([A-Z])/g, " $1");
            let finalResult = (result.charAt(0).toUpperCase() + result.slice(1)).toUpperCase().trim(); // capitalize the first letter - as an example.
            if (finalResult === "ACCOUNTS RECEIVABLE MASTER CARD VISA") {
              finalResult = "Accounts Receivable - Master Card / Visa";
            }
            else if (finalResult === 'SALES TAX COLLECTED U S A U T') {
              finalResult = 'Sales Tax Collected USA - UT';
            }
            else if (finalResult === 'ACCOUNTS RECEIVABLE UNAPPLIED PAYMENTS') {
              finalResult = 'Accounts Receivable - Uunapplied Payments';
            }
            unsortedData['accountName'] = finalResult.toProperCase();
          }
          else {
            debugger
            col++;
            let tag = row.tagName.split('__');
            let balance = parseFloat(row.textContent).toFixed(2)
            unsortedData[tag[1]] = `\$${ Number(balance).toLocaleString()}`;
          }
          if (col === 6) {
            transactionTotals.push([unsortedData.accountCode, unsortedData.accountName, unsortedData.DR_OPENING, unsortedData.CR_OPENING, unsortedData.DR, unsortedData.CR, unsortedData.DR_CLOSING, unsortedData.CR_CLOSING]);
          }

        }
        debugger;
        console.log(unsortedData);


        const postedTotalsRowOrder = [' ', 'Undeposited Receipts', 'Accounts Receivable', 'Accounts Receivable - Master Card / Visa',
        'Accounts Receivable - Unapplied Payments', 'Inventory', 'Uninvoiced Item Receipts', 'Sales Tax Collected', 'Sales Tax Collected USA - UT', 'General Sales',
        'Miscellaneous Sales', 'Discount on Sales', 'Cost of Goods Sold', 'Inventory Shrinkage'];


        this.sortTable(transactionTotals, postedTotalsRowOrder);


        this.setState(() => {
          return {
            transactionTotals: transactionTotals,
          }
        });
      }).catch(err => { console.log(err.response.data); });
  }

  componentDidMount() {
    //to date is today's date
    let toDate = this.state.today;
    toDate = toDate.toISOString().split('T')[0];

    //from date is the start of the year by default
    let fromDate = `${this.state.today.getFullYear()}-01-01`;

    this.fetchIncomeStatement(fromDate, toDate);
    this.fetchCashFlowStatement(fromDate, toDate);
    this.fetchBalanceSheet(toDate);
    this.fetchTransactionTotals(toDate);
  }



  render() {
    const { classes, theme } = this.props;

    return (
      <div className={classes.root}>
        <Sidebar />
        <div>
          <main className={classes.content}>
            <div className={classes.toolbar} />
            {/* <Typography variant="display1" gutterBottom>
            Reports
          </Typography> */}
            <div className={classes.tableContainer}>
              <Grid container spacing={32}>
                <Grid item xs={12} sm={6} md={4}>
                  <Link to={routes.incomeStatement}>
                    <Card>
                      <CardHeader color="warning">
                        <h4 className={classes.cardTitleWhite}>Income Statement</h4>
                        <p className={classes.cardCategoryWhite}>
                          Income Statement on {this.state.today.toDateString()}
                        </p>
                      </CardHeader>
                      <CardBody>
                        <Table
                          tableHeaderColor="warning"
                          tableHead={["Account Code", "Account Name", "Balance"]}
                          //tableSubHead={["Accounting Revenues","",""]}
                          tableData={this.state.incomeStatement}
                        />
                      </CardBody>
                    </Card>
                  </Link>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Link to={routes.balanceSheet}>
                    <Card>
                      <CardHeader color="danger">
                        <h4 className={classes.cardTitleWhite}>Balance Sheet</h4>
                        <p className={classes.cardCategoryWhite}>
                          Balance Sheet on {this.state.today.toDateString()}
                        </p>
                      </CardHeader>
                      <CardBody>
                        <Table
                          tableHeaderColor="danger"
                          tableHead={["Account Code", "Account Name", "Balance"]}
                          tableData={this.state.balanceSheet}
                        />
                      </CardBody>
                    </Card>
                  </Link>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Link to={routes.cashflowStatement}>
                    <Card>
                      <CardHeader color="success">
                        <h4 className={classes.cardTitleWhite}>Cash Flow Statement</h4>
                        <p className={classes.cardCategoryWhite}>
                          Cash Flow Statement on {this.state.today.toDateString()}
                        </p>
                      </CardHeader>
                      <CardBody>
                        <Table
                          tableHeaderColor="success"
                          tableHead={["Account Code", "Account Name", "Balance"]}
                          tableData={this.state.cashFlowStatement}
                        />
                      </CardBody>
                    </Card>
                  </Link>
                </Grid>
                <Grid item xs={12} sm={6} md={8}>
                  <Link to={routes.transactionTotals}>
                    <Card>
                      <CardHeader color="info">
                        <h4 className={classes.cardTitleWhite}>Transaction Totals</h4>
                        <p className={classes.cardCategoryWhite}>
                          Transaction Totals on {this.state.today.toDateString()}
                        </p>
                      </CardHeader>
                      <CardBody>
                        <Table
                          tableHeaderColor="info"
                          tableHead={["Account Code", "Account Name", "Opening D", "Opening C", "DR", "CR", "Closing D", "Closing C"]}
                          tableData={this.state.transactionTotals}
                        />
                      </CardBody>
                    </Card>
                  </Link>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Link to={routes.invoiceList}>
                    <Card>
                      <CardHeader color="success" stats icon>
                        <CardIcon color="success">
                          <Store />
                        </CardIcon>
                        <p className={classes.cardCategory}>Invoice</p>
                        <h3 className={classes.cardTitle}>Invoice List</h3>
                      </CardHeader>
                      <CardFooter stats>
                        <div className={classes.stats}>
                          <DateRange />
                          Last 24 Hours
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                </Grid>
              </Grid>
            </div>
          </main>
        </div>
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};

export default withStyles(styles, { withTheme: true })(Dashboard);