import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { css } from 'emotion';
import LogoutButton from '../../public/images/logout_icon.png';

const logoutButton = css`
    border: none;
    background: white;
`;

//color: "#E14B3C",
const Logout = (props) => {
    const BASE_URL = "https://nimbusrms.com/Home/Index";
    return(
        <Tooltip title = "Back To Nimbus">
            <a className= {logoutButton} href = {BASE_URL}>
                <img src= {LogoutButton} alt="logo"/>
            </a>
        </Tooltip>
        
    );
       
};


export default Logout;
