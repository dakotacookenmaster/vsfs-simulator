import React, { useState } from "react"
import {
  Slide,
  Card,
  CardContent,
  Tabs,
  Tab,
  makeStyles,
} from "@material-ui/core"
import TabPanel from "./TabPanel"
import clsx from "clsx"
import HardDriveIcon from "../images/hard-drive.svg"
import FolderWithFilesIcon from "../images/folder-with-files.svg"
import DataTypeForm from "./DataTypeForm"
import DiskForm from "./DiskForm"

const useStyles = makeStyles(theme => {
  return {
    fieldContainer: {
        height: "auto",
    },
    icon: {
      width: "50px",
      height: "50px",
      margin: "10px auto",
    },
    iconWithBackground: {
        borderRadius: "100%",
        background: "white",
    },
  }
})

const InputPane = (props) => {
    const { 
      disks,
      currentLowLevelDirectoryName,
      currentDisk,
      currentPath,
    } = props.data
    const { 
        setDisks,
        setErrors,
        setErrorSnackbarOpen,
        setCurrentDisk,
        setCurrentLowLevelDirectory,
        createFile,
        createDirectory,
        createHardLink,
    } = props.methods
    const [currentTab, setCurrentTab] = useState(0)
    const classes = useStyles()

    const handleTabChange = (event, newTab) => {
        setCurrentTab(newTab)
    }

    return (
        <Slide direction="right" in={true} mountOnEnter unmountOnExit timeout={1000}>
            <Card raised={true} className={classes.fieldContainer}>
              <CardContent>
                <Tabs
                  value={currentTab}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                >
                  <Tab value={0} label={
                    <div className={clsx(classes.icon, classes.iconWithBackground)}>
                      <img src={HardDriveIcon} alt="Hard Drive Icon" />
                    </div>
                  } />
                  { Object.keys(disks).length && 
                    <Tab value={1} label={
                      <div className={classes.icon}>
                        <img src={FolderWithFilesIcon} alt="Folder With Files Icon" />
                      </div>
                    } />
                  }
                </Tabs>
                <TabPanel value={currentTab} index={0}>
                  <DiskForm
                    data={{
                        disks,
                    }}
                    methods={{
                        setDisks,
                        setErrors,
                        setErrorSnackbarOpen,
                        setCurrentDisk,
                        setCurrentLowLevelDirectory,
                    }}
                  />
                </TabPanel>
                <TabPanel value={currentTab} index={1}>
                  <DataTypeForm
                    data={{
                      currentDisk,
                      currentLowLevelDirectoryName,
                      currentPath,
                    }}
                    methods={{
                      createFile,
                      createDirectory,
                      createHardLink,
                    }}
                  />
                </TabPanel>
              </CardContent>
            </Card>
          </Slide>
    )
}

export default InputPane