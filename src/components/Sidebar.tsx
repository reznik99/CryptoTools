import React from 'react';
import Badge from 'react-bootstrap/Badge';
import { ProSidebar, Menu, MenuItem, SubMenu, SidebarHeader, SidebarFooter, SidebarContent } from 'react-pro-sidebar';
import { Link } from 'react-router-dom';

interface IProps { 
    collapsed: boolean, 
    toggled: boolean, 
    path: string,
}

const Sidebar = (props: IProps) => {

    return (
        <ProSidebar
            collapsed={props.collapsed}
            toggled={props.toggled}
            breakPoint="xs"
            className='p-0'>
            <SidebarHeader>
                <p className='title py-3 m-0'>
                    Crypto Tools
                </p>
            </SidebarHeader>

            <SidebarContent>
                <Menu iconShape="circle">
                    <SubMenu defaultOpen
                        suffix={<Badge bg="dark">4</Badge>}
                        title="Generation"
                        icon={<i className="bi bi-key" />} >
                        <MenuItem active={props.path === "/AES-Gen"}>AES Key<Link to="/AES-Gen"/></MenuItem>
                        <MenuItem active={props.path === "/RSA-Gen"}>RSA Keys<Link to="/RSA-Gen"/></MenuItem>
                        <MenuItem active={props.path === "/ECDSA-Gen"}>ECDSA Keys<Link to="/ECDSA-Gen"/></MenuItem>
                        <MenuItem active={props.path === "/CSR-Gen"}
                            suffix={<Badge bg="success">New</Badge>}>CSR<Link to="/CSR-Gen"/></MenuItem>
                    </SubMenu>

                    <SubMenu
                        suffix={<Badge bg="dark">2</Badge>}
                        title="Encryption/Decryption"
                        icon={<i className="bi bi-lock" />} >
                        <MenuItem active={props.path === "/AES-Enc"}>AES<Link to="/AES-Enc"/></MenuItem>
                        <MenuItem active={props.path === "/RSA-Enc"}>RSA<Link to="/RSA-Enc"/></MenuItem>
                    </SubMenu>

                    <SubMenu
                        suffix={<Badge bg="dark">2</Badge>}
                        title="Signing/Validation"
                        icon={<i className="bi bi-pen" />} >
                        <MenuItem active={props.path === "/RSA-Sig"}>RSA<Link to="/RSA-Sig"/></MenuItem>
                        <MenuItem active={props.path === "/ECDSA-Sig"}
                            suffix={<Badge bg="success">New</Badge>}>ECDSA<Link to="/ECDSA-Sig"/></MenuItem>
                    </SubMenu>

                    <SubMenu
                        suffix={<Badge bg="dark">2</Badge>}
                        title="Hashing"
                        icon={<i className="bi bi-hash" />} >
                        <MenuItem active={props.path === "/SHA"}
                            suffix={<Badge bg="success">New</Badge>}>SHA<Link to="/SHA"/></MenuItem>
                        <MenuItem>MD5</MenuItem>
                    </SubMenu>

                    <SubMenu
                        suffix={<Badge bg="dark">3</Badge>}
                        title="Encoding"
                        icon={<i className="bi bi-wrench" />} >
                        <MenuItem>Base64</MenuItem>
                        <MenuItem>Hex</MenuItem>
                        <MenuItem>Binary</MenuItem>
                    </SubMenu>
                </Menu>
            </SidebarContent>

            <SidebarFooter style={{ textAlign: 'center' }}>
                <div className="sidebar-btn-wrapper p-3" >
                    <a
                        href="https://github.com/reznik99/CryptoTools"
                        target="_blank"
                        className="sidebar-btn"
                        rel="noopener noreferrer" >
                        <i className="bi bi-key"/>
                    </a>
                </div>
            </SidebarFooter>
        </ProSidebar>
    );
};

export default Sidebar;