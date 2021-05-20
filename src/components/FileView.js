import React, { useContext, useRef, useState } from "react"
import { 
    Paper,
    ListItemIcon,
    MenuItem,
    Typography,
    Menu
} from "@material-ui/core"
import clsx from "clsx"
import {
    Description as DescriptionIcon,
    Launch as LaunchIcon,
    Delete as DeleteIcon,
    Folder as FolderIcon,
} from "@material-ui/icons"
import { SystemContext } from "../contexts/SystemContext"

const FileView = () => {
    const explorerWindowRef = useRef()
    const [selected, setSelected] = useState(null)
    const [rightClick, setRightClick] = useState({})

    const {
        currentDirectory,
        currentDisk,
        getDirectoryObject,
        getInodeObject,
        setCurrentDirectory,
        handleDelete,
        classes
    } = useContext(SystemContext)

    const handleClose = () => {
        setRightClick({
            mouseX: null,
            mouseY: null,
        });
    };

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

    const directoryObject = getDirectoryObject(currentDisk, currentDirectory)

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
                Object.keys(directoryObject).map(item => {
                    if(item !== "." && item !== "..") {
                        const inode = getInodeObject(currentDisk, directoryObject[item])
                        return (
                            <div key={`${currentDirectory}-${item}`}>
                                <div 
                                    onContextMenu={(event) => handleRightClick(event, inode.name)} style={{ cursor: 'context-menu' }}
                                    onClick={() => {
                                        setSelected(directoryObject[item])
                                    }}
                                    onDoubleClick={() => {
                                        if(inode.type === "directory") {
                                            setCurrentDirectory(directoryObject[item])
                                        }
                                    }}
                                >
                                    {
                                        <Paper 
                                            variant="outlined" 
                                            className={selected === directoryObject[item] ? 
                                                clsx(classes.explorerItem, classes.explorerItemSelected) : 
                                                classes.explorerItem}
                                        >
                                            { inode.type === "file" ? 
                                                <DescriptionIcon fontSize="large"/> :
                                                <FolderIcon fontSize="large" />
                                            }
                                            <Typography style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{inode.name}</Typography> 
                                        </Paper>
                                    }
                                    <Menu
                                        keepMounted
                                        open={rightClick[inode.name]?.mouseY != null}
                                        onClose={handleClose}
                                        anchorReference="anchorPosition"
                                        anchorPosition={
                                            (rightClick[inode.name]?.mouseY != null) && (rightClick[inode.name]?.mouseX != null)
                                            ? { top: rightClick[inode.name].mouseY, left: rightClick[inode.name].mouseX }
                                            : undefined
                                        }
                                    >
                                        <MenuItem disabled><Typography variant="overline">{inode.name}</Typography></MenuItem>
                                        {
                                            inode.type !== "file" &&
                                            <MenuItem onClick={() => {
                                                setCurrentDirectory(directoryObject[item])
                                                handleClose()
                                            }}>
                                                <ListItemIcon>
                                                    <LaunchIcon />
                                                </ListItemIcon>
                                                <Typography>Open</Typography>
                                            </MenuItem>
                                        }
                                        <MenuItem onClick={() => handleDelete(currentDisk, directoryObject[item])}>
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
