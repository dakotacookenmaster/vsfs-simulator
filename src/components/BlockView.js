import React, { useEffect, useState } from "react"

import {
    makeStyles,
    Typography,
    Paper,
} from "@material-ui/core"
import { Pagination } from "@material-ui/lab"

const useStyles = makeStyles(theme => {
    return {
        blockView: {
            maxHeight: "400px",
            overflowX: "auto",
            padding: "10px",
        },
        container: {
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
        },
        block: {
            width: "100px",
            height: "100px",
            padding: "10px",
            display: "table-cell",
            verticalAlign: "middle",
            "&:hover": {
                cursor: "pointer",
                background: "gray",
            }
        },
        label: {
            fontSize: "20px",
        },
        sizeLabel: {
            width: "100px",
            textAlign: "left",
            paddingTop: "3px",
            marginBottom: "10px",
        }
    }
})

const BlockView = (props) => {
    const {
        superblock,
    } = props.data

    const {
        setView
    } = props.methods

    const handlePageChange = (event, newPage) => {
        setPage(newPage)
    }

    const classes = useStyles()
    const [page, setPage] = useState(1)
    const pageSize = 9

    return (
        <>
            <Typography variant="h5" style={{textAlign: "left"}}>Disk Metadata</Typography>
            <hr style={{marginBottom: "20px"}} />
            <div className={classes.blockView}>
                <div className={classes.container}>
                    { /* FIXME */ }
                    {
                        page === 1 && (
                            <>
                                {
                                    ["Superblock", "Inode Bitmap", "Data Bitmap"].map((value, index) => {
                                        return (
                                            <div key={`block-${value}-${index}`}>
                                                <Paper elevation={0} square variant="outlined" className={classes.block} onClick={() => setView(value)}>
                                                    <Typography className={classes.label}>{`${value}`}</Typography>
                                                </Paper>
                                                <Typography className={classes.sizeLabel}>{`${index * superblock.blockSize}KiB`}</Typography>
                                            </div>
                                        )
                                    })
                                }
                                {
                                    [...Array(superblock.inodeBlocks)].slice(0, pageSize - 2).map((_, index) => {
                                        return (
                                            <div key={`block-${(page - 1) * pageSize + index}`}>
                                                <Paper elevation={0} square variant="outlined" className={classes.block}>
                                                    <Typography className={classes.label}>{`iblock ${(page - 1) * pageSize + index}`}</Typography>
                                                </Paper>
                                                <Typography className={classes.sizeLabel}>{`${((page - 1) * pageSize + index + 3) * superblock.blockSize}KiB`}</Typography>
                                            </div>
                                        )
                                    })
                                }
                            </>
                        )
                    }
                    { page !== 1 && 
                        (
                            [...Array(superblock.inodeBlocks)].slice((page - 1) * pageSize, page * pageSize + 2).map((_, index) => {
                                return (
                                    <div key={`block-${(page - 1) * pageSize + 2 + index}`}>
                                        <Paper elevation={0} square variant="outlined" className={classes.block}>
                                            <Typography className={classes.label}>{`iblock ${(page - 1) * pageSize - 2 + index}`}</Typography>
                                        </Paper>
                                        <Typography className={classes.sizeLabel}>{`${((page - 1) * pageSize - 2 + index + 3) * superblock.blockSize}KiB`}</Typography>
                                    </div>
                                )
                            })
                        )
                    }
                    { console.log(superblock.inodeBlocks)}
                    <br />
                    <Pagination 
                        count={Math.ceil(superblock.inodeBlocks / pageSize)} 
                        variant="outlined"
                        shape="rounded" 
                        page={page} 
                        onChange={handlePageChange}
                    />
                </div>
            </div>
        </>
    )
}

export default BlockView