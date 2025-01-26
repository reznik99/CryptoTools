
import React from 'react';
import { Location, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { Alert, Box, Container, LinearProgress, Stack } from '@mui/material';

import Sidebar from 'components/Sidebar';
import Output from 'components/Output';
import AES from 'components/Crypto/AES';
import RSA from 'components/Crypto/RSA';
import ECDSA from 'components/Crypto/ECDSA';
import HKDF from 'components/Crypto/KDF_HKDF';
import CSR from 'components/Crypto/CSR';
import Certificate from 'components/Crypto/Certificate';
import SHA from 'components/Crypto/SHA';
import Encoding from 'components/Crypto/Encoding';
import InfoMessage from 'components/Feedback/InfoMessage';
import ActionAlerts from 'components/Feedback/ActionAlerts';
import PBKDF2 from 'components/Crypto/KDF_PBKDF2';

interface IState {
    loading: boolean;
    menuOpen: boolean;

    // Action feedback
    errorMsg: string;
    successMsg: string;
    infoMsg: string;
    showInfo: boolean;

    // Input & Output to actions
    input: string;
    output: string;
}
interface IProps {
    location: Location
}

class App extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props)
        this.state = {
            loading: false,
            menuOpen: true,
            errorMsg: '',
            successMsg: '',
            infoMsg: '',
            showInfo: false,
            input: '',
            output: ''
        };
    }

    updateState = (newState: any) => {
        this.setState(newState)
    }

    MenuBtn = () => {
        return this.state.menuOpen
            ? <i className="bi bi-x px-3 py-2 toggle-menu-btn active" onClick={() => this.setState({ menuOpen: false })} />
            : <i className="bi bi-list px-3 py-2 toggle-menu-btn" onClick={() => this.setState({ menuOpen: true })} />
    }

    render = () => {
        return (
            <Box className="App">
                <Stack direction="column" justifyContent="center" height='100vh'>
                    <Box sx={{ flexGrow: 1, overflowY: 'scroll', py: 5 }}>

                        <Sidebar open={this.state.menuOpen}
                            setState={this.updateState}
                            path={this.props.location?.pathname || ""}
                            toggleMenu={() => this.setState({ menuOpen: !this.state.menuOpen })}
                        />

                        {this.MenuBtn()}
                        <Container>
                            <Stack direction="column" spacing={3}>
                                <Routes>
                                    <Route index element={<Navigate to="/AES/Gen" />} />

                                    <Route path="/AES/:action" index={true}
                                        element={<AES {...this.state} setState={this.updateState} />} />
                                    <Route path="/RSA/:action"
                                        element={<RSA {...this.state} setState={this.updateState} />} />
                                    <Route path="/ECDSA/:action"
                                        element={<ECDSA {...this.state} setState={this.updateState} />} />
                                    <Route path="/HKDF/:algorith"
                                        element={<HKDF {...this.state} setState={this.updateState} />} />
                                    <Route path="/PBKDF2/:action"
                                        element={<PBKDF2 {...this.state} setState={this.updateState} />} />
                                    <Route path="/CSR/Gen"
                                        element={<CSR {...this.state} setState={this.updateState} />} />
                                    <Route path="/Certificate/Gen"
                                        element={<Certificate {...this.state} setState={this.updateState} />} />
                                    <Route path="/SHA"
                                        element={<SHA {...this.state} setState={this.updateState} />} />
                                    <Route path="/Encoding"
                                        element={<Encoding {...this.state} setState={this.updateState} />} />
                                </Routes>

                                <Output {...this.state} setState={this.updateState} />
                            </Stack>
                        </Container>
                    </Box>

                    <Box sx={{ width: '100%', borderTopColor: 'transparent' }} borderTop={this.state.loading ? 0 : 3}>
                        <LinearProgress hidden={!this.state.loading} />
                        <Alert variant="standard" severity="info"
                            sx={{ textAlign: 'center', justifyContent: 'center', maxHeight: 70, mb: 0 }}>
                            Made with <i className="bi bi-heart-fill" style={{ color: "#ff0000" }} /> and <i className="bi bi-cup-hot-fill" />.
                            Open source on <a href="https://github.com/reznik99/CryptoTools" {...{ target: "_blank" }}>github.com</a>
                        </Alert>
                    </Box>
                </Stack>

                {/* Alerts and Popups */}
                <InfoMessage close={() => this.setState({ showInfo: false })} showInfo={this.state.showInfo} infoMsg={this.state.infoMsg} />
                <ActionAlerts setState={(state) => this.setState(state)}
                    successMsg={this.state.successMsg}
                    errorMsg={this.state.errorMsg} />
            </Box>
        );
    }
}

const withNavigation = (Component: any) => {
    return (props: any) => <Component {...props} location={useLocation()} />;
}

export default withNavigation(App);
