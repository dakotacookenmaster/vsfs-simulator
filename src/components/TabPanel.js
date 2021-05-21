import React from "react"

const TabPanel = (props) => {
    const { children, index, value } = props
    return (
        <div hidden={index !== value} style={{
            marginTop: "20px",
            textAlign: "center",
        }}>
        { children }
        </div>
    )
}

export default TabPanel