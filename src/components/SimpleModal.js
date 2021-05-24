import { makeStyles, Modal, Paper } from "@material-ui/core"
import React from "react"

const useStyles = makeStyles(theme => {
    return {
        content: {
            width: "80%",
            margin: "0 auto",
            marginTop: "100px",
            padding: "20px",
        }
    }
})

const SimpleModal = (props) => {
    const classes = useStyles()

    return (
        <Modal
            open={props.data.open}
            onClose={props.methods.handleClose}
            className={classes.modal}
        >
            <Paper className={classes.content}>
                { props.children }
            </Paper>
        </Modal>
    )
}

export default SimpleModal