import React, { useEffect, useContext, useRef } from "react"
import { 
    TreeView, 
    TreeItem } from "@material-ui/lab"
import {
    Folder as FolderIcon,
    Description as DescriptionIcon,
} from "@material-ui/icons"
import {
    Paper
} from "@material-ui/core"
import { SystemContext } from "../contexts/SystemContext"

const getFileSubtree = (diskName, rootDirectory, getDirectoryObject, getInodeObject, setCurrentDirectory, setSelected, iteration = 0) => {

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
    const sideBarRef = useRef()
    const { defaultExpanded } = props
    const {
        classes,
        setSelected,
        getDirectoryObject,
        getInodeObject,
        setCurrentDirectory,
        currentDisk,
    } = useContext(SystemContext)
    const scrollPosition = useRef({
        top: 0, left: 0
    })

    useEffect(() => {
        if(sideBarRef.current && scrollPosition.current) {
          sideBarRef.current.scrollLeft = scrollPosition.current.left
          sideBarRef.current.scrollTop =  scrollPosition.current.top
        }
    })

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
                defaultExpanded={defaultExpanded}
            >
                { getFileSubtree(currentDisk, 0, getDirectoryObject, getInodeObject, setCurrentDirectory, setSelected) }
            </TreeView>
        </Paper>
    )
}

export default FileSubtree