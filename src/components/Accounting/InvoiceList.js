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
import { invoiceList } from '../../endpoints.js';
class InvoiceList extends React.Component {
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
        this.fetchInvoiceList();
    }

    fetchInvoiceList() {
        const xmls = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"\
                            xmlns:web="http://invoiceIdList.ofbiz.accounting">\
            <soapenv:Header/>\
            <soapenv:Body>\
              <web:getInvoiceList>\
              </web:getInvoiceList>\
            </soapenv:Body>\
          </soapenv:Envelope>`;

        axios.post(invoiceList,
            xmls,
            {
                headers:
                    { 'crossDomain': true, 'Content-Type': 'xml', SOAPAction: "", "Access-Control-Allow-Origin": "*" }
            }).then(res => {

                // this.setState((prevState) => {
                //     rows: []
                // });
                const oParser = new DOMParser();
                const oDOM = oParser.parseFromString(res.data, "application/xml");
                const invoiceIdListReturn = oDOM.getElementsByTagName('getInvoiceListReturn')[0];
                let arrayOfObjects = [];
                let invoiceArray = [];
                for (let invoiceIdList of invoiceIdListReturn.children) {
                    for( let item of invoiceIdList.children) {
                        if(item.tagName.includes('invoiceType')) {
                            let text = item.textContent;
                            let result = text.replace(/_/g, ' ');
                            invoiceArray.push(result);
                        }
                        else if (item.tagName.includes('invoiceDate')) {
                            let date = item.textContent;
                            //let newDate = new Date(date);
                            let resultDate = moment(date).format("dddd, MMMM Do YYYY, h:mm:ss a");;
                            //let result = `${newDate.toDateString()} ${newDate.toLocaleTimeString()}`;
                            invoiceArray.push(resultDate);
                            
                        }
                        else {
                            invoiceArray.push(item.textContent)
                        }
                       
                    }
                    arrayOfObjects.push(invoiceArray);
                    invoiceArray = [];
                }
                this.setState(() => {
                    return {
                        rows: arrayOfObjects,
                        loading: false
                    };
                });

            }).catch(err => { console.log(err.response.data); });
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
                            <GeneralTable
                                tableHeaderColor="warning"
                                tableHead={["Invoice ID", "Invoice Type", "Invoice Date"]}
                                rows={this.state.rows}
                                rowsPerPage={this.state.rowsPerPage}
                                page={this.state.page}
                                emptyRows={emptyRows}
                                handleChangePage={this.handleChangePage}
                                handleChangeRowsPerPage={this.handleChangeRowsPerPage} 
                                handleCellClick = {this.handleCellClick}
                                interactive = {true}
                            />
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
                        Invoice List
                    </Typography>
                    <div className={classes.tableContainer}>
                        <div className={classes.dateContainer}>
                        </div>
                        <Divider className={classes.divider} />
                        {content}
                    </div>
                </main>
            </div>
        );
    };
};



InvoiceList.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};
export default withStyles(styles, { withTheme: true })(InvoiceList);