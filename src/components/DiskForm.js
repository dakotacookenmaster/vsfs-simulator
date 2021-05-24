import React, { useState, useEffect } from "react"
import { makeStyles } from "@material-ui/core/styles"
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

const useStyles = makeStyles(theme => {
    return {
        toolTip: {
            textAlign: "center",
        },
        tabHeader: {
            textAlign: "left",
        },
        right: {
            float: "right",
        },
    }
})

const DiskForm = (props) => {
    const { 
        disks,
    } = props.data
    const { 
        setDisks,
        setErrors,
        setErrorSnackbarOpen,
        setCurrentDisk,
        setCurrentDirectory,
    } = props.methods
    const classes = useStyles()
    const [params, setParams] = useState({
        simpleMode: true,
        diskName: "",
        diskSize: 256,
        blockSize: 4, 
        inodeSize: 256,
    })

    useEffect(() => {
        const totalBlocks = Math.floor(params.diskSize / params.blockSize)
        const inodesPerBlock = (params.blockSize * 1024) / params.inodeSize
        const inodeBlocks = Math.ceil((totalBlocks - 3) / inodesPerBlock)
        const dataBlocks = totalBlocks - 3 - inodeBlocks
        const inodes = inodeBlocks * inodesPerBlock
    
        setParams(prevParams => {
          return {
            ...prevParams,
            totalBlocks,
            inodesPerBlock,
            inodeBlocks,
            dataBlocks,
            inodes,
          }
        })
    
      }, [params.diskSize, params.blockSize, params.inodeSize])

    const createDisk = () => {
        setDisks(prevDisks => {
            let newErrors = []
            if(!params.diskName) {
                newErrors.push("You must give the new disk a name.")
            }
            if(isNaN(params.dataBlocks) || params.dataBlocks <= 0 || isNaN(params.inodeBlocks) || params.inodeBlocks <= 0 || isNaN(params.inodes) || params.inodes < 2) {
                newErrors.push("There are too few blocks to build the file system. Consider increasing the disk size, decreasing the block size, or decreasing the inode size.")
            }
            if(Object.keys(disks).includes(params.diskName)) {
                newErrors.push("That disk name is already being used. Please choose another one.")
            }
            if(params.totalBlocks > 10000) {
                newErrors.push("Please initialize a smaller disk. Disks creating over 10,000 total blocks can lead to poor responsiveness.")
            }
            if(newErrors.length) {
                setErrors(newErrors)
                setErrorSnackbarOpen(true)
                return {...prevDisks}
            } else {
                let newDisk = {
                    name: params.diskName,
                    superblock: {
                        blockSize: params.blockSize,
                        dataBlocks: params.dataBlocks,
                        inodeSize: params.inodeSize,
                        inodeBlocks: params.inodeBlocks,
                        inodes: params.inodes,
                        system: "VSFS",
                    },
                    inodeBitmap: Array.from({length: params.inodes}).fill(true),
                    dataBitmap: Array.from({length: params.dataBlocks}).fill(true),
                    inodes: Array.from({length: params.inodes}, (_, index) => []),
                    dataBlocks: Array.from({length: params.dataBlocks}, (_, index) => [])
                }

                newDisk.inodeBitmap[0] = false  // Allocate an inode for the root directory
                newDisk.dataBitmap[0] = false   // Allocate a data block for the root directory
                newDisk.inodes[0] = {           // Initialize an inode for the root directory
                    name: "/",
                    path: "/",
                    type: "directory",
                    uid: "Sys",
                    rwxd: "rwx-",
                    size: 2,
                    blocks: 1,
                    cTime: new Date().getTime(),
                    blockPointers: [0]
                }

                newDisk.dataBlocks[0] = {      // Initialize a data block for the root directory
                    ".": 0,
                    "..": 0,
                }

                setCurrentDisk(newDisk.name)
                setCurrentDirectory(0)
                setParams(prevParams => {
                    return {
                        ...prevParams,
                        diskName: "",
                    }
                })
                return {
                    ...prevDisks,
                    [newDisk.name]: newDisk
                }
            }
        })
    }

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
                        </code> or&nbsp;
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
                    className={"grow"}
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
                className={"grow"}
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
                            className={"grow"}
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
                            className={"grow"}
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
                style={{
                    float: "left",
                }}
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
            
            <Button 
                variant="contained" 
                color="primary" 
                endIcon={<AddIcon />} 
                className={classes.right} 
                onClick={createDisk}
                disabled={
                    !params.diskName || 
                    !params.diskSize || 
                    !params.blockSize || 
                    !params.inodeSize || 
                    isNaN(params.blockSize) || 
                    isNaN(params.inodeSize) ||
                    isNaN(params.diskSize)
                }
            >
                Create
            </Button>
            <div style={{clear: "both"}}></div>
        </>
    )
}

export default DiskForm