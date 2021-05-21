import React from "react"

import {
    Snackbar,
    Typography,
    IconButton,
} from "@material-ui/core"

import {
    Close as CloseIcon
} from "@material-ui/icons"

const ErrorSnackbar = (props) => {
    const {
        errorSnackbarOpen,
        errors,
    } = props.data
    
    const {
        setErrorSnackbarOpen
    } = props.methods

    return (
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
        />
    )
}

export default ErrorSnackbar



