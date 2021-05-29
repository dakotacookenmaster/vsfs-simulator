import React, { useState } from "react"
import { makeStyles, Typography, Button, Tooltip } from "@material-ui/core"
import { ArrowBack as ArrowBackIcon } from "@material-ui/icons"
import { Pagination } from "@material-ui/lab"
import clsx from "clsx"

const useStyles = makeStyles(theme => {
    return {
        box: {
            maxHeight: "400px",
            overflowX: "auto",
        },
        paginationCenter: {
            paddingTop: "20px",
            display: "flex",
            justifyContent: "center",
        },
        container: {
            display: "flex",
            flexWrap: "wrap",
            width: "80%",
            margin: "0 auto",
        },
        block: {
            width: "20px",
            height: "20px",
            border: "2px solid white",
            marginRight: "3px",
            marginBottom: "3px",
            padding: "1px",
            "&:last-of-type": {
                marginRight: "0px",
            }
        },
        free: {
            background: "green",
        },
        used: {
            background: "red",
        },
    }
})

const BitmapView = (props) => {
    const classes = useStyles()
    const { title, labelPrefix } = props
    const {
        bitmap
    } = props.data
    const {
        setView
    } = props.methods

    const [page, setPage] = useState(1)
    const pageSize = 100

    const handlePageChange = (event, newPage) => {
        setPage(newPage)
    }

    return (
        <div className={classes.box}>
            <Typography variant="h5" style={{textAlign: "left"}}>{ title }</Typography>
            <hr style={{marginBottom: "20px"}} />
            <Button variant="outlined" style={{maxWidth: "30px", float: "left"}} onClick={() => {
                setView("")
            }}>
                <ArrowBackIcon />
            </Button>
            <div style={{clear: "both"}}></div>
            <div className={classes.container} style={{marginTop: "20px"}}>
                {
                    bitmap.slice((page - 1) * pageSize, page * pageSize).map((value, index) => {
                        return (
                            <Tooltip
                                key={`bitmap-${(page - 1) * pageSize + index}`}
                                title={
                                    <Typography 
                                        className={classes.toolTip} 
                                        color="inherit"
                                    >
                                        { `${labelPrefix} ${(page - 1) * pageSize + index}` }
                                    </Typography>
                                }
                                placement="top" 
                                arrow
                            >
                                <div className={clsx(classes.block, (value ? classes.free : classes.used))}></div>
                            </Tooltip>
                        )
                    })
                }
            </div>
            <div className={classes.paginationCenter}>
                <Pagination 
                    count={Math.ceil(bitmap.length / pageSize)} 
                    variant="outlined" 
                    shape="rounded" 
                    page={page} 
                    onChange={handlePageChange}
                /> 
            </div>
        </div>
    )
}

export default BitmapView