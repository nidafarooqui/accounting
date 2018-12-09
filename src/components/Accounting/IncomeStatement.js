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
import SimpleTable from '../SimpleTable';

import { formatDate, parseDate } from 'react-day-picker/moment';
import { incomeStatement } from '../../endpoints.js';

let accId= 0;
function createData(accountCode, accountName, balance) {
  accId += 1;
  return { accId, accountCode, accountName, balance};
}


class IncomeStatement extends React.Component {
  state = {
    rows: [],
    page: 0,
    rowsPerPage: 10,
    from: undefined,
    to: undefined,
    active: false,
    loading: true
  };

  fetchIncomeStatement(fromDate,throughDate) {

    
    const xmls=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"\
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
           {headers:
            { 'crossDomain': true, 'Content-Type': 'xml',SOAPAction: "","Access-Control-Allow-Origin": "*"}
           }).then(res=>{
            
            this.setState((prevState) => {
              rows: []
            });
            const oParser = new DOMParser();
            const oDOM = oParser.parseFromString(res.data, "application/xml");
            const list = oDOM.getElementsByTagName('getIncomeStatementReturn')[0];
            let arrayOfObjects = [];
            let dataObject = {};
            for (let item of list.children) {
              if(item.tagName.includes('ID')) {
                dataObject['accountCode'] = item.textContent
              }  
              else {
                let balance = parseFloat(item.textContent).toFixed(2)
                dataObject['balance'] = `\$${ Number(balance).toLocaleString()}`;
                let text = item.tagName;
                let result = text.replace( /([A-Z])/g, " $1" );
                let finalResult = (result.charAt(0).toUpperCase() + result.slice(1)).toUpperCase().trim(); // capitalize the first letter - as an example.
                dataObject['accountName'] = finalResult;
              }
              
              if(dataObject.balance !== undefined && dataObject.accountCode !== undefined) {
                arrayOfObjects.push(createData(dataObject.accountCode, dataObject.accountName,dataObject.balance));
                dataObject = {};
              }
              else if(dataObject.accountName && (dataObject.accountName.toLowerCase().includes('total') && !dataObject.accountName.includes('TOTAL_') ) ) {
                arrayOfObjects.push(createData(' ',dataObject.accountName,dataObject.balance));
              }
              else if(dataObject.accountName && dataObject.accountName.includes('TOTAL_')) {
                arrayOfObjects.push(createData(dataObject.accountName.trim(),' ',dataObject.balance));
              }
            }
            let orderedArray = [];
            arrayOfObjects.map((obj) => {
              if(obj.accountCode === "401000") {
                orderedArray.push(createData('ACCOUNTING REVENUES', ' ',' '));
                orderedArray.push(obj);
              }
              else if (obj.accountCode === "409000") {
                orderedArray.push(obj);
                let output = arrayOfObjects.filter((object) => object.accountName.includes('TOTAL REVENUES'));
                orderedArray.push(output[0]);
              }
              else if(obj.accountCode === "410000") {
                orderedArray.push(createData('EXPENSES', ' ', ' '));
                orderedArray.push(obj);
              }
              else if(obj.accountCode === "500000") {
                orderedArray.push(obj);
                let output = arrayOfObjects.filter((object) => object.accountName.includes('TOTAL EXPENSES'));
                orderedArray.push(output[0]);
              }
              else if(obj.accountName.includes("TOTAL INCOME")) {
                orderedArray.push(createData('INCOME',' ',' '));
                let output = arrayOfObjects.filter((object) => object.accountName.includes('TOTAL INCOME'));
                orderedArray.push(output[0]);  
                orderedArray.push(createData('TOTAL', ' ', ' '));
              }
              else if(obj.accountCode.includes('TOTAL_')) {
                obj.accountCode = obj.accountCode.replace('TOTAL_ ','');
                orderedArray.push(obj);
              }
              return orderedArray;
            });
            this.setState(() => {
              return {
                rows: orderedArray,
                from: new Date(`${fromDate}T00:00:00Z`),
                to: new Date(`${throughDate}T00:00:00Z`),
                loading: false
              };
            });

           }).catch(err=>{console.log(err.response.data);});
  }
  componentDidMount() {
    //to date is today's date
    let today = new Date();
    let toDate = today.toISOString().split('T')[0];
    //from date is the start of the year by default
    let fromDate = `${today.getFullYear()}-01-01`;

    fromDate = (this.state.from === undefined) ? fromDate : this.state.from;
    toDate = (this.state.to === undefined) ? toDate: this.state.to;
   
    console.log(`FROM DATE: ${fromDate}`);
    console.log(`TO DATE: ${toDate}`)

   this.fetchIncomeStatement(fromDate,toDate);


    // const url = 'http://localhost:8089/IncomeStatement2/services/GetIncomeStatement?wsdl';
    // const headers = new Headers();
    // headers.append('Content-Type', 'text/xml');
    // headers.append('SOAPAction', 'getIncomeStatement');
    // headers.append('Access-Control-Allow-Origin','*');
    // let dataPrefix = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:arg="http://incomeStatement.ofbiz.com"><soapenv:Header/><soapenv:Body><arg:getIncomeStatement><arg:scopeCoordinateIds>APMT/USLAX/LAX/LAX</arg:scopeCoordinateIds><arg:xmlDoc><![CDATA[';
    // let dataSuffix = ']]></arg:xmlDoc></arg:getIncomeStatement></soapenv:Body></soapenv:Envelope>';

    // let data = dataPrefix + data + dataSuffix;

    // console.log('about to send ' + data);

    // fetch(url, {
    //     body: data,
    //     method: 'POST',
    //     mode: 'cors',
    //     headers: headers,
    //     credentials: 'omit'
    // })
    //     .then(response => console.log(response))
    //     .catch(function(error) {
    //         console.log(error);
    //     });
    // //.done();
  
  }
  
  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
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

    this.fetchIncomeStatement(fromDate,toDate);


  }
  handleFromChange = (from) => {
    // Change the from date and focus the "to" input field
    this.setState({ from });
  }
  handleToChange = (to) => {
    this.setState({ to },this.showFromMonth);
    this.setState({ active: false });
  }

  toggleClass = () => {
    const currentState = this.state.active;
    this.setState({ active: true });
  };

  render() {
    const { classes } = this.props;
    const { rows, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);
    const { from, to } = this.state;
    const modifiers = { start: from, end: to };
    let content;
    if(this.state.loading) {
      content = 
      <div className = {classes.loadingBlock}>
        <CircularProgress className={classes.progress} size={50} style={{ color: red[500] }} thickness={7} />
      </div>
    } else {
      content =
           <Grid container direction="row"
             justify="flex-end">
             <Grid item xs={12} sm={12} md={12}>
               <Paper className={classes.root}>
                <SimpleTable rows = {this.state.rows} rowsPerPage = {this.state.rowsPerPage} page = {this.state.page} emptyRows = {emptyRows} handleChangePage = {this.handleChangePage} handleChangeRowsPerPage = {this.handleChangeRowsPerPage} />
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
            Income Statement
          </Typography>
          <div className={classes.tableContainer}>  
           <div className = {classes.dateContainer}>
             <div className = {classes.dateContent}>
               <div className={`InputFromTo ${this.state.active ? 'toggleHeight': null} `} onClick = {this.toggleClass}>
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





IncomeStatement.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};
export default withStyles(styles, { withTheme: true })(IncomeStatement);

