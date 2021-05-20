import React, { useContext, useState } from "react"
import clsx from "clsx"
import { 
  Typography, 
  Card,  
  CardContent, 
  Slide, 
  Tabs,
  Tab,
  Snackbar,
  IconButton,
} from "@material-ui/core"
import { 
  Close as CloseIcon, 
} from "@material-ui/icons"
import HardDriveIcon from "./images/hard-drive.svg"
import FolderWithFilesIcon from "./images/folder-with-files.svg"
import FileExplorerIcon from "./images/file-explorer-icon.svg"
import TableIcon from "./images/table-icon.svg"
import './App.css'
import Header from "./components/Header"
import { SystemContext } from "./contexts/SystemContext"
import DiskForm from "./components/DiskForm"
import FileExplorer from "./components/FileExplorer"

const App = () => {
  const [currentRightTab, setCurrentRightTab] = useState(0)
  const [currentLeftTab, setCurrentLeftTab] = useState(0)

  const {
    disks,
    classes,
    errors,
    errorSnackbarOpen,
    setErrorSnackbarOpen,
  } = useContext(SystemContext)

  const TabPanel = (props) => {
    const { children, index, value } = props
    return (
      <div className={classes.tabContent} hidden={index !== value} style={{marginTop: "20px"}}>
        { children }
      </div>
    )
  }

  const handleRightTabChange = (event, newValue) => {
    setCurrentRightTab(newValue)
  }

  const handleLeftTabChange = (event, newValue) => {
    setCurrentLeftTab(newValue)
  }

  return (
    <main className={classes.main}>
      <Header />
      <div className={classes.row}>
        <div className={classes.column}>
          <Slide direction="right" in={true} mountOnEnter unmountOnExit timeout={1000}>
            <Card raised={true} className={classes.fieldContainer}>
              <CardContent>
                <Tabs
                  value={currentLeftTab}
                  onChange={handleLeftTabChange}
                  indicatorColor="primary"
                >
                  <Tab value={0} label={
                    <div className={clsx(classes.icon, classes.iconWithBackground)}>
                      <img src={HardDriveIcon} alt="Hard Drive Icon" />
                    </div>
                  } />
                  <Tab value={1} label={
                    <div className={classes.icon}>
                      <img src={FolderWithFilesIcon} alt="Folder With Files Icon" />
                    </div>
                  } />
                </Tabs>
                <TabPanel value={currentLeftTab} index={0}>
                  <DiskForm />
                </TabPanel>
                <TabPanel value={currentLeftTab} index={1}>

                </TabPanel>
              </CardContent>
            </Card>
          </Slide>
        </div>
        <div className={classes.column}>
          <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={1000}>
            <Card raised={true} className={classes.fieldContainer}>
              <CardContent>
                <Tabs
                  value={currentRightTab}
                  onChange={handleRightTabChange}
                  indicatorColor="primary"
                >
                  <Tab value={0} label={
                    <div className={classes.icon}>
                      <img src={FileExplorerIcon} alt="File Explorer Icon" />
                    </div>
                  } />
                  <Tab value={1} label={
                    <div className={classes.icon}>
                      <img src={TableIcon} alt="Table Icon" />
                    </div>
                  } />
                </Tabs>
                <TabPanel value={currentRightTab} index={0}>
                  { !Object.keys(disks).length ?
                    <>
                      <div className={clsx(classes.icon, classes.iconWithBackground)}>
                        <img src={HardDriveIcon}  alt="Hard Drive Icon" />
                      </div>
                      <Typography variant="h6">Nothing to see here. Try creating a new disk.</Typography>
                    </> :
                    <FileExplorer />
                  }
                </TabPanel>
                <TabPanel value={currentRightTab} index={1}>
                  <div className={clsx(classes.icon, classes.iconWithBackground)}>
                    <img src={HardDriveIcon} alt="Hard Drive Icon" />
                  </div>
                  <Typography variant="h6">Nothing to see here. Try creating a new disk.</Typography>
                </TabPanel>
              </CardContent>
            </Card>
          </Slide>
        </div>
      </div>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={errorSnackbarOpen}
        action={
          <>
            <ul>
            {
              errors.map(error => {
                return (<li key={error}><Typography>{error}</Typography></li>)
              })
            }
            </ul>
            <IconButton onClick={(event, reason) => (reason !== 'clickaway' && setErrorSnackbarOpen(false))}>
              <CloseIcon color="primary" />
            </IconButton>
          </>
        }
      >
      </Snackbar>
    </main>
  )
}

export default App
