import React from "react"
import { TreeView, TreeItem } from "@material-ui/lab"
import { 
    getDirectoryObject,
    getInodeObject
} from "../helpers"
import {
    Folder as FolderIcon,
    Description as DescriptionIcon,
} from "@material-ui/icons"

const getFileSubtree = (diskName, rootDirectory, iteration = 0) => {
    let updatedIteration = iteration
    const directory = getDirectoryObject(diskName, rootDirectory)
    const inode = getInodeObject(diskName, rootDirectory)
    const directoryId = String(updatedIteration)
    return (
        <TreeItem 
            nodeId={directoryId} 
            key={directoryId} 
            label={inode.name}
            onClick={() => {
                setCurrentDirectory(rootDirectory)
                setSelected(null)
            }}
        >
            {
                Object.keys(directory).map(item => {
                    if(item !== "." && item !== "..") {
                        const inode = getInodeObject(diskName, directory[item])
                        updatedIteration = updatedIteration + 1
                        if(inode.type === "file") {
                            const fileId = String(updatedIteration)
                            return (
                                <TreeItem 
                                    nodeId={fileId} 
                                    key={fileId} 
                                    label={inode.name}
                                    onClick={() => {
                                        setCurrentDirectory(rootDirectory)
                                        setSelected(directory[item])
                                    }}
                                />
                            )
                        } else {
                            return getFileSubtree(diskName, directory[item], updatedIteration)
                        }
                    } else {
                        return ""
                    }
                })
            }
      </TreeItem>
    )
}

const FileSubtree = (props) => {
    const { 
        currentDisk, 
        scrollPosition, 
        sideBarRef, 
        setSelected,
        params
    } = props

    return (
        <Paper variant="outlined" className={classes.explorerSidebar} ref={sideBarRef} 
            onClick={
                (event) => {
                    if(event.target === event.currentTarget) {
                        // If you clicked on the parent, not the children
                        setSelected(null)
                    }
                }
            }
            onScroll={
                (event) => {
                    const { target } = event
                    scrollPosition.current.top = target.scrollTop
                    scrollPosition.current.left = target.scrollLeft
                }
            }
        >
            <TreeView 
                defaultParentIcon={<FolderIcon />}
                defaultEndIcon={<DescriptionIcon />}
                defaultExpanded={[...Array(params.inodes).keys()].map(value => String(value))}
            >
                { getFileSubtree(currentDisk, 0) }
            </TreeView>
        </Paper>
    )
}

export default FileSubtree