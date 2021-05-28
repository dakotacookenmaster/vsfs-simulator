import React, { useState, useEffect, useCallback } from "react"
import './App.css'
import { makeStyles } from "@material-ui/core/styles"
import { useConfirm } from "material-ui-confirm"
import Header from "./components/Header"
import InputPane from "./components/InputPane"
import DataPane from "./components/DataPane"
import ErrorSnackbar from "./components/ErrorSnackbar"

const useStyles = makeStyles(theme => {
  return {
    main: {
      width: "98%",
      margin: "20px auto",
      "& .MuiInputLabel-formControl.Mui-focused": {
        color: "white",
      }
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
    column: {
      "& .grow": {
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
    errorModal: {
      width: "60%",
      padding: "20px",
    },
  }
})

const App = () => {
  const [currentLowLevelDirectoryName, setCurrentLowLevelDirectory] = useState(0)
  const [disks, setDisks] = useState({})
  const [currentDisk, setCurrentDisk] = useState(null)
  const [currentPath, setCurrentPath] = useState("/")
  const [errors, setErrors] = useState([])
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false)
  const errorConfirm = useConfirm()
  const classes = useStyles()

  useEffect(() => {
    console.log(disks)
  })

  const getDirectoryObject = useCallback((diskName, lowLevelDirectoryName) => {
    return disks[diskName]?.dataBlocks[disks[diskName].inodes[lowLevelDirectoryName].blockPointers[0]]
  }, [disks])
  
  const getInodeObject = (diskName, lowLevelInodeName) => {
    return disks[diskName]?.inodes[lowLevelInodeName]
  }

  const parsePathIntoLowLevelFileName = (diskName, path) => {
    // Split the path into names, and remove any empty strings
    const highLevelNames = path.split("/").filter(value => value !== "")
    let directory = getDirectoryObject(diskName, 0)
    for(let i = 0; i < highLevelNames.length; i++) {
      let name = highLevelNames[i]
      // Check if the name is actually in the current directory
      if(directory[name]) {
        const inode = getInodeObject(diskName, directory[name])
        // Check if the value is a directory
        if(inode.type === "directory") {
          // Grab the directory
          directory = getDirectoryObject(diskName, directory[name])
          // Check if it is the last item and a file (as should be a file)
        } else if((inode.type === "file") && (i === (highLevelNames.length - 1)) && (inode.dTime === null)) {
          return directory[name]
        } else {
          // A file was detected and wasn't the last item, or the last item was a deleted file. This is an invalid path.
          console.log("INVALID PATH - A FILE WAS DETECTED AS A NON-TERMINATING ITEM, OR THE FILE WAS DELETED")
          return null
        }
      } else {
        // That directory or file didn't exist. This is an invalid path.
        console.log("INVALID PATH - DIRECTORY OR FILE DIDN'T EXIST")
        return null
      }
    }
    // The last item was a directory, not a file.
    console.log("INVALID PATH - THE LAST ITEM WAS A DIRECTORY")
    return null
  }

  const getLowLevelParentName = useCallback((diskName, lowLevelDirectoryName) => {
    const directory = getDirectoryObject(diskName, lowLevelDirectoryName)
    if(directory) {
      const lowLevelDirectoryName = directory["."]
      const lowLevelParentName = directory[".."]
      return (lowLevelDirectoryName !== lowLevelParentName ? lowLevelParentName : null)
    } else {
      return null
    }
  }, [getDirectoryObject])

  useEffect(() => {
    if(currentDisk) {
      let pathNumbers = [currentLowLevelDirectoryName]
      let path = "/"
      let lowLevelParentName = getLowLevelParentName(currentDisk, currentLowLevelDirectoryName)
      while(lowLevelParentName !== null) {
        pathNumbers.unshift(lowLevelParentName)
        lowLevelParentName = getLowLevelParentName(currentDisk, lowLevelParentName)
      }

      for(let i = 0; i < pathNumbers.length - 1; i++) {
        const directory = getDirectoryObject(currentDisk, pathNumbers[i])
        path += `${Object.keys(directory).filter(key => key !== ".." && key !== ".").find(key => directory[key] === pathNumbers[i + 1])}/`
      }

      setCurrentPath(path)
    }
  }, [currentLowLevelDirectoryName, currentDisk, getDirectoryObject, getLowLevelParentName])

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

  const createFile = (name, diskName, lowLevelDirectoryName, permissions, sizeInBytes) => {
    setDisks(prevDisks => {
      let newErrors = []
      const dataBlocksNeeded = Math.ceil((sizeInBytes / 1024) / disks[diskName].superblock.blockSize)
      const [freeDataBlocks, freeDataBlockIndices] = getFreeBlocks(diskName, "dataBitmap")
      const [freeInodes, freeInodeIndices] = getFreeBlocks(diskName, "inodeBitmap")

      if(!disks[diskName]) {
          newErrors.push("That disk does not exist. Try adding a new disk or use an existing disk.")
      }
      if(Object.keys(disks[diskName].dataBlocks[lowLevelDirectoryName]).includes(name)) {
          newErrors.push("A file, directory, or hard link with that name already exists in the current directory. Try using a different name.")
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
            type: "file",
            rwxd: permissions,
            size: sizeInBytes,
            blocks: newDataBlockPointers.length,
            cTime: new Date().getTime(),
            blockPointers: newDataBlockPointers,
            dTime: null,
            refCount: 0,
        }
        newDataBlockPointers.forEach(pointer => {
            prevDisks[diskName].dataBitmap[pointer] = false // Mark spaces as used in the data bitmap
        })
        // Update the size in the parent's inode
        prevDisks[diskName].inodes[lowLevelDirectoryName].size++

        prevDisks[diskName].inodeBitmap[newInodePointer] = false // Mark space as used in the inode bitmap
        prevDisks[diskName].dataBlocks[lowLevelDirectoryName][name] = newInodePointer // Create an entry in the directory's table
        prevDisks[diskName].inodes[newInodePointer] = newFile
        newDataBlockPointers.forEach(pointer => {
            prevDisks[diskName].dataBlocks[pointer] = name
        })
        return {...prevDisks}
      }
    })
  }

  const createDirectory = (name, diskName, lowLevelDirectoryName, permissions) => {
    setDisks(prevDisks => {
      let newErrors = []
      const [freeDataBlocks, freeDataBlockIndices] = getFreeBlocks(diskName, "dataBitmap")
      const [freeInodes, freeInodeIndices] = getFreeBlocks(diskName, "inodeBitmap")

      if(freeDataBlocks < 1 || freeInodes < 1) {
        newErrors.push("There aren't enough free blocks to create a new directory. Try deleting another file to free up space.")
      }

      if(Object.keys(prevDisks[diskName].dataBlocks[lowLevelDirectoryName]).includes(name)) {
        newErrors.push("A file, directory, or hard link with that name already exists in the current directory. Try using a different name.")
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
          path: `${disks[diskName].inodes[lowLevelDirectoryName].path}${name}/`,
          type: "directory",
          rwxd: permissions,
          size: 2,
          blocks: 1,
          cTime: new Date().getTime(),
          blockPointers: [newDataBlockPointer],
          dTime: null,
        }
        prevDisks[diskName].dataBitmap[newDataBlockPointer] = false                 // Mark spaces as used in the data bitmap
        prevDisks[diskName].inodeBitmap[newInodePointer] = false                    // Mark space as used in the inode bitmap

        // Create an entry in the directory's table using the parent directory's data block pointer
        prevDisks[diskName].dataBlocks[prevDisks[diskName].inodes[lowLevelDirectoryName].blockPointers[0]][name] = newInodePointer
        
        // Update the size in the parent's inode
        prevDisks[diskName].inodes[lowLevelDirectoryName].size++
        
        prevDisks[diskName].inodes[newInodePointer] = newDirectory                  // Create a new inode for this directory
        prevDisks[diskName].dataBlocks[newDataBlockPointer] = {                     // Add this directory to the data region
            ".": newInodePointer,
            "..": lowLevelDirectoryName,
        }

        return {...prevDisks}                                                       // Use the spread operator to create a "new" object to re-render
      }
    })  
  }

  const createHardLink = (diskName, lowLevelDirectoryName, path, name) => {
    setDisks(prevDisks => {
      let newErrors = []
      const lowLevelFileName = parsePathIntoLowLevelFileName(diskName, path)

      if(lowLevelFileName === null) {
        // Got an invalid low level file name
        newErrors.push("An invalid path was provided.")
        setErrors(newErrors)
        setErrorSnackbarOpen(true)
        return { ...prevDisks }
      }
      if(Object.keys(prevDisks[diskName].dataBlocks[lowLevelDirectoryName]).includes(name)) {
        newErrors.push("A file, directory, or hard link with that name already exists in the current directory. Try using a different name.")
        setErrors(newErrors)
        setErrorSnackbarOpen(true)
        return {...prevDisks}
      }

      prevDisks[diskName].inodes[lowLevelFileName].refCount++                     // Increase the connected inode's refCount

      // Create an entry in the directory's table using the parent directory's data block pointer
      prevDisks[diskName].dataBlocks[prevDisks[diskName].inodes[lowLevelDirectoryName].blockPointers[0]][name] = lowLevelFileName

      return {...prevDisks }
    })
  }

  return (
    <main className={classes.main}>
      <Header />
      <div className={classes.row}>
        <div className={classes.column}>
          <InputPane
            data={{
              disks,
              currentLowLevelDirectoryName,
              currentDisk,
              currentPath,
            }}
            methods={{
              setDisks,
              setErrors,
              setErrorSnackbarOpen,
              setCurrentDisk,
              setCurrentLowLevelDirectory,
              createFile,
              createDirectory,
              createHardLink,
            }}
          />
        </div>
        <div className={classes.column}>
          <DataPane 
            data={{
              disks,
              currentDisk,
              currentLowLevelDirectoryName,
              currentPath,
            }}
            methods={{
              getInodeObject,
              getDirectoryObject,
              setCurrentLowLevelDirectory,
              handleError,
              setCurrentDisk,
            }}
          />
        </div>
      </div>
      <ErrorSnackbar 
        data={{
          errorSnackbarOpen,
          errors,
        }}
        methods={{
          setErrorSnackbarOpen
        }}
      />
    </main>
  )
}

export default App
