import React, { useContext, useState } from "react"
import { SystemContext } from "../contexts/SystemContext"
import {
    Typography,
    Tooltip,
    Button,
    InputAdornment,
    Switch,
    TextField,
    FormControlLabel,
} from "@material-ui/core"
import {
    Add as AddIcon
} from "@material-ui/icons"
import { v4 as uuid } from "uuid"

const DiskForm = (props) => {
    const [params, setParams] = useState({
        simpleMode: true,
        diskName: "",
        diskSize: 256,
        blockSize: 4, 
        inodeSize: 256,
    })

    const {
        classes,
        createDisk,
        createDirectory,
        createFile,
        currentDisk,
        currentDirectory,
    } = useContext(SystemContext)

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target
    
        if(type === "checkbox") {
            setParams(prevParams => {
                let additionalParams = {}
                if(name === "simpleMode" && checked) {
                    additionalParams = {
                        blockSize: 4,
                        inodeSize: 256
                    }
                }
                return {
                    ...prevParams,
                    ...additionalParams,
                    [name]: checked,
                }
            })
        } else {
            setParams(prevParams => {
                return {
                ...prevParams,
                [name]: value,
                }
            })
        }
    }

    return (
        <>
        <Typography variant="h5" className={classes.tabHeader}>Add a New Disk</Typography>
        <hr style={{marginBottom: "20px"}} />
        <Tooltip
            title={
                <Typography 
                    className={classes.toolTip} 
                    color="inherit"
                >
                    <code style={{color: "#FF6461", background: "black", padding: "3px"}}>
                        sda
                    </code> or 
                    <code style={{color: "#FF6461", background: "black", padding: "3px"}}>
                        sdb
                    </code> are common UNIX examples.
                </Typography>
            }
            placement="top" 
            arrow
        >
            <TextField 
                variant="outlined" 
                fullWidth
                label="Disk Name"
                name="diskName"
                value={params.diskName}
                onChange={handleChange}
            />
        </Tooltip>
            <TextField 
                variant="outlined"
                label="Disk Size"
                name="diskSize"
                value={params.diskSize}
                onChange={handleChange}
                fullWidth 
                InputProps={{
                    endAdornment: <InputAdornment position="end">KiB</InputAdornment>
                }}
            />
            { !params.simpleMode && 
                (
                    <>
                        <TextField 
                            variant="outlined" 
                            label="Block Size"
                            name="blockSize"
                            onChange={handleChange}
                            fullWidth
                            InputProps={{
                                endAdornment: <InputAdornment position="end">KiB</InputAdornment>
                            }}
                            value={params.blockSize}
                        />
                        <TextField 
                            variant="outlined"
                            label="Inode Size"
                            name="inodeSize"
                            onChange={handleChange}
                            fullWidth
                            InputProps={{
                                endAdornment: <InputAdornment position="end">B</InputAdornment>
                            }}
                            value={params.inodeSize}
                        />
                    </>
                )
            }
            <Tooltip
                title={
                    <Typography color="inherit">When simple mode is on, the system chooses inode and block sizes.</Typography>
                }
                placement="right" 
                arrow
            >
                <FormControlLabel
                    control={
                        <Switch
                            name="simpleMode"
                            checked={params.simpleMode}
                            onChange={handleChange}
                            color="primary"
                        />
                    }
                    label="Simple Mode"
                />
            </Tooltip>
            
            <Button variant="contained" color="primary" endIcon={<AddIcon />} className={classes.right} onClick={createDisk}>Create</Button>
            <Button variant="contained" color="primary" endIcon={<AddIcon />} className={classes.right} onClick={() => {
                createFile(`abc.txt-${uuid()}`, "User", currentDisk, currentDirectory, "rwxd", 1000)
            }}>
                Add File
            </Button>
            <Button variant="contained" color="primary" endIcon={<AddIcon />} className={classes.right} onClick={() => {
                createDirectory(`SubDir-${uuid()}`, "User", currentDisk, currentDirectory, "rwxd")
            }}>
                Add Directory
            </Button>
            <div style={{clear: "both"}}></div>
        </>
    )
}

export default DiskForm