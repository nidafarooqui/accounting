import React from 'react';
import { css } from 'emotion';
import logo from '../../public/images/logo.png';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import LogoutButton from '../../public/images/logout_icon.png';
import { routes } from '../routers/routes';

const headerContainer = css`
    display: flex;
    border-bottom: solid 1px #dddfdf;
    padding: 1.2rem;
    overflow: hidden;
    height: 75px;
    width: 99rem !important;
    
`;
//width: 99rem !important;
//background: white;
const logoutButton = css`
    border: none;
    
`;
   
const appLogo = css `
    width: 10rem;
    height: 4rem;
`;

const Header = () => (
    <Grid container className = {headerContainer} direction="row" justify="space-between" alignItems="center">
        <Grid item > 
            
            <Tooltip title = "Home">
                <Button component = {Link} to = {routes.ccrlAccounting}>
                    <img src={logo} className={appLogo} alt="logo"/>
                </Button>
                
            </Tooltip>
        </Grid>
        <Grid item>
        {/* <Typography variant="title" color="inherit" noWrap>
              Accounting Dashboard
            </Typography> */}
        </Grid>
        <Grid item  >
            <Tooltip title = "Back To Nimbus">
                <Button component = {Link} to = {routes.nimbus} className= {logoutButton}>
                    <img src= {LogoutButton} alt="logo"/>
                </Button>
            </Tooltip>
        </Grid>
    </Grid>
);
export default Header;