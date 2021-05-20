import { createContext, useState, useEffect } from "react"
import { useConfirm } from "material-ui-confirm"
import { makeStyles } from "@material-ui/core/styles"

const SystemContext = createContext()

const useStyles = makeStyles(theme => {
    return {
        main: {
            width: "98%",
            margin: "20px auto",
            "& .MuiInputLabel-formControl.Mui-focused": {
            color: "white",
            }
        },
        header: {
            textAlign: "center",
            padding: "20px",
            margin: "0 auto",
        },
        row: {
            display: "flex",
            marginTop: "20px",
            justifyContent: "space-between",
            "& > div:first-child": {
            marginRight: "20px",
            },
            "@media (max-width: 900px)": {
            flexDirection: "column"
            }
        },
        fieldContainer: {
            height: "auto",
        },
        column: {
            "& .MuiTextField-root": {
            marginBottom: "20px"
            },
            "& .MuiTextField-root:last-child": {
            marginBottom: "0px"
            },
            width: "100%",
            "@media (max-width: 900px)": {
            marginBottom: "20px",
            "&:last-child": {
                marginBottom: "0px"
            }
            },
        },
        right: {
            float: "right",
        },
        tabContent: {
            textAlign: "center",
        },
        icon: {
            width: "50px",
            height: "50px",
            margin: "10px auto",
        },
        iconWithBackground: {
            borderRadius: "100%",
            background: "white",
        },
        fileExplorer: {
            padding: "20px",
        },
        ribbon: {
            width: "100%",
            display: "flex",
            alignItems: "center",
            "& > *": {
            marginRight: "10px",
            minHeight: "56px",
            },
            "& > *:first-child": {
            minWidth: "110px",
            },
            "& > *:last-child": {
            marginRight: "0px",
            height: "100%",
            width: "100%",
            textAlign: "left",
            },
        },
        explorerGroup: {
            display: "flex",
            marginTop: "10px",
            minHeight: "300px",
            height: "100%",
        },
        explorerSidebar: {
            width: "50%",
            marginRight: "10px",
            padding: "10px",
            textAlign: "left",
            overflow: "auto",
            maxHeight: "400px",
        },
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
            maxHeight: "400px",
            overflow: "auto"
        },
        toolTip: {
            textAlign: "center",
            opacity: "1 !important"
        },
        explorerItem: {
            padding: "10px",
            userSelect: "none",
        },
        explorerItemSelected: {
            outline: "2px solid white",
        },
        errorModal: {
            width: "60%",
            padding: "20px",
        },
        tabHeader: {
            textAlign: "left",
        }
    }
})

