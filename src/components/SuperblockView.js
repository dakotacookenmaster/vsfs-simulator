import { Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@material-ui/core"
import { ArrowBack as ArrowBackIcon } from "@material-ui/icons"
import React from "react"

const SuperblockView = (props) => {
    const { 
        superblock
    } = props.data
    const {
        setView
    } = props.methods
    return (
        <>
            <Typography variant="h5" style={{textAlign: "left"}}>Superblock&nbsp;</Typography>
            <hr style={{marginBottom: "20px"}} />
            <Button variant="outlined" style={{float: "left"}} onClick={() => {
                setView("")
            }}>
                <ArrowBackIcon />
            </Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell><b>Name</b></TableCell>
                        <TableCell><b>Value</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>

                        <TableCell>
                            Block Size
                        </TableCell>
                        <TableCell>
                            {superblock.blockSize} KiB
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            # of Data Blocks
                        </TableCell>
                        <TableCell>
                            {superblock.dataBlocks}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            Inode Size
                        </TableCell>
                        <TableCell>
                            {superblock.inodeSize} B
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            # of Inode Blocks
                        </TableCell>
                        <TableCell>
                            {superblock.inodeBlocks}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            # of Inodes
                        </TableCell>
                        <TableCell>
                            {superblock.inodes}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            System Name
                        </TableCell>
                        <TableCell>
                            {superblock.system}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </>
    )
}

export default SuperblockView