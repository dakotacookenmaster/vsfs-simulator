import React, { useState } from "react"
import {
    Slide,
    Card,
    CardContent,
    Tabs,
    Tab,
    Typography,
    makeStyles
} from "@material-ui/core"
import clsx from "clsx"
import TabPanel from "./TabPanel"
import FileExplorer from "../components/FileExplorer"
import TableIcon from "../images/table-icon.svg"
import FileExplorerIcon from "../images/file-explorer-icon.svg"
import HardDriveIcon from "../images/hard-drive.svg"
import InodeTable from "./InodeTable"

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

const DataPane = (props) => {
    const { 
        disks,
        currentDisk,
        currentDirectory,
        currentPath,
    } = props.data

    const {
        getInodeObject,
        getDirectoryObject,
        setCurrentDirectory,
        handleError,
        setCurrentDisk,
    } = props.methods
    const [currentTab, setCurrentTab] = useState(0)
    const classes = useStyles()

    const handleTabChange = (event, newTab) => {
        setCurrentTab(newTab)
    }

    return (
        <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={1000}>
            <Card raised={true} className={classes.fieldContainer}>
                <CardContent>
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
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
                <TabPanel value={currentTab} index={0}>
                    { !Object.keys(disks).length ?
                    <>
                        <div className={clsx(classes.icon, classes.iconWithBackground)}>
                            <img src={HardDriveIcon}  alt="Hard Drive Icon" />
                        </div>
                        <Typography variant="h6">Nothing to see here. Try creating a new disk.</Typography>
                    </> :
                    <FileExplorer
                        data={{
                            disks,
                            currentDisk,
                            currentDirectory,
                            currentPath,
                        }}
                        methods={{
                            getInodeObject,
                            getDirectoryObject,
                            setCurrentDirectory,
                            handleError,
                            setCurrentDisk,
                        }}
                    />
                    }
                </TabPanel>
                <TabPanel value={currentTab} index={1}>
                    {!Object.keys(disks).length ? 
                        <>
                            <div className={clsx(classes.icon, classes.iconWithBackground)}>
                                <img src={HardDriveIcon} alt="Hard Drive Icon" />
                            </div>
                            <Typography variant="h6">Nothing to see here. Try creating a new disk.</Typography>
                        </> :
                        <InodeTable data={{
                            disk: disks[currentDisk]
                        }}/>
                    }
                </TabPanel>
                </CardContent>
            </Card>
        </Slide>
    )
}

export default DataPane