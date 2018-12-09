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
import { transactionTotals } from '../../endpoints.js';

let accId = 0;
function createEightColumnData(accountCode, accountName, openingD, openingC, dr, cr, closingD, closingC) {
  accId += 1;
  return { accId, accountCode, accountName, openingD, openingC, dr, cr, closingD, closingC};
}

class TransactionTotals extends React.Component {
  state = {
    postedTotals: [],
    unpostedTotals: [],
    postedAndUnpostedTotals: [],
    
    pagePostedTotals: 0,
    rowsPerPagePostedTotals: 5,

    pageUnpostedTotals: 0,
    rowsPerPageUnpostedTotals: 5,

    pagePostedAndUnpostedTotals: 0,
    rowsPerPagePostedAndUnpostedTotals: 5,

    from: undefined,
    to: undefined,
    active: false,
    loading: true,

    isEmpty: true,
    isDisabled: false,
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


    this.fetchTransactionTotals(fromDate, toDate);

  }

  fetchTransactionTotals(fromDate, toDate) {
    // postedTotals: [],
    // unpostedTotals: [],
    // postedAndUnpostedTotals: [],

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
            postedTotals: [],
            unpostedTotals: [],
            postedAndUnpostedTotals: [],
            loading: true
          }

        });
        const oParser = new DOMParser();
        const oDOM = oParser.parseFromString(res.data, "application/xml");
        const list = oDOM.getElementsByTagName('transactionTotalReturn')[0];
        let postedTotals = [];
        let unpostedTotals = [];
        let postedAndUnpostedTotals = [];
        let unsortedData = {};
        let col = 0;
        let debitTotal = 0.0;
        let creditTotal = 0.0;
        let debit = 0.0;
        let credit = 0.0;
        for (let row of list.children) {

            if(row.tagName.includes('ID')) {
              col = 0;
              unsortedData['accountCode'] = row.textContent
              let text = row.tagName.slice(0,-2);
              let result = text.replace( /([A-Z])/g, " $1" );
              let finalResult = (result.charAt(0).toUpperCase() + result.slice(1)).toUpperCase().trim(); // capitalize the first letter - as an example.
              if(finalResult === "ACCOUNTS RECEIVABLE MASTER CARD VISA") {
                finalResult = "ACCOUNTS RECEIVABLE - MASTER CARD / VISA";
              }
              else if(finalResult === 'SALES TAX COLLECTED U S A U T') {
                finalResult = 'SALES TAX COLLECTED USA - UT';
              }
              else if(finalResult === 'ACCOUNTS RECEIVABLE UNAPPLIED PAYMENTS') {
                finalResult = 'ACCOUNTS RECEIVABLE - UNAPPLIED PAYMENTS';
              }
              unsortedData['accountName'] = finalResult;
            }  
            else {
              //debugger
              col++;
              let tag = row.tagName.split('__');
              let balance = parseFloat(row.textContent).toFixed(2)
              unsortedData[tag[1]] = `\$${ Number(balance).toLocaleString()}`;  
              if(tag[1] === 'DR') {
                debit = balance;
                console.log('Debit Amount: ', debit);
              }
              else if (tag[1] === 'CR') {
                credit =  balance;
              }
            }
         if(col === 6) {
          postedTotals.push(createEightColumnData(unsortedData.accountCode, unsortedData.accountName,unsortedData.DR_OPENING, unsortedData.CR_OPENING, unsortedData.DR, unsortedData.CR, unsortedData.DR_CLOSING, unsortedData.CR_CLOSING));
          debugger
          debitTotal = +debitTotal + +debit;
          creditTotal = +creditTotal + +credit;
          postedAndUnpostedTotals.push(createEightColumnData(unsortedData.accountCode, unsortedData.accountName,unsortedData.DR_OPENING, unsortedData.CR_OPENING, unsortedData.DR, unsortedData.CR, unsortedData.DR_CLOSING, unsortedData.CR_CLOSING));
         }
         
        }
        //debugger;
        console.log(unsortedData);
       
        postedTotals.push(createEightColumnData('POSTED TOTALS', ' ', ' ',' ', ' ',' ', ' ',' '));
        unpostedTotals.push(createEightColumnData('UNPOSTED TOTALS', ' ', ' ',' ', ' ',' ', ' ',' '));
        unpostedTotals.push(createEightColumnData(' ', ' ', ' ',' ', '$0.00','$0.00', ' ',' '));
        postedAndUnpostedTotals.push(createEightColumnData('POSTED AND UNPOSTED TOTALS', ' ', ' ',' ', ' ',' ', ' ',' '));

        const postedTotalsRowOrder = [' ', 'UNDEPOSITED RECEIPTS', 'ACCOUNTS RECEIVABLE', 'ACCOUNTS RECEIVABLE - MASTER CARD / VISA', 
        'ACCOUNTS RECEIVABLE - UNAPPLIED PAYMENTS', 'INVENTORY', 'UNINVOICED ITEM RECEIPTS', 'SALES TAX COLLECTED', 'SALES TAX COLLECTED USA - UT', 'GENERAL SALES',
        'MISCELLANEOUS SALES', 'DISCOUNT ON SALES', 'COST OF GOODS SOLD','INVENTORY SHRINKAGE'];
  
        
        this.sortTable(postedTotals, postedTotalsRowOrder);
        this.sortTable(postedAndUnpostedTotals, postedTotalsRowOrder);
        
        postedTotals.push(createEightColumnData(' ', ' ', ' ',' ',`\$${ Number(debitTotal).toLocaleString()}`, `\$${ Number(creditTotal).toLocaleString()}`, ' ',' '));
        postedAndUnpostedTotals.push(createEightColumnData(' ', ' ', ' ',' ',`\$${ Number(debitTotal).toLocaleString()}`, `\$${ Number(creditTotal).toLocaleString()}`, ' ',' '));

        console.log('Posted Totals: ', postedTotals);
        console.log('Unposted Totals: ', unpostedTotals);
        console.log('Posted And Unposted Totals: ', postedAndUnpostedTotals);
        this.setState(() => {
          return {
            postedTotals: postedTotals,
            unpostedTotals: unpostedTotals,
            postedAndUnpostedTotals: postedAndUnpostedTotals,
            from: new Date(`${fromDate}T00:00:00Z`),
            to: new Date(`${toDate}T00:00:00Z`),
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

  handleChangePagePostedTable = (event, page) => {
    this.setState(() =>{ 
      return {
        pagePostedTotals: page
      } 
    });
  };
  handleChangePageUnpostedTable = (event, page) => {
    this.setState(() =>{ 
      return {
        pageUnpostedTotals: page
      } 
    });
  };
  handleChangePagePostedAndUnpostedTable = (event, page) => {
    this.setState(() =>{ 
      return {
        pagePostedAndUnpostedTotals: page
      } 
    });
  };


  handleChangeRowsPerPagePostedTable = event => {
    this.setState(() => {
       return {
        rowsPerPagePostedTotals: event.target.value 
        }
    });
  };
  handleChangeRowsPerPageUnpostedTable = event => {
    this.setState(() => {
      return {
        rowsPerPageUnpostedTotals: event.target.value 
       }
   });
  };
  handleChangeRowsPerPagePostedAndUnpostedTable = event => {
    this.setState(() => {
      return {
        rowsPerPagePostedAndUnpostedTotals: event.target.value 
       }
   });
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

    this.fetchTransactionTotals(fromDate,toDate);


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
    const { postedTotals, postedAndUnpostedTotals, rowsPerPageUnpostedTotals, pageUnpostedTotals, unpostedTotals, rowsPerPagePostedTotals, pagePostedTotals, pagePostedAndUnpostedTotals, rowsPerPagePostedAndUnpostedTotals } = this.state;
    const emptyRowsPostedTable = rowsPerPagePostedTotals - Math.min(rowsPerPagePostedTotals, postedTotals.length - pagePostedTotals * rowsPerPagePostedTotals);
    const emptyRowsUnpostedTable = rowsPerPageUnpostedTotals - Math.min(rowsPerPageUnpostedTotals, unpostedTotals.length - pageUnpostedTotals * rowsPerPageUnpostedTotals);
    const emptyRowsPostedAndUnpostedTable = rowsPerPagePostedAndUnpostedTotals - Math.min(rowsPerPagePostedAndUnpostedTotals, postedAndUnpostedTotals.length - pagePostedAndUnpostedTotals * rowsPerPagePostedAndUnpostedTotals);
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
              <SimpleTable rows={this.state.postedTotals} rowsPerPage={this.state.rowsPerPagePostedTotals} page={this.state.pagePostedTotals} emptyRows={emptyRowsPostedTable} handleChangePage={this.handleChangePagePostedTable} handleChangeRowsPerPage={this.handleChangeRowsPerPagePostedTable} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <Paper className={classes.root}>
              <SimpleTable rows={this.state.unpostedTotals} rowsPerPage={this.state.rowsPerPageUnpostedTotals} page={this.state.pageUnpostedTotals} emptyRows={emptyRowsUnpostedTable} handleChangePage={this.handleChangePageUnpostedTable} handleChangeRowsPerPage={this.handleChangeRowsPerPageUnpostedTable} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <Paper className={classes.root}>
              <SimpleTable rows={this.state.postedAndUnpostedTotals} rowsPerPage={this.state.rowsPerPagePostedAndUnpostedTotals} page={this.state.pagePostedAndUnpostedTotals} emptyRows={emptyRowsPostedAndUnpostedTable} handleChangePage={this.handleChangePagePostedAndUnpostedTable} handleChangeRowsPerPage={this.handleChangeRowsPerPagePostedAndUnpostedTable} />
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
            Transaction Totals
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



TransactionTotals.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};
export default withStyles(styles, { withTheme: true })(TransactionTotals);
