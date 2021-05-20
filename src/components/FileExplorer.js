import React, { useContext } from "react"
import { SystemContext } from "../contexts/SystemContext"
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
} from "@material-ui/core"
import FileSubtree from "../components/FileSubtree"
import FileView from "../components/FileView"

const FileExplorer = (props) => {
    const { defaultExpanded } = props
    const {
        getDirectoryObject,
        currentDisk,
        currentDirectory,
        disks,
        setCurrentDirectory,
        currentPath,
        classes,
        handleSelectChange,
    } = useContext(SystemContext)
    return (
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
                    setCurrentDirectory(0)
                }}>
                    <HomeIcon />
                </Button>
                <Button variant="outlined" onClick={() => {
                    setCurrentDirectory(prevCurrentDirectory => {
                        const currentDirectoryObject = getDirectoryObject(currentDisk, currentDirectory)
                        return currentDirectoryObject[".."]
                    })
                }}>
                    <ArrowUpwardIcon />
                </Button>
                <TextField variant="outlined" value={currentPath} disabled className={classes.pathBar} />
            </div>
            <div style={{clear: "both"}}></div>
            <div className={classes.explorerGroup}>
                <FileSubtree defaultExpanded={defaultExpanded}/>
                <FileView />
            </div>
        </Paper>
    )
}

export default FileExplorer