const SystemContextProvider = ({ children }) => {
    const [currentDirectory, setCurrentDirectory] = useState(0)
    const [disks, setDisks] = useState({})
    const [currentDisk, setCurrentDisk] = useState(null)
    const [currentPath, setCurrentPath] = useState("/")
    const [errors, setErrors] = useState([])
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false)
    const errorConfirm = useConfirm()
    const deleteConfirm = useConfirm()
    const classes = useStyles()

    const [params, setParams] = useState({
        simpleMode: true,
        diskName: "",
        diskSize: 256,
        blockSize: 4, 
        inodeSize: 256,
      })

    const getDirectoryObject = (diskName, directory) => {
        return disks[diskName].dataBlocks[disks[diskName].inodes[directory].blockPointers[0]]
    }
      
    const getInodeObject = (diskName, id) => {
        return disks[diskName].inodes[id]
    }

    const createFile = (name, uid, diskName, parentId, permissions, sizeInBytes) => {
        setDisks(prevDisks => {
            let newErrors = []
            const dataBlocksNeeded = Math.ceil((sizeInBytes / 1024) / params.blockSize)
            const [freeDataBlocks, freeDataBlockIndices] = getFreeBlocks(diskName, "dataBitmap")
            const [freeInodes, freeInodeIndices] = getFreeBlocks(diskName, "inodeBitmap")
        
            if(!disks[diskName]) {
                newErrors.push("That disk does not exist. Try adding a new disk or use an existing disk.")
            }
            if(Object.keys(disks[diskName].dataBlocks[parentId]).includes(name)) {
                newErrors.push("A file with that name already exists in the current directory. Try using a different name.")
            }
            if(freeDataBlocks < dataBlocksNeeded || freeInodes < 1) {
                newErrors.push("There aren't enough free blocks to store a file that large. Try reducing the file size or deleting another file.")
            }
            if(newErrors.length) {
                setErrors(newErrors)
                setErrorSnackbarOpen(true)
                return {...prevDisks}
            } else {
                let newDataBlockPointers = freeDataBlockIndices.slice(0, dataBlocksNeeded)
                let newInodePointer = freeInodeIndices[0]
                let newFile = {
                    name: name,
                    path: `${disks[diskName].inodes[parentId].path}${name}`,
                    type: "file",
                    uid: uid,
                    rwxd: permissions,
                    size: sizeInBytes,
                    blocks: newDataBlockPointers.length,
                    cTime: new Date().getTime(),
                    blockPointers: newDataBlockPointers,
                    isUnlinked: false,
                }
                newDataBlockPointers.forEach(pointer => {
                    prevDisks[diskName].dataBitmap[pointer] = false // Mark spaces as used in the data bitmap
                })
                // Update the size in the parent's inode
                prevDisks[diskName].inodes[parentId].size++
        
                prevDisks[diskName].inodeBitmap[newInodePointer] = false // Mark space as used in the inode bitmap
                prevDisks[diskName].dataBlocks[parentId][name] = newInodePointer // Create an entry in the directory's table
                prevDisks[diskName].inodes[newInodePointer] = newFile
                newDataBlockPointers.forEach(pointer => {
                    prevDisks[diskName].dataBlocks[pointer] = name
                })
                return {...prevDisks}
            }
        })
    }

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
                return {
                    ...prevDisks,
                    [newDisk.name]: newDisk
                }
            }
        })
    }

    const createDirectory = (name, uid, diskName, parentId, permissions) => {
        setDisks(prevDisks => {
        let newErrors = []
        const [freeDataBlocks, freeDataBlockIndices] = getFreeBlocks(diskName, "dataBitmap")
        const [freeInodes, freeInodeIndices] = getFreeBlocks(diskName, "inodeBitmap")
    
        if(freeDataBlocks < 1 || freeInodes < 1) {
            newErrors.push("There aren't enough free blocks to create a new directory. Try deleting another file to free up space.")
        }
    
        if(Object.keys(prevDisks[diskName].dataBlocks[parentId]).includes(name)) {
            newErrors.push("A directory with that name already exists in the current directory. Try using a different name.")
        }
    
        if(newErrors.length) {
            setErrors(newErrors)
            setErrorSnackbarOpen(true)
            return {...prevDisks}
        } else {
            const newDataBlockPointer = freeDataBlockIndices[0]
            const newInodePointer = freeInodeIndices[0]
    
            let newDirectory = {
                name: name,
                path: `${disks[diskName].inodes[parentId].path}${name}/`,
                type: "directory",
                uid: uid,
                rwxd: permissions,
                size: 2,
                blocks: 1,
                cTime: new Date().getTime(),
                blockPointers: [newDataBlockPointer],
                isUnlinked: false
            }
            prevDisks[diskName].dataBitmap[newDataBlockPointer] = false                 // Mark spaces as used in the data bitmap
            prevDisks[diskName].inodeBitmap[newInodePointer] = false                    // Mark space as used in the inode bitmap
    
            // Create an entry in the directory's table using the parent directory's data block pointer
            prevDisks[diskName].dataBlocks[prevDisks[diskName].inodes[parentId].blockPointers[0]][name] = newInodePointer
            
            // Update the size in the parent's inode
            prevDisks[diskName].inodes[parentId].size++
            
            prevDisks[diskName].inodes[newInodePointer] = newDirectory                  // Create a new inode for this directory
            prevDisks[diskName].dataBlocks[newDataBlockPointer] = {                     // Add this directory to the data region
                ".": newInodePointer,
                "..": parentId,
            }
    
            return {...prevDisks}                                                       // Use the spread operator to create a "new" object to re-render
        }
        })  
    }

    const handleError = (title, description) => {
        errorConfirm({
            title: title,
            description: description,
            confirmationText: "OK",
            confirmationButtonProps: {
                color: "primary",
                variant: "contained",
            },
            cancellationButtonProps: {
                style: {
                display: "none",
                },
            }
        })
        .catch((error) => {
            console.log(error)
        })
    }

    const unlink = (diskName, directory) => {
        const inode = getInodeObject(diskName, directory)
        const directoryObject = getDirectoryObject(diskName, directory)
        if(inode.type === "directory") {
            if(Object.keys(directoryObject).length > 2) {
                const title = "Unable to Unlink"
                const description = "You cannot unlink a folder that has any files or folders inside of it. Try removing those first."
                handleError(title, description)
            }
          /*********************************
           * 
           * 
           * 
           * 
           * 
          // FIXME!
          *
          *
          * 
          * 
          * 
          * ********************************/
        }
    }

    const handleDelete = (diskName, directory) => {
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
            unlink(diskName, directory)
        })
        .catch(error => {
            console.log(error)
        })
    }

    const getFreeBlocks = (diskName, type) => {
        let freeBlockIndices = []
        const freeBlocks = disks[diskName][type].filter((value, index) => {
            const condition = (value === true)
            if(condition) {
                freeBlockIndices.push(index)
            }
            return condition
        }).length
    
        return [freeBlocks, freeBlockIndices]
    }

    const handleSelectChange = (event) => {
        const { value } = event.target
        setCurrentDirectory(0)
        setCurrentDisk(value)
      }

    const value = {
        currentDirectory,
        setCurrentDirectory,
        disks,
        setDisks,
        currentDisk,
        setCurrentDisk,
        currentPath,
        setCurrentPath,
        getDirectoryObject,
        getInodeObject,
        handleDelete,
        classes,
        params,
        setParams,
        createDisk,
        errors,
        errorSnackbarOpen,
        createFile,
        createDirectory,
        setErrorSnackbarOpen,
        getFreeBlocks,
        handleSelectChange,
    }

    useEffect(() => {
        setCurrentPath(disks[currentDisk]?.inodes[currentDirectory].path || "/")
    }, [disks, currentDirectory, currentDisk])

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

    return (
        <SystemContext.Provider value={value}>
            { children }
        </SystemContext.Provider>
    )
}

export {
    SystemContextProvider,
    SystemContext
}