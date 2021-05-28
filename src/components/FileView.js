import React, { useRef, useState } from "react"
import { useConfirm } from "material-ui-confirm"
import { 
    Paper,
    ListItemIcon,
    MenuItem,
    Typography,
    Menu,
    makeStyles
} from "@material-ui/core"
import clsx from "clsx"
import {
    Description as DescriptionIcon,
    Launch as LaunchIcon,
    Delete as DeleteIcon,
    Folder as FolderIcon,
} from "@material-ui/icons"

const useStyles = makeStyles(theme => {
    return {
        explorerMainContent: {
            width: "100%",
            padding: "10px",
            display: "flex",
            flexWrap: "wrap",
            alignContent: "flex-start",
            "& > *": {
            width: "100px",
            marginRight: "10px",
            padding: "10px",
            height: "60px",
            marginBottom: "10px",
            },
            maxHeight: "300px",
            overflow: "auto"
        },
        explorerItem: {
            padding: "10px",
            userSelect: "none",
        },
        explorerItemSelected: {
            outline: "2px solid white",
        },
    }
})

const FileView = (props) => {
    const {
        currentDisk,
        currentLowLevelDirectoryName,
        selected
    } = props.data

    const {
        getDirectoryObject,
        getInodeObject,
        setCurrentLowLevelDirectory,
        unlink,
        setSelected
    } = props.methods

    const classes = useStyles()
    const explorerWindowRef = useRef()
    const [rightClick, setRightClick] = useState({})
    const deleteConfirm = useConfirm()

    const handleClose = (event) => {
        event.stopPropagation()
        setSelected(null)
        setRightClick({
            mouseX: null,
            mouseY: null,
        });
    };

    const handleDelete = (diskName, lowLevelDirectoryName) => {
        deleteConfirm({ 
            title: "Delete from folder?",
            description: "The file will disappear from this folder and cannot be undone.",
            confirmationText: "Delete",
            confirmationButtonProps: {
                color: "primary",
                variant: "contained",
            }
        })
        .then(() => {
            unlink(diskName, lowLevelDirectoryName)
        })
        .catch(error => {
            console.log(error)
        })
    }

    const handleRightClick = (event, name) => {
        event.preventDefault();
        setRightClick(prevRightClick => {
            return {
                ...prevRightClick,
                [name]: {
                    mouseX: event.clientX - 2,
                    mouseY: event.clientY - 4,
                }
            }
        });
    };

    const directory = getDirectoryObject(currentDisk, currentLowLevelDirectoryName)

    return (
        <Paper variant="outlined" className={classes.explorerMainContent} ref={explorerWindowRef} onClick={
            (event) => {
                if(event.target === event.currentTarget) {
                    // If you clicked on the parent, not the children
                    setSelected(null)
                }
            }
        }>
            { 
                Object.keys(directory).map(name => {
                    if(name !== "." && name !== "..") {
                        const inode = getInodeObject(currentDisk, directory[name])
                        return (
                            <div key={`${currentLowLevelDirectoryName}-${name}`}>
                                <div 
                                    onContextMenu={(event) => {
                                        setSelected(directory[name])
                                        handleRightClick(event, name)
                                    }} style={{ cursor: 'context-menu' }}
                                    onClick={() => {
                                        setSelected(directory[name])
                                    }}
                                    onDoubleClick={() => {
                                        if(inode.type === "directory") {
                                            setCurrentLowLevelDirectory(directory[name])
                                        }
                                    }}
                                >
                                    {
                                        <Paper 
                                            variant="outlined" 
                                            className={selected === directory[name] ? 
                                                clsx(classes.explorerItem, classes.explorerItemSelected) : 
                                                classes.explorerItem}
                                        >
                                            { inode.type === "file" ? 
                                                <DescriptionIcon fontSize="large"/> :
                                                <FolderIcon fontSize="large" />
                                            }
                                            <Typography style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{name}</Typography> 
                                        </Paper>
                                    }
                                    <Menu
                                        keepMounted
                                        open={rightClick[name]?.mouseY != null}
                                        onClose={
                                            (event) => {
                                                handleClose(event)
                                            }
                                        }
                                        anchorReference="anchorPosition"
                                        anchorPosition={
                                            (rightClick[name]?.mouseY != null) && (rightClick[name]?.mouseX != null)
                                            ? { top: rightClick[name].mouseY, left: rightClick[name].mouseX }
                                            : undefined
                                        }
                                    >
                                        <MenuItem disabled><Typography variant="overline">{name}</Typography></MenuItem>
                                        {
                                            inode.type !== "file" &&
                                            <MenuItem onClick={(event) => {
                                                setCurrentLowLevelDirectory(directory[name])
                                                handleClose(event)
                                            }}>
                                                <ListItemIcon>
                                                    <LaunchIcon />
                                                </ListItemIcon>
                                                <Typography>Open</Typography>
                                            </MenuItem>
                                        }
                                        <MenuItem onClick={
                                            (event) => {
                                                handleDelete(currentDisk, directory[name])
                                                handleClose(event)
                                            }
                                        }>
                                            <ListItemIcon>
                                                <DeleteIcon />
                                            </ListItemIcon>
                                            <Typography>Delete</Typography>
                                        </MenuItem>
                                    </Menu>
                                </div>
                            </div>
                        )
                    } else {
                        return null
                    }
                })
            }
        </Paper>
    )
}

export default FileView
