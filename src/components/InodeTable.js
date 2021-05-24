import React, { useState } from "react"
import BitmapView from "./BitmapView"
import BlockView from "./BlockView"
import SuperblockView from "./SuperblockView"
import IBlockView from "./IBlockView"

const InodeTable = (props) => {
    const {
        disk,
    } = props.data

    const [view, setView] = useState("")

    if(view === "Superblock") {
        return (
            <SuperblockView 
                data={{
                    superblock: disk.superblock
                }}
                methods={{
                    setView
                }}
            />
        )
    } else if(view === "Inode Bitmap") {
        return (
            <BitmapView
                title="Inode Bitmap"
                data={{
                    bitmap: disk.inodeBitmap
                }}
                methods={{
                    setView
                }}
            />
        )
    } else if(view === "Data Bitmap") {
        return (
            <BitmapView
                title="Data Bitmap"
                data={{
                    bitmap: disk.dataBitmap
                }}
                methods={{
                    setView
                }}
            />
        )
    } else if(view.includes("iblock")) {
        const blockNumber = view.split("-", 1)[1]
        return (
            <IBlockView data={{
                number: blockNumber,
            }}/>
        )
    } else {
        return (
            <BlockView 
                data={{
                    superblock: disk.superblock,
                }}
                methods={{
                    setView
                }}
            />
        )
    }
}

export default InodeTable