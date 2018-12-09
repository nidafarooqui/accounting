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
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom'
import { routes } from '../routers/routes';


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




const GeneralTable = (props) => {
    const { classes, tableHead,tableSubHead, tableData, tableHeaderColor } = props;
    const { rows, rowsPerPage, page, emptyRows, handleCellClick} = props;
    return (
     
        <Table style={{ tableLayout: 'auto' }} className={classes.table} >
       
          {tableHead !== undefined ? (
            <TableHead >
              <TableRow style={{ width: "10%" }}>
                {tableHead.map((prop, key) => {
                  return (
                    <CustomTableCell
                      
                      className={classes.headingCell}
                      key={key}
                    >
                      {prop}
                    </CustomTableCell>
                  );
                })}
              </TableRow>
            </TableHead>
          ) : null}
         
          <TableBody>
          {props.rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row,key) => {
              return (
                <TableRow  className={classes.row}  key={key} style={{ width: "10%" }}>
                  {row.map((prop, key) => {
                    debugger;
                      let button = row[0];
                      if(prop === row[0]) {
                        return (
                      <CustomTableCell key={key} >
                      {props.interactive ? <Button variant="contained" color="secondary" className={classes.button} component={Link} to={`${routes.invoiceList}/${prop}`}>
                      {prop}
                    </Button>
                    :
                    prop
                     
                    }
                      </CustomTableCell>
                    );
                      }
                      else {
                        return (
                      <CustomTableCell key={key}>
                        {prop}
                      </CustomTableCell>
                    );
                      }
                    
                  })}
                </TableRow>
              );
            })}
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
  

  GeneralTable.propTypes = {
    classes: PropTypes.object.isRequired,
    tableHead: PropTypes.arrayOf(PropTypes.string),
    tableData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
  };
  
  export default withStyles(styles)(GeneralTable);
  