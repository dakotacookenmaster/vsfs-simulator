import React from "react"
import {
    Card,
    makeStyles,
    Typography
} from "@material-ui/core"
import Logo from "../images/default-monochrome-white.svg"

const useStyles = makeStyles(theme => {
    return {
        header: {
            textAlign: "center",
            padding: "20px",
            margin: "0 auto",
        },
    }
})

const Header = () => {
    const classes = useStyles()
    return (
        <Card className={classes.header} raised={true} background={"primary"}>
            <img src={Logo} alt="VSFS Logo" style={{marginBottom: "20px", maxHeight: "150px"}} />
            <Typography variant="h5">
                by Dakota Cookenmaster
            </Typography>
        </Card>
    )
}

export default Header