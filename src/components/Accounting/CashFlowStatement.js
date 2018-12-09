import React from 'react';
import Sidebar from '../Sidebar';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { styles } from './AccountDashboardStyles';
import Paper from '@material-ui/core/Paper';
import axios from 'axios';
import Divider from '@material-ui/core/Divider';
import moment from 'moment';
import Helmet from 'react-helmet';
import CircularProgress from '@material-ui/core/CircularProgress';
import red from '@material-ui/core/colors/red';

import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';

import { formatDate, parseDate } from 'react-day-picker/moment';
import SimpleTable from '../SimpleTable';
import { cashFlowStatement } from '../../endpoints.js';
// rows: [
//   createData('OPENING CASH BALANCE', ' ', ' '),
//   createData(110000, 'CASH', '$8,558,88'),
//   createData(112000, 'UNDEPOSITED RECEIPTS', '$219.40'),
//   createData(' ', 'TOTAL OPENING CASH BALANCE', '$8,778.28'),
// ],
// rowsPeriodCB: [
//   createFiveColumnData('PERIOD CASH BALANCE', ' ', ' ', ' ', ' '),
//   createFiveColumnData(110000, 'CASH', '$101.63', '$0.00', '$101.63'),
//   createFiveColumnData(112000, 'UNDEPOSITED RECEIPTS', '$333.75', '$0.00', '$333.75'),
//   createFiveColumnData(' ', 'TOTAL PERIOD CASH BALANCE', ' ', ' ', '$435.38'),
// ],
// rowsClosingCB: [
//   createData('CLOSING CASH BALANCE', ' ', ' '),
//   createData(110000, 'CASH', '$101.63'),
//   createData(112000, 'UNDEPOSITED RECEIPTS', '$333.75'),
//   createData(' ', 'TOTAL CLOSING CASH BALANCE', '$435.38')
// ],
// totalCB: [
//   createData('TOTAL', ' ', ' '),
//   createData('Opening Cash Balance', ' ', '$0.00'),
//   createData('Period Cash Balance', ' ', '$435.38'),
//   createData('Ending Cash Balance', ' ', '$435.38'),
// ],

let accId = 0;
function createData(accountCode, accountName, balance) {
  accId += 1;
  return { accId, accountCode, accountName, balance };
}
function createTwoColumnData(accountName, balance) {
  accId += 1;
  return { accId, accountName, balance };
}
function createFiveColumnData(accountCode, accountName, totalDebit, totalCredit, balance) {
  accId += 1;
  return { accId, accountCode, accountName, totalDebit, totalCredit, balance };
}



class CashFlowStatement extends React.Component {
  state = {
    rows: [],
    rowsPeriodCB: [],
    rowsClosingCB: [],
    totalCB: [],
    page: 0,
    rowsPerPage: 5,

    pagePeriodTable: 0,
    rowsPerPagePeriodTable: 5,

    pageClosingTable: 0,
    rowsPerPageClosingTable: 5,

    totalPages: 0,
    totalRowsPerPage: 5,

    from: undefined,
    to: undefined,
    active: false,
    loading: true
  };

