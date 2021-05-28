import React, { useState } from "react"
import {
    Home as HomeIcon,
    ArrowUpward as ArrowUpwardIcon,
} from "@material-ui/icons"
import {
    TextField,
    MenuItem,
    Button,
    InputLabel,
    Select,
    Paper,
    FormControl,
    makeStyles,
    Typography
} from "@material-ui/core"
import FileSubtree from "../components/FileSubtree"
import FileView from "../components/FileView"

const useStyles = makeStyles(theme => {
    return {
        fileExplorer: {
            padding: "20px",
        },
        ribbon: {
            width: "100%",
            display: "flex",
            alignItems: "center",
            "& > *": {
            marginRight: "10px",
            minHeight: "56px",
            },
            "& > *:first-child": {
            minWidth: "110px",
            },
            "& > *:last-child": {
            marginRight: "0px",
            height: "100%",
            width: "100%",
            textAlign: "left",
            },
        },
        explorerGroup: {
            display: "flex",
            marginTop: "10px",
            minHeight: "300px",
            maxHeight: "300px",
            height: "100%",
        },
        tabHeader: {
            textAlign: "left",
        },
    }
})

const FileExplorer = (props) => {
    const classes = useStyles()
    const { 
        disks,
        currentDisk,
        currentLowLevelDirectoryName,
        currentPath,
    } = props.data
    const {
        getInodeObject,
        getDirectoryObject,
        setCurrentLowLevelDirectory,
        handleError,
        setCurrentDisk,
    } = props.methods

    const [selected, setSelected] = useState(null)

    const handleSelectChange = (event) => {
        const { value } = event.target
        setCurrentLowLevelDirectory(0)
        setCurrentDisk(value)
    }

    const unlink = (diskName, lowLevelDirectoryName) => {
        alert("UNLINKED")
        const inode = getInodeObject(diskName, lowLevelDirectoryName)
        const directory = getDirectoryObject(diskName, lowLevelDirectoryName)
        if(inode.type === "directory") {
            if(Object.keys(directory).length > 2) {
                const title = "Unable to Unlink"
                const description = "You cannot unlink a folder that has any files or folders inside of it. Try removing those first."
                handleError(title, description)
            }
          /*********************************
           * 
           * 
           * 
           * 
           * 
          // FIXME!
          *
          *
          * 
          * 
          * 
          * ********************************/
        }
    }

    return (
        <>
            <Typography variant="h5" className={classes.tabHeader}>File Explorer</Typography>
            <hr style={{marginBottom: "20px"}} />
            <Paper variant="outlined" className={classes.fileExplorer}>
                <div className={classes.ribbon}>
                    <FormControl variant="outlined">
                        <InputLabel>Current Disk</InputLabel>
                        <Select 
                            defaultValue={Object.keys(disks)[0]}
                            value={currentDisk}
                            label="Current Disk"
                            onChange={handleSelectChange}
                        >
                            {
                                Object.keys(disks).map(diskName => {
                                    return (<MenuItem key={diskName} value={diskName}>{diskName}</MenuItem>)
                                })
                            }
                        </Select>
                    </FormControl>
                    <Button variant="outlined" onClick={() => {
                        setCurrentLowLevelDirectory(0)
                    }}>
                        <HomeIcon />
                    </Button>
                    <Button variant="outlined" onClick={() => {
                        setCurrentLowLevelDirectory(prevCurrentDirectory => {
                            const currentDirectoryObject = getDirectoryObject(currentDisk, currentLowLevelDirectoryName)
                            return currentDirectoryObject[".."]
                        })
                    }}>
                        <ArrowUpwardIcon />
                    </Button>
                    <TextField variant="outlined" value={currentPath} disabled />
                </div>
                <div style={{clear: "both"}}></div>
                <div className={classes.explorerGroup}>
                    <FileSubtree 
                        data={{
                            selected,
                            disks,
                            currentDisk
                        }}
                        methods={{
                            getDirectoryObject,
                            getInodeObject,
                            setSelected,
                            setCurrentLowLevelDirectory,
                        }}
                    />
                    <FileView
                        data={{
                            selected,
                            currentDisk,
                            currentLowLevelDirectoryName,
                        }}
                        methods={{
                            setSelected,
                            getDirectoryObject,
                            getInodeObject,
                            setCurrentLowLevelDirectory,
                            unlink,
                        }}
                    />
                </div>
            </Paper>
        </>
    )
}

export default FileExplorer