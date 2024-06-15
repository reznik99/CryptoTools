import { ArrowDropDown, ArrowDropUp, Draw, Key, Lock, Settings, SignalWifiStatusbar4Bar } from '@mui/icons-material';
import { Box, Collapse, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Badge } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type menuObject = {
    link: string;
    icon: JSX.Element;
    submenus?: Map<string, submenuObject>
}

type submenuObject = {
    link: string;
    isNew?: boolean;
}

const actions = new Map<string, menuObject>(
    [
        ["Generation", {
            link: "/Gen",
            icon: <Key />,
            submenus: new Map(
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
                        link: "/CSR",
                        isNew: true
                    }]
                ]
            )
        }],
        ["Encryption", {
            link: "/Enc",
            icon: <Lock />,
            submenus: new Map(
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
        ["Signatures", {
            link: "/Sig",
            icon: <SignalWifiStatusbar4Bar />,
            submenus: new Map(
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
            icon: <Draw />,
            submenus: new Map(
                [
                    ["SHA", {
                        link: "",
                        isNew: true
                    }],
                ]
            )
        }],
        ["Encoding", {
            link: "/Encoding",
            icon: <Settings />,
            submenus: new Map(
                [
                    ["Convert", {
                        link: "",
                        isNew: true
                    }]
                ]
            )
        }],
    ]
)

interface IProps {
    toggleMenu: () => void;
    setState: Function;
    open: boolean;
    path: string;
}

const Sidebar = (props: IProps) => {

    const [menuOpen, setMenuOpen] = useState("")

    useEffect(() => {
        const action = props.path.split("/")
        if (menuOpen === "" && action?.length) {
            setMenuOpen("/" + action[action.length - 1])
        }
    }, [props.path, menuOpen])

    const toggleSubMenu = (action: string) => {
        if (menuOpen === action) {
            setMenuOpen("")
        } else {
            setMenuOpen(action)
        }
    }

    return (
        <Drawer anchor="left" variant='persistent' open={props.open} onClose={props.toggleMenu}>

            <p className='drawer-darker-section title py-3 m-0'> Crypto Tools </p>
            <Divider />

            <Box role="presentation" sx={{ width: 275, pr: 1 }} className="drawer-darker-section">
                {Array.from(actions).map(([key, value], idx) => {
                    const action = value.link
                    const submenu = value.submenus || new Map<string, menuObject>()
                    const submenuOpen = menuOpen === action
                    return (
                        <List key={idx}>
                            <ListItem disablePadding onClick={() => toggleSubMenu(action)}>
                                <ListItemButton selected={submenuOpen}>
                                    <ListItemIcon> {value.icon} </ListItemIcon>
                                    <ListItemText primary={key} />
                                    <ListItemIcon> {submenuOpen ? <ArrowDropUp /> : <ArrowDropDown />} </ListItemIcon>
                                    <Badge badgeContent={`+${submenu.size}`} color="success" />
                                </ListItemButton>
                            </ListItem>
                            <Collapse in={submenuOpen} >
                                <List component="div" disablePadding>
                                    {Array.from(submenu).map(([subkey, subvalue], idx) => {
                                        const path = subvalue.link + action
                                        const selected = props.path === path
                                        return (
                                            <Link to={path} onClick={() => props.setState({ output: '' })} key={idx}
                                                className='text-light'
                                                style={{ textDecoration: 'none' }}>
                                                <ListItemButton sx={{ pl: 4 }} selected={selected}>
                                                    <ListItemText primary={subkey}
                                                        primaryTypographyProps={{ color: selected ? "primary" : "" }}
                                                    />
                                                    <Badge hidden={!subvalue.isNew}
                                                        badgeContent="New"
                                                        color="info"
                                                        sx={{ mr: 1 }} />
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

            <Divider />
            <div className="drawer-darker-section text-center p-3 mt-auto" >
                <a href="https://github.com/reznik99/CryptoTools"
                    target="_blank"
                    className="text-success p-3"
                    rel="noopener noreferrer" >
                    <Key />
                </a>
            </div>

        </Drawer >
    );
}

export default Sidebar
