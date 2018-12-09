const drawerWidth = 260;

export const styles = theme => ({
    root: {
      flexGrow: 1,
      height: '100%',
      zIndex: 1,
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 8px',
      ...theme.mixins.toolbar,
    },
    toolbarIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 8px',
      ...theme.mixins.toolbar,
    },
    appBar: {
      //color: '#FFF',
        color: '#486170',
      //backgroundColor: '#33AFEE',
      backgroundColor: '#F6F8F8',
      //backgroundColor: '#DEE5E8',
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginLeft: 12,
      marginRight: 36,
    },
    hide: {
      display: 'none',
    },
    title: {
      flexGrow: 1,
    },
    drawerPaper: {
      backgroundColor: '#DEE5E8',
      overflowX: 'hidden',
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerPaperClose: {
      backgroundColor: '#DEE5E8',
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing.unit * 7,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing.unit * 9,
      },
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      padding: theme.spacing.unit * 3,
      height: '100%',
      overflow: 'auto',
    },
    chartContainer: {
      marginLeft: -22,
    },
    tableContainer: {
      height: '100%',
    },
    stats: {
      color: "#999999",
      display: "inline-flex",
      fontSize: "12px",
      lineHeight: "22px",
      "& svg": {
        top: "4px",
        width: "16px",
        height: "16px",
        position: "relative",
        marginRight: "3px",
        marginLeft: "3px"
      },
      "& .fab,& .fas,& .far,& .fal,& .material-icons": {
        top: "4px",
        fontSize: "16px",
        position: "relative",
        marginRight: "3px",
        marginLeft: "3px"
      }
    },
    cardCategory: {
      color: "#999999",
      margin: "0",
      fontSize: "14px",
      marginTop: "0",
      paddingTop: "10px",
      marginBottom: "0"
    },
    cardCategoryWhite: {
      color: "rgba(255,255,255,.62)",
      margin: "0",
      fontSize: "14px",
      marginTop: "0",
      marginBottom: "0"
    },
    cardTitle: {
      color: "#3C4858",
      marginTop: "0px",
      minHeight: "auto",
      fontWeight: "300",
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      marginBottom: "3px",
      textDecoration: "none",
      "& small": {
        color: "#777",
        fontWeight: "400",
        lineHeight: "1"
      }
    },
    cardTitleWhite: {
      color: "#FFFFFF",
      marginTop: "0px",
      minHeight: "auto",
      fontWeight: "300",
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      marginBottom: "3px",
      textDecoration: "none",
      "& small": {
        color: "#777",
        fontWeight: "400",
        lineHeight: "1"
      }
    },
    sidebarBlock : {
      backgroundColor: '#DEE5E8',
    
    },
    table: {
          minWidth: 700,
          
        },
    row: {
          '&:nth-of-type(even)': {
            backgroundColor: theme.palette.background.default,
          },
          '&:hover': {
            backgroundColor: '#EDEDED',
          },
          whiteSpace: 'nowrap',
         
    },
    totalCell: {
      backgroundColor: '#61C5AA !important',
      //61C5AA
      '&:hover': {
        backgroundColor: '#61C5AA',
      },
    },
    tableWrapper: {
      overflowX: 'auto',
    },
    headingCell: {
      backgroundColor: '#5CABFD !important',
      whiteSpace: 'nowrap',
      '&:hover': {
        backgroundColor: '#5CABFD',
      },
    },
    button: {
      margin: theme.spacing.unit,
    },
    searchIcon: {
      marginLeft: theme.spacing.unit,
    },
    divider: {
      margin: `${theme.spacing.unit * 2}px 0`,
    },
    dateContent: {
        flex: 1
    },
    dateContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: 'auto',
        // minHeight: "35vh"
    },
    progress: {
      margin: theme.spacing.unit * 2,
    },
    loadingBlock: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }
  });