  componentDidMount() {
    //to date is today's date
    let today = new Date();
    let toDate = today.toISOString().split('T')[0];
    //from date is the start of the year by default
    let fromDate = `${today.getFullYear()}-01-01`;

    fromDate = (this.state.from === undefined) ? fromDate : this.state.from;
    toDate = (this.state.to === undefined) ? toDate : this.state.to;

    console.log(`FROM DATE: ${fromDate}`);
    console.log(`TO DATE: ${toDate}`)

    this.fetchCashFlowStatement(fromDate, toDate);

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
            rows: [],
            rowsPeriodCB: [],
            rowsClosingCB: [],
            totalCB: [],
            loading: true
          }

        });
        const oParser = new DOMParser();
        const oDOM = oParser.parseFromString(res.data, "application/xml");
        const list = oDOM.getElementsByTagName('getCashFlowStatementReturn')[0];
        let openingCashBalance = [];
        let periodCashBalance = [];
        let closingCashBalance = [];
        let totalBalance = [];
        let unsortedData = {};

        for (let table of list.children) {
          unsortedData[table.tagName] = {};
          for (let row of table.children) {
            if(row.tagName === "amount") {
              unsortedData[table.tagName][row.tagName] = Number(row.textContent).toLocaleString();
            }
            else if (row.tagName === "name") {
              unsortedData[table.tagName][row.tagName] = row.textContent.toUpperCase();
            }
            else {
              unsortedData[table.tagName][row.tagName] = row.textContent;
            }
            
          }
        }
        console.log(unsortedData);
        Object.entries(unsortedData).forEach(
          ([key, value]) => {
            if(key.includes('cashOpening') || key.includes('undepositedReceiptsOpening') || key.includes('totalOpeningCashBalance') ) {
              if(key === 'totalOpeningCashBalance') {
                openingCashBalance.push(createData(" ", value.name, `$${value.amount}`));
                totalBalance.push(createTwoColumnData('OPENING CASH BALANCE', `$${value.amount}`));
              }
              else {
                openingCashBalance.push(createData(value.gl_account_code, value.name, `$${value.amount}`));
              }
            }
            else if (key.includes('cashPeriod') || key.includes('undepositedReceiptsPeriod') || key.includes('totalPeriodCashBalance') ) {
              if(key === 'totalPeriodCashBalance') {
                periodCashBalance.push(createFiveColumnData(" ", value.name, ' ', ' ', `$${value.amount}`));
                totalBalance.push(createTwoColumnData('PERIOD CASH BALANCE', `$${value.amount}`));
              }
              else {
                periodCashBalance.push(createFiveColumnData(value.gl_account_code, value.name,`$${value.debit}`, `$${value.credit}`, `$${value.balance}`));
              }
              
            }
            else if (key.includes('cashClosing') || key.includes('undepositedReceiptsEnd') || key.includes('totalClosingCashBalance')) {
              if(key === 'totalClosingCashBalance') {
                //debugger;
                closingCashBalance.push(createData(" ", value.name, `$${value.amount}`));
                totalBalance.push(createTwoColumnData('ENDING CASH BALANCE', `$${value.amount}`));
              }
              else {
                closingCashBalance.push(createData(value.gl_account_code, value.name, `$${value.amount}`));
              }
            }
          });
          openingCashBalance.push(createData('OPENING CASH BALANCE', ' ', ' '));
          periodCashBalance.push(createFiveColumnData('PERIOD CASH BALANCE', ' ', ' ', ' ', ' '));
          closingCashBalance.push(createData('CLOSING CASH BALANCE', ' ', ' '));

          const openingRowOrder = [' ', 'CASH', 'UNDEPOSITED RECEIPTS', 'TOTAL OPENING CASH BALANCE'];
          const periodRowOrder = [' ', 'CASH', 'UNDEPOSITED RECEIPTS', 'TOTAL PERIOD CASH BALANCE'];
          const closingRowOrder = [' ', 'CASH', 'UNDEPOSITED RECEIPTS', 'TOTAL CLOSING CASH BALANCE'];
          const totalRowOrder = [' ','OPENING CASH BALANCE','PERIOD CASH BALANCE','ENDING CASH BALANCE' ];
          debugger;
          this.sortTable(openingCashBalance, openingRowOrder);
          this.sortTable(periodCashBalance, periodRowOrder);
          this.sortTable(closingCashBalance, closingRowOrder);
          this.sortTable(totalBalance, totalRowOrder);

          // console.log('openingCashBalance: ',openingCashBalance);
          // console.log('periodCashBalance: ',periodCashBalance);
          // console.log('closingCashBalance: ',closingCashBalance);
          this.setState(()=> {
            return {
              rows: openingCashBalance,
              rowsPeriodCB: periodCashBalance,
              rowsClosingCB: closingCashBalance,
              totalCB: totalBalance,
              from: new Date(`${fromDate}T00:00:00Z`),
              to: new Date(`${toDate}T00:00:00Z`),
              loading: false
            }
          });
      }).catch(err => { console.log(err.response.data); });
  }

  //function to sort the table in specific rows
  sortTable(array, rowOrder) {
    array.sort( ( a, b ) => {
      const aRowIndex = rowOrder.indexOf( a.accountName );
      const bRowIndex = rowOrder.indexOf( b.accountName );
      if ( aRowIndex === bRowIndex )
          return a.accId - b.accId;
      return aRowIndex - bRowIndex;
  } );
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };
  handleChangePagePeriodTable = (event, page) => {
    this.setState({ page });
  };
  handleChangePageClosingTable = (event, page) => {
    this.setState({ page });
  };
  handleChangePageTotalTable = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };
  handleChangeRowsPerPagePeriodTable = event => {
    this.setState({ rowsPerPage: event.target.value });
  };
  handleChangeRowsPerPageClosingTable = event => {
    this.setState({ rowsPerPage: event.target.value });
  };
  handleChangeRowsPerPageTotalTable = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  showFromMonth = () => {
    const { from, to } = this.state;
    if (!from) {
      return;
    }
    if (moment(to).diff(moment(from), 'months') < 2) {
      this.to.getDayPicker().showMonth(from);
    }
    console.log(`The state for to has been set to : ${this.state.to} === ${to}`);
    const fromDate = from.toISOString().split('T')[0];
    const toDate = to.toISOString().split('T')[0];

    this.fetchCashFlowStatement(fromDate,toDate);


  }
  handleFromChange = (from) => {
    // Change the from date and focus the "to" input field
    this.setState({ from });
  }
  handleToChange = (to) => {
    this.setState({ to }, this.showFromMonth);
    this.setState({ active: false });
  }

  toggleClass = () => {
    const currentState = this.state.active;
    this.setState({ active: true });
  };

  render() {
    const { classes } = this.props;
    const { rows, rowsPerPage, page, rowsClosingCB, rowsPerPageClosingTable, pageClosingTable, rowsPeriodCB, rowsPerPagePeriodTable, pagePeriodTable, totalCB, totalPages, totalRowsPerPage } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);
    const emptyRowsClosingTable = rowsPerPageClosingTable - Math.min(rowsPerPageClosingTable, rowsClosingCB.length - pageClosingTable * rowsPerPageClosingTable);
    const emptyRowsPeriodTable = rowsPerPagePeriodTable - Math.min(rowsPerPagePeriodTable, rowsPeriodCB.length - pagePeriodTable * rowsPerPagePeriodTable);
    const emptyRowsPerTotalTable = totalRowsPerPage - Math.min(totalRowsPerPage, totalCB.length - totalPages * totalRowsPerPage);
    const { from, to } = this.state;
    const modifiers = { start: from, end: to };
    let content;
    if (this.state.loading) {
      content =
        <div className={classes.loadingBlock}>
          <CircularProgress className={classes.progress} size={50} style={{ color: red[500] }} thickness={7} />
        </div>
    } else {
      content =
        <Grid container direction="row"
          justify="flex-end" spacing={24}>
          <Grid item xs={12} sm={12} md={12}>
            <Paper className={classes.root}>
              <SimpleTable rows={this.state.rows} rowsPerPage={this.state.rowsPerPage} page={this.state.page} emptyRows={emptyRows} handleChangePage={this.handleChangePage} handleChangeRowsPerPage={this.handleChangeRowsPerPage} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <Paper className={classes.root}>
              <SimpleTable rows={this.state.rowsPeriodCB} rowsPerPage={this.state.rowsPerPagePeriodTable} page={this.state.pagePeriodTable} emptyRows={emptyRowsPeriodTable} handleChangePage={this.handleChangePagePeriodTable} handleChangeRowsPerPage={this.handleChangeRowsPerPagePeriodTable} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <Paper className={classes.root}>
              <SimpleTable rows={this.state.rowsClosingCB} rowsPerPage={this.state.rowsPerPageClosingTable} page={this.state.pageClosingTable} emptyRows={emptyRowsClosingTable} handleChangePage={this.handleChangePageClosingTable} handleChangeRowsPerPage={this.handleChangeRowsPerPageClosingTable} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <Paper className={classes.root}>
              <SimpleTable rows={this.state.totalCB} rowsPerPage={this.state.totalRowsPerPage} page={this.state.totalPages} emptyRows={emptyRowsPerTotalTable} handleChangePage={this.handleChangePageTotalTable} handleChangeRowsPerPage={this.handleChangeRowsPerPageTotalTable} />
            </Paper>
          </Grid>
        </Grid>
    }


    return (
      <div className={classes.root}>
        <Sidebar />
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Typography variant="display1" gutterBottom>
            Cash Flow Statement
          </Typography>
          <div className={classes.tableContainer}>
            <div className={classes.dateContainer}>
              <div className={classes.dateContent}>
                <div className={`InputFromTo ${this.state.active ? 'toggleHeight' : null} `} onClick={this.toggleClass}>
                  <DayPickerInput
                    value={from}
                    placeholder="From"
                    format="LL"
                    formatDate={formatDate}
                    parseDate={parseDate}
                    dayPickerProps={{
                      selectedDays: [from, { from, to }],
                      disabledDays: { after: to },
                      toMonth: to,
                      modifiers,
                      numberOfMonths: 2,
                      onDayClick: () => this.to.getInput().focus(),
                    }}
                    onDayChange={this.handleFromChange}
                  />{' '}
                  —{' '}
                  <span className="InputFromTo-to">
                    <DayPickerInput
                      ref={el => (this.to = el)}
                      value={to}
                      placeholder="To"
                      format="LL"
                      formatDate={formatDate}
                      parseDate={parseDate}
                      dayPickerProps={{
                        selectedDays: [from, { from, to }],
                        disabledDays: { 
                          before: from,
                          after: moment().toDate(),
                        },
                        modifiers,
                        month: from,
                        fromMonth: from,
                        numberOfMonths: 2,
                        //todayButton: 'Today',
                      }}
                      onDayChange={this.handleToChange}
                    />
                  </span>
                  <Helmet>
                    <style>{`
                     .InputFromTo, .InputFromTo-to {
                       width: 400px;
                     }
                     .toggleHeight {
                       height: 30vh;
                       padding-bottom: 5rem;
                     }
                     .InputFromTo .DayPicker-Day--selected:not(.DayPicker-Day--start):not(.DayPicker-Day--end):not(.DayPicker-Day--outside) {
                       background-color: #f0f8ff !important;
                       color: #4a90e2;
                     }
                     .InputFromTo .DayPicker-Day {
                       border-radius: 0 !important;
                     }
                     .InputFromTo .DayPicker-Day--start {
                       border-top-left-radius: 50% !important;
                       border-bottom-left-radius: 50% !important;
                     }
                     .InputFromTo .DayPicker-Day--end {
                       border-top-right-radius: 50% !important;
                       border-bottom-right-radius: 50% !important;
                     }
                     .InputFromTo .DayPickerInput-Overlay {
                       width: 550px;
                     }
                     .InputFromTo-to .DayPickerInput-Overlay {
                       margin-left: -198px;
                     }
                   `}</style>
                  </Helmet>
                </div>
              </div>
              {/* <div>
             <Button variant="contained" color="secondary" className={classes.button}>Search
                 <SearchIcon className={classes.searchIcon} />
               </Button>
             </div> */}
            </div>

            <Divider className={classes.divider} />
            {content}
          </div>
        </main>
      </div>
    );
  };
};



CashFlowStatement.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};
export default withStyles(styles, { withTheme: true })(CashFlowStatement);
