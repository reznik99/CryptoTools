import React from 'react';
import Badge from 'react-bootstrap/Badge';
import { ProSidebar, Menu, MenuItem, SubMenu, SidebarHeader, SidebarFooter, SidebarContent } from 'react-pro-sidebar';
import { Link } from 'react-router-dom';

interface IProps { 
    collapsed: boolean, 
    toggled: boolean, 
    handleToggleSidebar(value: boolean): void
}

const Sidebar = (props: IProps) => {

    return (
        <ProSidebar
            collapsed={props.collapsed}
            toggled={props.toggled}
            breakPoint="xs"
            onToggle={props.handleToggleSidebar} 
            className='p-0'>
            <SidebarHeader>
                <div className='title'>
                    CryptoTools
                </div>
            </SidebarHeader>

            <SidebarContent>
                <Menu iconShape="circle">
                    <SubMenu defaultOpen
                        suffix={<Badge bg="dark">4</Badge>}
                        title="Generation"
                        icon={<i className="bi bi-key" />} >
                        <MenuItem>AES Key<Link to="/AES-Gen"/></MenuItem>
                        <MenuItem>RSA Keys<Link to="/RSA-Gen"/></MenuItem>
                        <MenuItem>ECDSA Keys<Link to="/ECDSA-Gen"/></MenuItem>
                        <MenuItem suffix={<Badge bg="success">New</Badge>}>CSR<Link to="/CSR-Gen"/></MenuItem>
                    </SubMenu>

                    <SubMenu
                        suffix={<Badge bg="dark">2</Badge>}
                        title="Encryption/Decryption"
                        icon={<i className="bi bi-lock" />} >
                        <MenuItem><Link to="/AES-Enc">AES</Link></MenuItem>
                        <MenuItem><Link to="/RSA-Enc">RSA</Link></MenuItem>
                    </SubMenu>

                    <SubMenu
                        suffix={<Badge bg="dark">2</Badge>}
                        title="Signing/Validation"
                        icon={<i className="bi bi-pen" />} >
                        <MenuItem><Link to="/RSA-Sig">RSA</Link></MenuItem>
                        <MenuItem suffix={<Badge bg="success">New</Badge>}><Link to="/ECDSA-Sig">ECDSA</Link></MenuItem>
                    </SubMenu>

                    <SubMenu
                        suffix={<Badge bg="dark">2</Badge>}
                        title="Hashing"
                        icon={<i className="bi bi-hash" />} >
                        <MenuItem suffix={<Badge bg="success">New</Badge>}><Link to="/SHA">SHA</Link></MenuItem>
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