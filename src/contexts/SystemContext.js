import { createContext, useState } from "react"

const SystemContext = createContext()

const SystemContextProvider = ({ children }) => {
    const [currentDirectory, setCurrentDirectory] = useState(0)
    const [disks, setDisks] = useState({})
    const [currentDisk, setCurrentDisk] = useState(null)
    const [currentPath, setCurrentPath] = useState("/")

    const getDirectoryObject = (disks, diskName, directory) => {
        return disks[diskName].dataBlocks[disks[diskName].inodes[directory].blockPointers[0]]
    }
      
    const getInodeObject = (disks, diskName, id) => {
        return disks[diskName].inodes[id]
    }

    const value = {
        currentDirectory,
        disks,
        currentDisk,
        currentPath,
    }

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