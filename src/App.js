import React, { useState, useEffect } from "react"
import { ThemeProvider, createMuiTheme, makeStyles } from "@material-ui/core/styles"
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
  IconButton
} from "@material-ui/core"
import { Add as AddIcon, Close as CloseIcon } from "@material-ui/icons"
import HardDriveIcon from "./images/hard-drive.svg"
import Logo from "./images/default-monochrome-white.svg"
import './App.css'

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: "#061A47",
    },
    background: {
      paper: "#3D3D3D"
    }
  },
})

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
  }
})

let disks = {}

const App = () => {
  const classes = useStyles()
  const [currentTab, setCurrentTab] = useState(0)
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
    console.log(disks) 
  })

  useEffect(() => {
    const totalBlocks = Math.floor(params.diskSize / params.blockSize)
    const inodesPerBlock = (params.blockSize * 1024) / params.inodeSize
    const inodeBlocks = Math.ceil((totalBlocks - 3) / inodesPerBlock)
    const dataBlocks = totalBlocks - 3 - inodeBlocks

    // console.log("Total Blocks:", totalBlocks)
    // console.log("Inodes Per Block:", inodesPerBlock)
    // console.log("Blocks Needed For Inodes:", inodeBlocks)
    // console.log("Data Blocks:", dataBlocks)


    setParams(prevParams => {
      return {
        ...prevParams,
        totalBlocks,
        inodesPerBlock,
        inodeBlocks,
        dataBlocks,
      }
    })

  }, [params.diskSize, params.blockSize, params.inodeSize])

  const getFreeBlocks = (diskName) => {
    let freeBlockIndices = []
    const freeBlocks = disks[diskName].dataBitmap.filter((value, index) => {
      const condition = (value === true)
      if(condition) {
        freeBlockIndices.push(index)
      }
      return condition
    }).length

    return [freeBlocks, freeBlockIndices]
  }

  const createFile = (name, uid, diskName, parentId, permissions, sizeInBytes) => {
    let newErrors = []
    const blocksNeeded = Math.ceil((sizeInBytes / 1024) / params.blockSize)
    const [freeBlocks, freeBlockIndices] = getFreeBlocks(diskName)

    console.log("BLOCKS NEEDED:", blocksNeeded)
    console.log("FREE BLOCK INDICES:", freeBlockIndices)
    console.log("BLOCK POINTERS:", freeBlockIndices.slice(0, blocksNeeded))

    if(disks[diskName].data[parentId].filter(value => value.name === name).length) {
      newErrors.push("A file with that name already exists in the current directory. Try using a different name.")
    }

    if(freeBlocks < blocksNeeded) {
      newErrors.push("There aren't enough free blocks to store a file that large. Try reducing the file size or deleting another file.")
    }

    if(newErrors.length) {
      setErrors(newErrors)
      setErrorSnackbarOpen(true)
    } else {
      let newFile = {
        name: name,
        type: "file",
        uid: uid,
        rwxd: permissions,
        size: sizeInBytes,
        blocks: blocksNeeded,
        blockPointers: freeBlockIndices.slice(0, blocksNeeded),
        cTime: new Date().getTime(),
        linked: true,
      }

      // Add the file to disk
      disks[diskName].data[parentId].push(newFile)

      // 
    }
  }

  const createDirectory = (name, uid, diskName, parentId, permissions) => {
    let newErrors = []
    let [freeBlocks, freeBlockIndices] = getFreeBlocks(diskName)

    if(freeBlocks < 1) {
      newErrors.push("There aren't enough free blocks to create a new directory. Try deleting another file to free up space.")
    }

    if(disks[diskName].data[parentId].filter(value => value.name === name).length) {
      newErrors.push("A directory with that name already exists in the current directory. Try using a different name.")
    }

    if(newErrors.length) {
      setErrors(newErrors)
      setErrorSnackbarOpen(true)
    } else {
      let newDirectory = {
        name: name,
        type: "directory",
        uid: uid,
        parentId: parentId,
        permissions: permissions,
        blocks: 1,
        cTime: new Date().getTime(),
        blockPointers: freeBlockIndices[0]
      }

      disks[diskName].data[parentId].push(newDirectory)
    }
  }

  const createDisk = () => {
    let newErrors = []
    if(!params.diskName) {
      newErrors.push("You must give the new disk a name.")
    }
    if(isNaN(params.dataBlocks) || params.dataBlocks <= 0) {
      newErrors.push("There are too few blocks to build the file system. Consider increasing the disk size, decreasing the block size, or decreasing the inode size.")
    }
    if(Object.keys(disks).includes(params.diskName)) {
      newErrors.push("That disk name is already being used. Please choose another one.")
    }
    if(newErrors.length) {
      setErrors(newErrors)
      setErrorSnackbarOpen(true)
    } else {
      let data = Array.from({length: params.dataBlocks})
      for(let i = 0; i < data.length; i++) {
        data[i] = []
      }
      let newDisk = {
        name: params.diskName,
        superblock: {
          blockSize: params.blockSize,
          dataBlocks: params.dataBlocks,
          inodeSize: params.inodeSize,
          inodes: params.inodeBlocks,
          system: "VSFS",
        },
        inodeBitmap: Array.from({length: params.inodes}).fill(true),
        dataBitmap: Array.from({length: params.dataBlocks}).fill(true),
        data: data,
      }

      disks[newDisk.name] = newDisk

      // Create the root directory
      createDirectory("root", "Sys", newDisk.name, 0, "rwx-")
      //createFile("test.txt", "User", newDisk.name, 0, "rwxd", 1000)

    }
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
    <ThemeProvider theme={theme}>
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
                        <Typography color="inherit"><code style={{color: "#FF6461"}}>sda</code> or <code style={{color: "#FF6461"}}>C:</code>, for example.</Typography>
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
                      <div className={classes.icon}>
                        <img src={HardDriveIcon} width={50} alt="Hard Drive Icon" />
                      </div>
                      <Typography variant="h6">Nothing to see here. Try creating a new disk.</Typography>
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
            horizontal: "center"
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
    </ThemeProvider>
  )
}

export default App
