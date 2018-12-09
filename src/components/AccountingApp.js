import React from 'react';
import Header from './Header';
import Dashboard from './Dashboard';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';


export const theme = createMuiTheme({
    palette: {
      primary: {
        light: '#F6F8F8',
        main: '#DEE5E8',
        dark: '#486170',
        contrastText: '#486170',
      },
      secondary: {
        light: '#c44445',
        main: '#fc7570',
        dark: '#8e081e',
        contrastText: '#fff',
      },
    },
  });
//'#ecf0f1', main
//'#fff', light


  export default class AccountingApp extends React.Component {
    render() {
        return(
            <MuiThemeProvider theme={theme} >
                {/* <Header color="primary"/> */}
                <Dashboard color="secondary" />
            </MuiThemeProvider>
        );
    }

}
