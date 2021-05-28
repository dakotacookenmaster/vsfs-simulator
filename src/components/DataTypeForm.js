import React, { useState } from "react"
import {
    makeStyles,
    TextField,
    Typography,
    Select,
    MenuItem,
    Button,
    FormControl,
    InputLabel,
    InputAdornment,
    Tooltip
} from "@material-ui/core"

import { Add as AddIcon } from "@material-ui/icons"

const useStyles = makeStyles(theme => {
    return {
        tabHeader: {
            textAlign: "left",
        },
        right: {
            float: "right",
        }
    }
})

const DataTypeForm = (props) => {
    const classes = useStyles()
    const {
        currentDisk,
        currentLowLevelDirectoryName,
        currentPath
    } = props.data
    const { 
        createFile,
        createDirectory,
        createHardLink,
    } = props.methods

    const [data, setData] = useState({
        type: "File",
        name: "",
        fileSize: "",
        linkPath: "",
    })

    const handleChange = (event) => {
        const { name, value } = event.target
        setData(prevData => {
            return {
                ...prevData,
                [name]: value,
            }
        })
    }

    return (
        <div className={classes.tabHeader}>
            <Typography variant="h5">
                Add a New File or Directory
            </Typography>
            
            <hr style={{marginBottom: "20px"}} />
            <FormControl variant="outlined" fullWidth>
                <InputLabel>Type</InputLabel>
                <Select variant="outlined" value={data.type} onChange={handleChange} name="type" className={"grow"} label="Type">
                    <MenuItem value={"File"}>File</MenuItem>
                    <MenuItem value={"Directory"}>Directory</MenuItem>
                    <MenuItem value={"Hard Link"}>Hard Link</MenuItem>
                </Select>
            </FormControl>
            <TextField 
                variant="outlined" 
                fullWidth 
                name="name" 
                placeholder={`${data.type} Name`} 
                value={data.name} 
                onChange={handleChange}
                className={"grow"}
                label={`${data.type} Name`}
            />
            {!(data.type === "Directory" || data.type === "Hard Link") &&
                <TextField
                    variant="outlined"
                    label="File Size"
                    name="fileSize"
                    value={data.fileSize}
                    className={"grow"}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                        endAdornment: <InputAdornment position="end">B</InputAdornment>
                    }}
                />
            }
            {
                data.type === "Hard Link" &&
                    <Tooltip
                        title={
                            <Typography color="inherit">
                                <span>e.g.:&nbsp;
                                    <code style={{color: "#FF6461", background: "black", padding: "3px"}}>
                                        /myDir/anotherDir/file.txt
                                    </code>
                                </span>
                            </Typography>
                        }
                        placement="bottom" 
                        arrow
                        fullWidth
                        style={{
                            float: "left",
                        }}
                    >
                        <TextField
                            variant="outlined"
                            label="Hard Link Path"
                            name="linkPath"
                            value={data.linkPath}
                            className={"grow"}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Tooltip>
            }
            <div style={{clear: "both"}}></div>
            <Tooltip 
                title={
                    <Typography style={{
                        textAlign: "left", 
                        direction: "rtl",
                        whiteSpace: "nowrap", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis",
                    }}>
                        <code style={{
                            color: "#FF6461", 
                            background: "black", 
                            padding: "3px",
                        }}>
                            { currentPath }
                        </code>
                    </Typography>
                }
                arrow
                placement="left"
            >
                <div className={classes.right}>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        endIcon={<AddIcon />} 
                        disabled={
                            !data.type || 
                            !data.name || 
                            (data.type === "File" && ( !data.fileSize || isNaN(data.fileSize) )) ||
                            (data.type === "Hard Link" && (!data.linkPath))
                        }
                        onClick={
                            data.type === "File" ? 
                            () => {
                                createFile(data.name, currentDisk, currentLowLevelDirectoryName, "rwxd", Number(data.fileSize))
                                setData(prevData => {
                                    return {
                                        ...prevData,
                                        name: "",
                                        fileSize: "",
                                    }
                                })
                            } :
                            data.type === "Directory" ? 
                            () => {
                                createDirectory(data.name, currentDisk, currentLowLevelDirectoryName, "rwxd")
                                setData(prevData => {
                                    return {
                                        ...prevData,
                                        name: "",
                                    }
                                })
                            } : 
                            () => {
                                createHardLink(currentDisk, currentLowLevelDirectoryName, data.linkPath, data.name)
                                setData(prevData => {
                                    return {
                                        ...prevData,
                                        name: "",
                                        linkPath: "",
                                    }
                                })
                            }
                        }>
                            Create
                    </Button>
                </div>
            </Tooltip>
            <div style={{clear: "both"}}></div>
        </div>
    )
}

export default DataTypeForm