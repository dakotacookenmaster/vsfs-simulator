import { makeStyles, Typography, Button } from "@material-ui/core"
import { ArrowBack as ArrowBackIcon } from "@material-ui/icons"
import clsx from "clsx"
import React from "react"

const useStyles = makeStyles(theme => {
    return {
        box: {
            maxHeight: "400px",
            overflowX: "auto",
        },
        container: {
            display: "flex",
            flexWrap: "wrap",
        },
        block: {
            width: "50px",
            height: "50px",
            border: "2px solid white",
            marginRight: "5px",
            marginBottom: "10px",
            padding: "3px",
            "&:last-of-type": {
                marginRight: "0px",
            }
        },
        free: {
            background: "green",
        },
        used: {
            background: "red",
        }
    }
})

const BitmapView = (props) => {
    const classes = useStyles()
    const { title } = props
    const {
        bitmap
    } = props.data
    const {
        setView
    } = props.methods
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
                bitmap.map((value, index) => {
                    return (
                        <div key={`bitmap-${index}`} className={clsx(classes.block, (value ? classes.free : classes.used))}>
                            { index }
                        </div>
                    )
                })
            }
            </div>
        </div>
    )
}

export default BitmapView