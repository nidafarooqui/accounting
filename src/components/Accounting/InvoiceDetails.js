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
import 'react-day-picker/lib/style.css';
import GeneralTable from '../GeneralTable';
import { invoiceDetails } from '../../endpoints.js';
class InvoiceDetails extends React.Component {
    state = {
        rows: [
            [12, "Sales Order", "12-13-1455"],
            [13, "Sales Order", "12-13-1455"],
            [14, "Sales Order", "12-13-1455"]
        ],
        page: 0,
        rowsPerPage: 10,
        active: false,
        loading: true
    };

    componentDidMount() {
        this.fetchInvoiceDetails();
    }

    fetchInvoiceDetails() {
        debugger;
        const xmls = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"\
                            xmlns:web="http://invoiceIdTransactions.ofbiz.accounting">\
            <soapenv:Header/>\
            <soapenv:Body>\
              <web:getInvoiceIdTransactions>\
                <web:invoiceId>${this.props.match.params.id}</web:invoiceId>
              </web:getInvoiceIdTransactions>\
            </soapenv:Body>\
          </soapenv:Envelope>`;

        axios.post(invoiceDetails,
            xmls,
            {
                headers:
                    { 'crossDomain': true, 'Content-Type': 'xml', SOAPAction: "", "Access-Control-Allow-Origin": "*" }
            }).then(res => {

                // this.setState((prevState) => {
                //     rows: []
                // });
                debugger;
                const oParser = new DOMParser();
                const oDOM = oParser.parseFromString(res.data, "application/xml");
                const invoiceIdTransactionsReturn = oDOM.getElementsByTagName('getInvoiceIdTransactionsReturn')[0];
                let invoiceArray = [];
                let arrayOfObjects = [];
                let invoiceObject = {};
               
                for (let transactionDetails of invoiceIdTransactionsReturn.children) {
                    
                    for( let item of transactionDetails.children) {
                        // if(item.tagName.includes('invoiceType')) {
                        //     let text = item.textContent;
                        //     let result = text.replace(/_/g, ' ');
                        //     invoiceArray.push(result);
                        // }
                        // else if (item.tagName.includes('invoiceDate')) {
                        //     let date = item.textContent;
                        //     //let newDate = new Date(date);
                        //     let resultDate = moment(date).format("dddd, MMMM Do YYYY, h:mm:ss a");;
                        //     //let result = `${newDate.toDateString()} ${newDate.toLocaleTimeString()}`;
                        //     invoiceArray.push(resultDate);
                        // }
                        // else {
                            //debugger;
                            invoiceObject[item.tagName] = item.textContent;
                            //invoiceArray.push(item.textContent)
                        //}
                       
                    }
                    // let text = item.tagName;
                    // let result = text.replace( /([A-Z])/g, " $1" ).toUpperCase();
                    debugger;
                    let orderedObject = {
                        "acctgTransID":invoiceObject.acctgTransID,
                        "acctgTransEntrySeqId":invoiceObject.acctgTransEntrySeqId,
                        "isPosted":invoiceObject.isPosted,
                        "fiscalGLTypeId":invoiceObject.fiscalGLTypeId,
                        "acctgTransTypeId":invoiceObject.acctgTransTypeId,
                        "transactionDate":invoiceObject.transactionDate,
                        "postedDate":invoiceObject.postedDate,
                        "glJournalId":invoiceObject.glJournalId,
                        "transTypeDescription":invoiceObject.transTypeDescription,
                        "paymentId":invoiceObject.paymentId,
                        "fixedAssetId":invoiceObject.fixedAssetId,
                        "description":invoiceObject.description,
                        "glAccountId":invoiceObject.glAccountId,
                        "productId":invoiceObject.productId,
                        "debitCreditFlag":invoiceObject.debitCreditFlag,
                        "amount":invoiceObject.amount,
                        "origAmount":invoiceObject.origAmount,
                        "organizationPartyId":invoiceObject.organizationPartyId,
                        "glAccountType":invoiceObject.glAccountType,
                        "accountCode":invoiceObject.accountCode,
                        "accountName":invoiceObject.accountName,
                        "glAccountClass":invoiceObject.glAccountClass,
                        "party":invoiceObject.party,
                        "reconcileStatusId":invoiceObject.reconcileStatusId,
                        "acctgTransEntryTypeId":invoiceObject.acctgTransEntryTypeId,
                    }
                    invoiceArray = Object.values(orderedObject);
                    arrayOfObjects.push(invoiceArray);
                    invoiceObject = {};
                    orderedObject = {};
                    //let invoiceArray = Object.values(invoiceObject)
                }
                debugger;

                invoiceArray = 
                
                this.setState(() => {
                    return {
                        rows: arrayOfObjects,
                        loading: false
                    };
                });

            }).catch(err => { console.log(err.response.data); });
    }

    //function to sort the table in specific rows
  sortTable(array, rowOrder) {
    array.sort( ( a, b ) => {
        debugger;
      const aRowIndex = rowOrder.indexOf( a.name );
      const bRowIndex = rowOrder.indexOf( b.name );
      if ( aRowIndex === bRowIndex )
          return a.name - b.name;
      return aRowIndex - bRowIndex;
  } );
  }

    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };


    render() {
        const { classes } = this.props;
        const { rows, rowsPerPage, page } = this.state;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);
        let content;
        if (this.state.loading) {
            content =
                <div className={classes.loadingBlock}>
                    <CircularProgress className={classes.progress} size={50} style={{ color: red[500] }} thickness={7} />
                </div>
        } else {
            content =
                <Grid container direction="row"
                    justify="flex-end">
                    <Grid item xs={12} sm={12} md={12}>
                        <Paper className={classes.root}>
                        <div className={classes.tableWrapper}>
                            <GeneralTable
                                tableHeaderColor="warning"
                                tableHead={["ACCTG TRANS ID","ACCTG TRANS ENTRY SEQ ID","IS POSTED","FISCAL GL TYPE ID","ACCTG TRANS TYPE ID","TRANSACTION DATE","POSTED DATE",	"GL JOURNAL ID","TRANS TYPE DESCRIPTION","PAYMENT ID","FIXED ASSET ID","DESCRIPTION","GL ACCOUNT ID","PRODUCT ID","DEBIT CREDIT FLAG","AMOUNT","ORIG AMOUNT","ORGANIZATION PARTY ID","GL ACCOUNT TYPE","ACCOUNT CODE","ACCOUNT NAME","GL ACCOUNT CLASS","PARTY","RECONCILE STATUS ID","ACCTG TRANS ENTRY TYPE ID"]}
                                rows={this.state.rows}
                                rowsPerPage={this.state.rowsPerPage}
                                page={this.state.page}
                                emptyRows={emptyRows}
                                handleChangePage={this.handleChangePage}
                                handleChangeRowsPerPage={this.handleChangeRowsPerPage} 
                                handleCellClick = {this.handleCellClick}
                                interactive = {false}
                            />
                            </div>
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
                        Invoice ID: {this.props.match.params.id}
                    </Typography>
                    <div className={classes.tableContainer}>   
                        {content}
                    </div>
                </main>
            </div>
        );
    };
};



InvoiceDetails.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};
export default withStyles(styles, { withTheme: true })(InvoiceDetails);