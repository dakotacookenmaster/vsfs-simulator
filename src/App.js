import React, { useState, useEffect, useRef } from "react"
import { makeStyles } from "@material-ui/core/styles"
import clsx from "clsx"
import { 
  Typography, 
  Card, 
  TextField, 
  CardContent, 
  Slide, 
  InputAdornment,
  Switch,
  FormControlLabel,
  Button,
  Tooltip,
  Tabs,
  Tab,
  Snackbar,
  IconButton,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Menu,
  ListItemIcon,
} from "@material-ui/core"
import { 
  Add as AddIcon, 
  Close as CloseIcon, 
  Home as HomeIcon, 
  ArrowUpward as ArrowUpwardIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  // DoubleArrow as DoubleArrowIcon,
  Launch as LaunchIcon,
  Delete as DeleteIcon,
} from "@material-ui/icons"
import { TreeView, TreeItem } from "@material-ui/lab"
import HardDriveIcon from "./images/hard-drive.svg"
import Logo from "./images/default-monochrome-white.svg"
import './App.css'
import { v4 as uuid } from "uuid"
import { useConfirm } from "material-ui-confirm"

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
      borderRadius: "100%",
      background: "white",
      margin: "10px auto",
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
    }
  }
})


const App = () => {
  const classes = useStyles()
  const [currentTab, setCurrentTab] = useState(0)
  const [currentDirectory, setCurrentDirectory] = useState(0)
  const [disks, setDisks] = useState({})
  const [currentDisk, setCurrentDisk] = useState(null)
  const [currentPath, setCurrentPath] = useState("/")
  const [fileRightClick, setFileRightClick] = useState({})
  const [selected, setSelected] = useState(null)
  const scrollPosition = useRef({
    top: 0, left: 0
  })
  const sideBarRef = useRef()
  const explorerWindowRef = useRef(null)
  const deleteConfirm = useConfirm()
  const errorConfirm = useConfirm()

  const handleFileRightClick = (event, name) => {
    event.preventDefault();
    setFileRightClick(prevFileRightClick => {
      return {
        ...prevFileRightClick,
        [name]: {
          mouseX: event.clientX - 2,
          mouseY: event.clientY - 4,
        }
      }
    });
  };

  const handleClose = () => {
    setFileRightClick({
      mouseX: null,
      mouseY: null,
    });
  };


  const [params, setParams] = useState({
    simpleMode: true,
    diskName: "",
    diskSize: 256,
    blockSize: 4, 
    inodeSize: 256,
  })

  const [errors, setErrors] = useState([])
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false)

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

  useEffect(() => {
    if(sideBarRef.current && scrollPosition.current) {
      sideBarRef.current.scrollLeft = scrollPosition.current.left
      sideBarRef.current.scrollTop =  scrollPosition.current.top
    }
  })

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

  const getDirectoryObject = (diskName, directory) => {
    return disks[diskName].dataBlocks[disks[diskName].inodes[directory].blockPointers[0]]
  }

  const getInodeObject = (diskName, id) => {
    return disks[diskName].inodes[id]
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
                return <TreeItem 
                  nodeId={fileId} 
                  key={fileId} 
                  label={inode.name}
                  onClick={() => {
                    setCurrentDirectory(rootDirectory)
                    setSelected(directory[item])
                  }}
                />
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

  const generateFileView = (diskName, directory) => {
    const directoryObject = getDirectoryObject(diskName, directory)

    return (
      Object.keys(directoryObject).map(item => {
        if(item !== "." && item !== "..") {
          const inode = getInodeObject(diskName, directoryObject[item])
          return (
            <div key={`${directory}-${item}`}>
              <div 
                onContextMenu={(event) => handleFileRightClick(event, inode.name)} style={{ cursor: 'context-menu' }}
                onClick={() => {
                  setSelected(directoryObject[item])
                }}
                onDoubleClick={
                  () => {
                    if(inode.type === "directory") {
                      setCurrentDirectory(directoryObject[item])
                    }
                  }
                }
              >
                {
                    <Paper variant="outlined" className={selected === directoryObject[item] ? clsx(classes.explorerItem, classes.explorerItemSelected) : classes.explorerItem}>
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
                    <MenuItem onClick={
                      () => {
                        setCurrentDirectory(directoryObject[item])
                        handleClose()
                      }
                    }>
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
    )
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

  const unlink = (diskName, directory) => {
    const inode = getInodeObject(diskName, directory)
    const directoryObject = getDirectoryObject(diskName, directory)
    if(inode.type === "directory") {
      console.log(Object.keys(directoryObject))
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

  const TabPanel = (props) => {
    const { children, index, value } = props
    return (
      <div className={classes.tabContent} hidden={index !== value} style={{marginTop: "20px"}}>
        { children }
      </div>
    )
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
  }

  const handleSelectChange = (event) => {
    const { value } = event.target
    setCurrentDirectory(0)
    setCurrentDisk(value)
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    if(type === "checkbox") {
      setParams(prevParams => {
        let additionalParams = {}
        if(name === "simpleMode" && checked) {
          additionalParams = {
            blockSize: 4,
            inodeSize: 256
          }
        }
        return {
          ...prevParams,
          ...additionalParams,
          [name]: checked,
        }
      })
    } else {
      setParams(prevParams => {
        return {
          ...prevParams,
          [name]: value,
        }
      })
    }
  }

  return (
    <main className={classes.main}>
      <Card className={classes.header} raised={true} background={"primary"}>
        <img src={Logo} alt="VSFS Logo" style={{marginBottom: "20px", maxHeight: "150px"}} />
        <Typography variant="h5">
          by Dakota Cookenmaster
        </Typography>
      </Card>
      <div className={classes.row}>
        <div className={classes.column}>
          <Slide direction="right" in={true} mountOnEnter unmountOnExit timeout={1000}>
            <Card raised={true} className={classes.fieldContainer}>
              <CardContent>
                <Typography variant="h5">Set Up Your File System</Typography>
                <hr style={{marginBottom: "20px"}} />
                <Tooltip
                  title={
                    <>
                      <Typography className={classes.toolTip} color="inherit"><code style={{color: "#FF6461", background: "black", padding: "3px"}}>sda</code> or <code style={{color: "#FF6461", background: "black", padding: "3px"}}>sdb</code> are common UNIX examples.</Typography>
                    </>
                  }
                  placement="top" 
                  arrow
                >
                <TextField 
                  variant="outlined" 
                  fullWidth
                  label="Disk Name"
                  name="diskName"
                  value={params.diskName}
                  onChange={handleChange}
                />
                </Tooltip>
                <TextField 
                  variant="outlined"
                  label="Disk Size"
                  name="diskSize"
                  value={params.diskSize}
                  onChange={handleChange}
                  fullWidth 
                  InputProps={{
                    endAdornment: <InputAdornment position="end">KiB</InputAdornment>
                  }}
                />
                { !params.simpleMode && 
                  (
                    <>
                      <TextField 
                        variant="outlined" 
                        label="Block Size"
                        name="blockSize"
                        onChange={handleChange}
                        fullWidth
                        InputProps={{
                          endAdornment: <InputAdornment position="end">KiB</InputAdornment>
                        }}
                        value={params.blockSize}
                      />
                      <TextField 
                        variant="outlined"
                        label="Inode Size"
                        name="inodeSize"
                        onChange={handleChange}
                        fullWidth
                        InputProps={{
                          endAdornment: <InputAdornment position="end">B</InputAdornment>
                        }}
                        value={params.inodeSize}
                      />
                    </>
                  )
                }
                <Tooltip
                  title={
                    <>
                      <Typography color="inherit">When simple mode is on, the system chooses inode and block sizes.</Typography>
                    </>
                  }
                  placement="right" 
                  arrow
                >
                  <FormControlLabel
                    control={
                      <Switch
                        name="simpleMode"
                        checked={params.simpleMode}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label="Simple Mode"
                  />
                </Tooltip>
                
                <Button variant="contained" color="primary" endIcon={<AddIcon />} className={classes.right} onClick={createDisk}>Create</Button>
                <Button variant="contained" color="primary" endIcon={<AddIcon />} className={classes.right} onClick={
                  () => {
                    createFile(`abc.txt-${uuid()}`, "User", currentDisk, currentDirectory, "rwxd", 1000)
                  }
                }>Add File</Button>
                <Button variant="contained" color="primary" endIcon={<AddIcon />} className={classes.right} onClick={
                  () => {
                    createDirectory(`SubDir-${uuid()}`, "User", currentDisk, currentDirectory, "rwxd")
                  }
                }>Add Directory</Button>
                <div style={{clear: "both"}}></div>
              </CardContent>
            </Card>
          </Slide>
        </div>
        <div className={classes.column}>
          <Slide direction="left" in={true} mountOnEnter unmountOnExit timeout={1000}>
            <Card raised={true} className={classes.fieldContainer}>
              <CardContent>
                <Tabs
                  value={currentTab}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                >
                  <Tab value={0} label="File Explorer" />
                  <Tab value={1} label="Inode Table" />
                </Tabs>
                <TabPanel value={currentTab} index={0}>
                  { !Object.keys(disks).length ?
                    <>
                      <div className={classes.icon}>
                        <img src={HardDriveIcon} width={50} alt="Hard Drive Icon" />
                      </div>
                      <Typography variant="h6">Nothing to see here. Try creating a new disk.</Typography>
                    </> :
                    <>
                      <Paper variant="outlined" className={classes.fileExplorer}>
                        <div className={classes.ribbon}>
                          <FormControl variant="outlined">
                            <InputLabel>Current Disk</InputLabel>
                            <Select 
                              defaultValue={Object.keys(disks)[0]}
                              value={currentDisk}
                              label="Current Disk"
                              onChange={handleSelectChange}
                            >
                              {
                                Object.keys(disks).map(diskName => {
                                  return (<MenuItem key={diskName} value={diskName}>{diskName}</MenuItem>)
                                })
                              }
                            </Select>
                          </FormControl>
                          <Button variant="outlined" onClick={
                            () => {
                              setCurrentDirectory(0)
                            }
                          }>
                            <HomeIcon />
                          </Button>
                          <Button variant="outlined" onClick={
                            () => {
                              setCurrentDirectory(prevCurrentDirectory => {
                                const currentDirectoryObject = getDirectoryObject(currentDisk, currentDirectory)
                                return currentDirectoryObject[".."]
                              })
                            }
                          }>
                            <ArrowUpwardIcon />
                          </Button>

                          <TextField variant="outlined" value={currentPath} disabled className={classes.pathBar} />
                          {/* <Paper variant="outlined" className={classes.pathBar}>
                            <Typography variant="body1">
                              { currentPath }
                            </Typography>
                          </Paper> */}
                        </div>
                        <div style={{clear: "both"}} />
                        <div className={classes.explorerGroup}>
                          <Paper variant="outlined" className={classes.explorerSidebar} ref={sideBarRef} onClick={
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
                          <Paper variant="outlined" className={classes.explorerMainContent} ref={explorerWindowRef} onClick={
                            (event) => {
                              if(event.target === event.currentTarget) {
                                // If you clicked on the parent, not the children
                                setSelected(null)
                              }
                            }
                          }>
                            { generateFileView(currentDisk, currentDirectory) }
                          </Paper>
                        </div>
                      </Paper>
                    </>
                  }
                </TabPanel>
                <TabPanel value={currentTab} index={1}>
                  <div className={classes.icon}>
                    <img src={HardDriveIcon} width={50} alt="Hard Drive Icon" />
                  </div>
                  <Typography variant="h6">Nothing to see here. Try creating a new disk.</Typography>
                  {/* <Typography variant="h6">The Inode Table (aka File System Partition)</Typography>
                  <div class="inodeTable">
                    <div class="super">

                    </div>
                    <div class="inodeBitmap"></div>
                    <div class="dataBitmap"></div>
                  </div> */}
                </TabPanel>
              </CardContent>
            </Card>
          </Slide>
        </div>
      </div>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={errorSnackbarOpen}
        action={
          <>
            <ul>
            {
              errors.map(error => {
                return (<li key={error}><Typography>{error}</Typography></li>)
              })
            }
            </ul>
            <IconButton onClick={(event, reason) => (reason !== 'clickaway' && setErrorSnackbarOpen(false))}>
              <CloseIcon color="primary" />
            </IconButton>
          </>
        }
      >
      </Snackbar>
    </main>
  )
}

export default App
