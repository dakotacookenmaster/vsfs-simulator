import React, { useEffect, useRef } from "react"
import { 
    TreeView, 
    TreeItem } from "@material-ui/lab"
import {
    Folder as FolderIcon,
    Description as DescriptionIcon,
    SubdirectoryArrowRight as SubdirectoryArrowRightIcon,
} from "@material-ui/icons"
import {
    makeStyles,
    Paper
} from "@material-ui/core"

const useStyles = makeStyles(theme => {
    return {
        explorerSidebar: {
            width: "50%",
            marginRight: "10px",
            padding: "10px",
            textAlign: "left",
            overflow: "auto",
            maxHeight: "400px",
        },
    }
})

const FileSubtreeChildren = (props) => {
    const {
        diskName,
        disks,
        rootDirectory,
    } = props.data

    const {
        setSelected,
        setCurrentDirectory,
        getDirectoryObject,
        getInodeObject,
    } = props.methods

    const directory = getDirectoryObject(diskName, rootDirectory)
    const inode = getInodeObject(diskName, rootDirectory)
    const directoryId = `${diskName}-directory-${inode.name}-${rootDirectory}`

    return (
        <TreeItem
            nodeId={directoryId} 
            key={directoryId} 
            label={inode.name}
            onDoubleClick={(event) => {
                event.stopPropagation()
                setSelected(rootDirectory)
                setCurrentDirectory(rootDirectory)
            }}
        >
            {
                Object.keys(directory).map(item => {
                    if(item !== "." && item !== "..") {
                        const inode = getInodeObject(diskName, directory[item])
                        if(inode.type === "file") {
                            const fileId = `${diskName}-file-${item}-${directory[item]}`
                            return (
                                <TreeItem 
                                    nodeId={fileId} 
                                    key={fileId} 
                                    label={inode.name}
                                    onClick={() => {
                                        setSelected(directory[item])
                                    }}
                                />
                            )
                        } else {
                            return <FileSubtreeChildren
                                key={`subtree-${inode.name}-${directory[item]}`}
                                data={{
                                    disks,
                                    diskName,
                                    rootDirectory: directory[item],
                                }} 
                                methods={{
                                    setSelected,
                                    setCurrentDirectory,
                                    getDirectoryObject,
                                    getInodeObject,
                                }}
                            />
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
        disks,
        currentDisk,
    } = props.data

    const { 
        setSelected,
        setCurrentDirectory,
        getDirectoryObject,
        getInodeObject,
    } = props.methods 

    const classes = useStyles()
    const sideBarRef = useRef()
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
                defaultCollapseIcon={<SubdirectoryArrowRightIcon />}
            >
                <FileSubtreeChildren 
                    data={{
                        diskName: currentDisk,
                        rootDirectory: 0,
                        disks,
                    }}
                    methods={{
                        setSelected,
                        setCurrentDirectory,
                        getDirectoryObject,
                        getInodeObject,
                    }}
                />
            </TreeView>
        </Paper>
    )
}

export default FileSubtree