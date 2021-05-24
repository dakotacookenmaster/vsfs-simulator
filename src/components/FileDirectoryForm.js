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
    InputAdornment
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

const FileDirectoryForm = (props) => {
    const classes = useStyles()
    const {
        currentDisk,
        currentDirectory,
    } = props.data
    const { 
        createFile,
        createDirectory,
    } = props.methods

    const [data, setData] = useState({
        type: "File",
        name: "",
        fileSize: "",
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
            <Typography variant="h5">Add a New File or Directory</Typography>
            <hr style={{marginBottom: "20px"}} />
            <FormControl variant="outlined" fullWidth>
                <InputLabel>Type</InputLabel>
                <Select variant="outlined" value={data.type} onChange={handleChange} name="type" className={"grow"} label="Type">
                    <MenuItem value={"File"}>File</MenuItem>
                    <MenuItem value={"Directory"}>Directory</MenuItem>
                </Select>
            </FormControl>
            <TextField 
                variant="outlined" 
                fullWidth 
                name="name" 
                placeholder={data.type === "File" ? "File Name" : "Directory Name"} 
                value={data.name} 
                onChange={handleChange}
                className={"grow"}
                label={data.type === "File" ? "File Name" : "Directory Name"}
            />
            {!(data.type === "Directory") &&
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
            <Button 
                variant="contained" 
                color="primary" 
                endIcon={<AddIcon />} 
                className={classes.right}
                disabled={!data.type || !data.name || (data.type !== "Directory" && ( !data.fileSize || isNaN(data.fileSize) ))}
                onClick={
                    data.type === "File" ? 
                    () => {
                        createFile(data.name, "User", currentDisk, currentDirectory, "rwxd", data.fileSize)
                        setData(prevData => {
                            return {
                                ...prevData,
                                name: "",
                                fileSize: "",
                            }
                        })
                    } : 
                    () => {
                        createDirectory(data.name, "User", currentDisk, currentDirectory, "rwxd")
                        setData(prevData => {
                            return {
                                ...prevData,
                                name: "",
                            }
                        })
                    }
                }>
                    Create
            </Button>
            <div style={{clear: "both"}}></div>
        </div>
    )
}

export default FileDirectoryForm