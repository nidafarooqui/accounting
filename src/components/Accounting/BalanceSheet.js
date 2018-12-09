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
import CircularProgress from '@material-ui/core/CircularProgress';
import red from '@material-ui/core/colors/red';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import SimpleTable from '../SimpleTable';
import Helmet from 'react-helmet';
import { formatDate, parseDate } from 'react-day-picker/moment';
import { balanceSheet } from '../../endpoints.js';

let accId = 0;
function createData(accountCode, accountName, balance) {
  accId += 1;
  return { accId, accountCode, accountName, balance };
}
function createTwoColumnData(accountName, balance) {
  accId += 1;
  return { accId, accountName, balance };
}

class BalanceSheet extends React.Component {
  state = {
    assets: [],
    liabilities: [],
    equities: [],
    total: [],
    page: 0,
    rowsPerPage: 8,

    pageLiabilities: 0,
    rowsPerPageLiabilities: 6,

    pageEquities: 0,
    rowsPerPageEquities: 5,

    totalPages: 0,
    totalRowsPerPage: 8,

    to: undefined,
    active: false,
    loading: true,

    selectedDay: undefined,
    isEmpty: true,
    isDisabled: false,
  };

  componentDidMount() {
    //to date is today's date
    let today = new Date();
    let toDate = today.toISOString().split('T')[0];
    toDate = (this.state.to === undefined) ? toDate : this.state.to;

    console.log(`TO DATE: ${toDate}`)

    this.fetchBalanceSheet(toDate);

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
            assets: [],
            liabilities: [],
            equities: [],
            total: [],
            loading: true
          }

        });
        const oParser = new DOMParser();
        const oDOM = oParser.parseFromString(res.data, "application/xml");
        const list = oDOM.getElementsByTagName('getBalanceSheetStatementReturn')[0];
        let assets = [];
        let liabilities = [];
        let equities = [];
        let total = [];
        let unsortedData = {};

        for (let table of list.children) {
          unsortedData[table.tagName] = {};
          for (let row of table.children) {
            if (row.tagName === "amount") {
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
        debugger;
        console.log(unsortedData);
        Object.entries(unsortedData).forEach(
          ([key, value]) => {
            if (key.includes('cash') || key.includes('undepositedReceipts') || key === 'accountsReceivable' || key.includes('accountsReceivableCreditCard')
              || key.includes('inventory')) {
              assets.push(createData(value.gl_account_code, value.name, `$${value.amount}`));
            }
            else if (key.includes('accountsReceivableUnappliedPayments') || key.includes('uninvoicedItemReceipts') || key.includes('salesTaxCollected') || key.includes('salesTaxCollectedUS')
              || key === 'totalLiabilities') {
              if (key.includes('totalLiabilities')) {
                liabilities.push(createData(" ", value.name, `$${value.amount}`));
              }
              else {
                liabilities.push(createData(value.gl_account_code, value.name, `$${value.amount}`));
              }

            }
            else if (key.includes('retainedEarnings') || key.includes('totalEquities')) {
              if (key.includes('totalEquities')) {
                equities.push(createData(" ", value.name, `$${value.amount}`));
              }
              else {
                equities.push(createData(value.gl_account_code, value.name, `$${value.amount}`));
              }

            }
            else if (key.includes('currentAssets') || key.includes('longTermAssets') || key.includes('currentLiabilities') || key.includes('currentEquities') || key.includes('totalLiabilitiesAndEquities')) {
              total.push(createTwoColumnData(value.name, `$${value.amount}`));
            }
            else if (key.includes('totalAssets') || key.includes('totalAccumulatedDepreciation')) {
              assets.push(createData(" ", value.name, `$${value.amount}`));
              total.push(createTwoColumnData(value.name, `$${value.amount}`));
            }
          });
        assets.push(createData('ASSETS', ' ', ' '));
        liabilities.push(createData('LIABILITIES', ' ', ' '));
        equities.push(createData('EQUITIES', ' ', ' '));
        total.push(createTwoColumnData('TOTAL', ' '));

        const assetsRowOrder = [' ', 'CASH', 'UNDEPOSITED RECEIPTS', 'ACCOUNTS RECEIVABLE', 'ACCOUNTS RECEIVABLE - MASTER CARD / VISA', 'INVENTORY', 'TOTAL ASSETS', 'TOTAL ACCUMULATED DEPRECIATION'];
        const liabilitiesRowOrder = [' ', 'ACCOUNTS RECEIVABLE - UNAPPLIED PAYMENTS', 'UNINVOICED ITEM RECEIPTS', 'SALES TAX COLLECTED', 'SALES TAX COLLECTED USA - UT', 'TOTAL LIABILITIES'];
        const equitiesRowOrder = [' ', 'RETAINED EARNINGS', 'TOTAL EQUITIES'];
        const totalRowOrder = [' ', 'CURRENT ASSETS', 'LONG TERM ASSETS', 'TOTAL ACCUMULATED DEPRECIATION', 'TOTAL ASSETS', 'CURRENT LIABILITIES', 'EQUITIES', 'TOTAL LIABILITIES AND EQUITIES'];


        this.sortTable(assets, assetsRowOrder);
        this.sortTable(liabilities, liabilitiesRowOrder);
        this.sortTable(equities, equitiesRowOrder);
        this.sortTable(total, totalRowOrder);

        console.log('assets: ', assets);
        console.log('liabilities: ', liabilities);
        console.log('equities: ', equities);
        console.log('total: ', total);
        this.setState(() => {
          return {
            assets: assets,
            liabilities: liabilities,
            equities: equities,
            total: total,
            to: new Date(`${toDate}T00:00:00Z`),
            selectedDay: new Date(`${toDate}T00:00:00Z`),
            loading: false
          }
        });
      }).catch(err => { console.log(err.response.data); });
  }

  //function to sort the table in specific rows
  sortTable(array, rowOrder) {
    array.sort((a, b) => {
      const aRowIndex = rowOrder.indexOf(a.accountName);
      const bRowIndex = rowOrder.indexOf(b.accountName);
      if (aRowIndex === bRowIndex)
        return a.accId - b.accId;
      return aRowIndex - bRowIndex;
    });
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

  handleDayChange = (selectedDay, modifiers, dayPickerInput) => {
    debugger;
    const input = dayPickerInput.getInput();
    this.setState({
      selectedDay,
      isEmpty: !input.value.trim(),
      isDisabled: modifiers.disabled === true,
      active: false,
    },);
    this.setState(() => {
      return {
        to: selectedDay
      }
    }, this.showFromMonth);
  }

  showFromMonth = () => {
    debugger;
    const to = this.state.to;
    if (!to) {
      return;
    }
    // if (moment(to).diff(moment(from), 'months') < 2) {
    //   this.to.getDayPicker().showMonth(from);
    // }
    console.log(`The state for to has been set to : ${this.state.to} === ${to}`);
    const toDate = to.toISOString().split('T')[0];

    this.fetchBalanceSheet(toDate);


  }

  toggleClass = () => {
    const currentState = this.state.active;
    this.setState({ active: true });
  };

  render() {
    const { classes } = this.props;
    const { assets, rowsPerPage, page, equities, rowsPerPageEquities, pageEquities, liabilities, rowsPerPageLiabilities, pageLiabilities, total, totalPages, totalRowsPerPage } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, assets.length - page * rowsPerPage);
    const emptyRowsEquities = rowsPerPageEquities - Math.min(rowsPerPageEquities, equities.length - pageEquities * rowsPerPageEquities);
    const emptyRowsLiabilities = rowsPerPageLiabilities - Math.min(rowsPerPageLiabilities, liabilities.length - pageLiabilities * rowsPerPageLiabilities);
    const emptyRowsPerTotalTable = totalRowsPerPage - Math.min(totalRowsPerPage, total.length - totalPages * totalRowsPerPage);
    const { selectedDay, isDisabled, isEmpty } = this.state;
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
              <SimpleTable rows={this.state.assets} rowsPerPage={this.state.rowsPerPage} page={this.state.page} emptyRows={emptyRows} handleChangePage={this.handleChangePage} handleChangeRowsPerPage={this.handleChangeRowsPerPage} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <Paper className={classes.root}>
              <SimpleTable rows={this.state.liabilities} rowsPerPage={this.state.rowsPerPageLiabilities} page={this.state.pageLiabilities} emptyRows={emptyRowsLiabilities} handleChangePage={this.handleChangePagePeriodTable} handleChangeRowsPerPage={this.handleChangeRowsPerPagePeriodTable} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <Paper className={classes.root}>
              <SimpleTable rows={this.state.equities} rowsPerPage={this.state.rowsPerPageEquities} page={this.state.pageEquities} emptyRows={emptyRowsEquities} handleChangePage={this.handleChangePageClosingTable} handleChangeRowsPerPage={this.handleChangeRowsPerPageClosingTable} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <Paper className={classes.root}>
              <SimpleTable rows={this.state.total} rowsPerPage={this.state.totalRowsPerPage} page={this.state.totalPages} emptyRows={emptyRowsPerTotalTable} handleChangePage={this.handleChangePageTotalTable} handleChangeRowsPerPage={this.handleChangeRowsPerPageTotalTable} />
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
            Balance Sheet
          </Typography>
          <div className={classes.tableContainer}>
            <div className={classes.dateContainer}>
              <div className={classes.dateContent}>
                <div className={`InputFromTo ${this.state.active ? 'toggleHeight' : null} `} onClick={this.toggleClass}>
                  <p>
                    {isEmpty && 'Please type or pick a day'}
                    {!isEmpty && !selectedDay && 'This day is invalid'}
                    {selectedDay && isDisabled && 'This day is disabled'}
                    {selectedDay &&
                      !isDisabled}
                  </p>
                  <DayPickerInput
                    placeholder="To Date"
                    formatDate={formatDate}
                    parseDate={parseDate}
                    value={selectedDay}
                    onDayChange={this.handleDayChange}
                    dayPickerProps={{
                      selectedDays: selectedDay,
                      disabledDays: {
                        daysOfWeek: [0, 6],
                        after: moment().toDate(),

                      },
                      todayButton:'Today'
                    }}
                  />
                  <Helmet>
                    <style>{`
                     
                     .toggleHeight {
                       height: 28vh;
                       padding-bottom: 10rem;
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



BalanceSheet.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};
export default withStyles(styles, { withTheme: true })(BalanceSheet);
