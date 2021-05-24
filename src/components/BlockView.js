import React from "react"

import {
    makeStyles,
    Typography,
    Paper,
} from "@material-ui/core"

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

    const classes = useStyles()

    return (
        <>
            <Typography variant="h5" style={{textAlign: "left"}}>Inode Table</Typography>
            <hr style={{marginBottom: "20px"}} />
            <div className={classes.blockView}>
                <div className={classes.container}>
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
                        [...Array(superblock.inodeBlocks)].map((_, index) => {
                            return (
                                <div key={`block-${index}`}>
                                    <Paper elevation={0} square variant="outlined" className={classes.block}>
                                        <Typography className={classes.label}>{`iblock ${index}`}</Typography>
                                    </Paper>
                                    <Typography className={classes.sizeLabel}>{`${(index + 3) * superblock.blockSize}KiB`}</Typography>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </>
    )
}

export default BlockView