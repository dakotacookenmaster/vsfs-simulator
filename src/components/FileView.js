import React, { useContext } from "react"
import { Paper } from "@material-ui/core"
import { SystemContext } from "../contexts/SystemContext"


const FileView = (props) => {
    const {
        currentDisk,
        currentPath,
        currentDirectory,
        disks
    } = useContext(SystemContext)

    const directoryObject = getDirectoryObject(diskName, directory)

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
                        const inode = getInodeObject(disks, diskName, directoryObject[item])
                        return (
                            <div key={`${currentDirectory}-${item}`}>
                                <div 
                                    onContextMenu={(event) => handleFileRightClick(event, inode.name)} style={{ cursor: 'context-menu' }}
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
                                        open={fileRightClick[inode.name]?.mouseY != null}
                                        onClose={handleClose}
                                        anchorReference="anchorPosition"
                                        anchorPosition={
                                            (fileRightClick[inode.name]?.mouseY != null) && (fileRightClick[inode.name]?.mouseX != null)
                                            ? { top: fileRightClick[inode.name].mouseY, left: fileRightClick[inode.name].mouseX }
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
                                        <MenuItem onClick={() => handleDelete(diskName, directoryObject[item])}>
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
