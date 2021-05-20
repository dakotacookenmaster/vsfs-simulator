import React, { useContext } from "react"
import {
    Card,
    Typography
} from "@material-ui/core"
import { SystemContext } from "../contexts/SystemContext"
import Logo from "../images/default-monochrome-white.svg"

const Header = () => {
    const {
        classes
    } = useContext(SystemContext)
    
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