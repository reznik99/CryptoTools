import { ArrowDropDown, ArrowDropUp, Handshake, Key, Lock, Settings, SignalWifiStatusbar4Bar } from '@mui/icons-material';
import { Box, Collapse, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import { Link } from 'react-router-dom';

type menuObject = {
    link: string;
    icon: JSX.Element;
    submenus?: Map<string, { link: string }>
}

const actions = new Map<string, menuObject>(
    [
        ["Key Generation", {
            link: "/Gen",
            icon: <Key />,
            submenus: new Map<string, { link: string }>(
                [
                    ["AES Key", {
                        link: "/AES"
                    }],
                    ["RSA Keys", {
                        link: "/RSA"
                    }],
                    ["ECDSA Keys", {
                        link: "/ECDSA"
                    }],
                    ["CSRs", {
                        link: "/CSR"
                    }]
                ]
            )
        }],
        ["Encryption/Decryption", {
            link: "/Enc",
            icon: <Lock />,
            submenus: new Map<string, { link: string }>(
                [
                    ["AES", {
                        link: "/AES"
                    }],
                    ["RSA", {
                        link: "/RSA"
                    }],
                ]
            )
        }],
        ["Signing/Validation", {
            link: "/Sig",
            icon: <SignalWifiStatusbar4Bar />,
            submenus: new Map<string, { link: string }>(
                [
                    ["RSA", {
                        link: "/RSA"
                    }],
                    ["ECDSA", {
                        link: "/ECDSA"
                    }],
                ]
            )
        }],
        ["Hashing", {
            link: "/SHA",
            icon: <Handshake />,
            submenus: new Map<string, { link: string }>(
                [
                    ["SHA", {
                        link: ""
                    }],
                ]
            )
        }],
        ["Encoding", {
            link: "/Encoding",
            icon: <Settings />,
            submenus: new Map<string, { link: string }>(
                [
                    ["Convert", {
                        link: ""
                    }]
                ]
            )
        }],
    ]
)

interface IProps {
    toggleMenu: () => void
    open: boolean,
    path: string,
}

const Sidebar = (props: IProps) => {

    const [menuOpen, setMenuOpen] = useState("")

    useEffect(() => {
        const action = props.path.split("/")
        if (menuOpen === "" && action?.length) {
            setMenuOpen("/" + action[action.length - 1])
        }
    }, [props.path])

    const toggleSubMenu = (action: string) => {
        if (menuOpen === action) {
            setMenuOpen("")
        } else {
            setMenuOpen(action)
        }
    }

    return (
        <Drawer anchor="left"
            open={props.open}
            onClose={props.toggleMenu}>

            <Box sx={{ width: 250 }} role="presentation">
                {Array.from(actions).map(([key, value], idx) => {
                    const action = value.link
                    const submenu = value.submenus || new Map<string, menuObject>()
                    const submenuOpen = menuOpen === action
                    return (
                        <List key={idx}>
                            <ListItem disablePadding onClick={() => toggleSubMenu(action)}>
                                <ListItemButton>
                                    <ListItemIcon> {value.icon} </ListItemIcon>
                                    <ListItemText primary={key} className='text-secondary' />
                                    <ListItemIcon> {submenuOpen ? <ArrowDropUp /> : <ArrowDropDown />} </ListItemIcon>
                                </ListItemButton>
                            </ListItem>
                            <Collapse in={submenuOpen} >
                                <List component="div" disablePadding>
                                    {Array.from(submenu).map(([subkey, subvalue], idx) => {
                                        const path = subvalue.link + action
                                        return (
                                            <Link to={path} key={idx}
                                                className='text-light'
                                                style={{ textDecoration: 'none' }}>
                                                <ListItemButton
                                                    sx={{ pl: 4 }}
                                                    selected={props.path === path}>
                                                    <ListItemText primary={subkey} />
                                                </ListItemButton>
                                            </Link>
                                        )
                                    })}
                                </List>
                            </Collapse>
                            <Divider />
                        </List>
                    )
                })}
            </Box>

            <div className="text-center mb-3 mt-auto" >
                <a href="https://github.com/reznik99/CryptoTools"
                    target="_blank"
                    className="text-success p-3"
                    rel="noopener noreferrer" >
                    <Key />
                </a>
            </div>

        </Drawer>
    );
}

export default Sidebar
