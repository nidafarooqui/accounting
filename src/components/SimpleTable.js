import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TablePaginationActionsWrapped from './Table/TablePaginationActions';
import { styles } from './Accounting/AccountDashboardStyles';

const CustomTableCell = withStyles(theme => ({
  
  head: {
    //backgroundColor: '#48AFED',
    backgroundColor: '#4498DA',
    //backgroundColor: '#5CABFD',
    color: theme.palette.common.white,
    fontSize: 16,
    
  },
  body: {
    fontSize: 14,
  },
  

}))(TableCell);

const textColor = {
  color: 'white' 
};

const SimpleTable = (props) => {
  const { classes } = props;
  const { rows, rowsPerPage, page, emptyRows} = props;
  return (
     <Table className={classes.table}>  
        <TableHead>
          <TableRow >
          {rows.every(row => (row.accountCode)) && <CustomTableCell component="th" scope="row">ACCOUNT CODE</CustomTableCell>}
            {rows.every(row => (row.accountName)) && <CustomTableCell component="th" scope="row">ACCOUNT NAME</CustomTableCell>}
            {rows.every(row => (row.totalDebit)) && <CustomTableCell component="th" scope="row">TOTAL DEBIT (RECEIPTS)</CustomTableCell>}
            {rows.every(row => (row.totalCredit)) && <CustomTableCell component="th" scope="row">TOTAL CREDIT (DISBURSEMENT)</CustomTableCell>}
            {rows.every(row => (row.balance)) && <CustomTableCell numeric>BALANCE</CustomTableCell>}

             {rows.every(row => (row.openingD)) && <CustomTableCell numeric>OPENING D</CustomTableCell>}
             {rows.every(row => (row.openingC)) && <CustomTableCell numeric>OPENING C</CustomTableCell>}
             {rows.every(row => (row.dr)) && <CustomTableCell numeric>DR</CustomTableCell>}
             {rows.every(row => (row.cr)) && <CustomTableCell numeric>CR</CustomTableCell>}
             {rows.every(row => (row.closingD)) && <CustomTableCell numeric>CLOSING D</CustomTableCell>}
             {rows.every(row => (row.closingC)) && <CustomTableCell numeric>CLOSING C</CustomTableCell>}
             

            
          </TableRow>
        </TableHead>
        <TableBody>
          {props.rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => {
            return (
            <TableRow key={`${row.accId} \_ ${row.accountName}`} className = {`${row.accountCode === ' ' ? classes.totalCell : classes.row} ${row.balance === ' '  ? classes.headingCell : classes.row} ${row.dr === ' '  ? classes.headingCell : classes.row}`} >
                {row.accountCode && <CustomTableCell component="th" scope="row" style = {row.accountCode === ' ' || row.accountName === ' ' && (row.balance === ' ' || row.dr === ' ') ? textColor : {}}>
                  {row.accountCode}
                </CustomTableCell>}
                <CustomTableCell component="th" scope="row">{row.accountName}</CustomTableCell>
                {row.totalDebit && <CustomTableCell component="th" scope="row">{row.totalDebit}</CustomTableCell> }
                {row.totalCredit && <CustomTableCell component="th" scope="row">{row.totalCredit}</CustomTableCell> }
                {row.balance && <CustomTableCell numeric>{row.balance}</CustomTableCell>}
                {row.openingD && <CustomTableCell numeric>{row.openingD}</CustomTableCell>} 
                {row.openingC && <CustomTableCell numeric>{row.openingC}</CustomTableCell>} 
                {row.dr && <CustomTableCell numeric>{row.dr}</CustomTableCell>} 
                {row.cr && <CustomTableCell numeric>{row.cr}</CustomTableCell>}
                {row.closingD && <CustomTableCell numeric>{row.closingD}</CustomTableCell>}
                {row.closingC && <CustomTableCell numeric>{row.closingC}</CustomTableCell>}
              </TableRow>
            );
          })}
          {/* {emptyRows > 0 && (
              <TableRow style={{ height: 48 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
          )} */}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={props.handleChangePage}
              onChangeRowsPerPage={props.handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActionsWrapped}
            />
          </TableRow>
        </TableFooter>
      </Table>
  );
}

SimpleTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleTable);