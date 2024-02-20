
import React from 'react';
import { Location, useLocation, Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from 'components/Sidebar';
import Output from 'components/Output';
import AES from 'components/Crypto/AES';
import RSA from 'components/Crypto/RSA';
import ECDSA from 'components/Crypto/ECDSA';
import CSR from 'components/Crypto/CSR';
import SHA from 'components/Crypto/SHA';
import Encoding from 'components/Crypto/Encoding';
import { Alert, AlertTitle, Box, Container, LinearProgress, Snackbar, Stack } from '@mui/material';

interface IState {
    loading: boolean,
    menuOpen: boolean,
    errorMsg: string,
    successMsg: string,
    input: string,
    output: string
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

    ToasterSuccess = () => {
        return (
            <Snackbar open={Boolean(this.state.successMsg)}
                autoHideDuration={6000}
                onClose={() => this.setState({ successMsg: '' })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>

                <Alert
                    onClose={() => this.setState({ successMsg: '' })}
                    severity="success"
                    variant="standard"
                    sx={{ width: '100%' }}>
                    <AlertTitle>Success</AlertTitle>
                    {this.state.successMsg}
                </Alert>
            </Snackbar>
        )
    }

    ToasterError = () => {
        return (
            <Snackbar open={Boolean(this.state.errorMsg)}
                autoHideDuration={6000}
                onClose={() => this.setState({ errorMsg: '' })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert
                    onClose={() => this.setState({ errorMsg: '' })}
                    severity="error"
                    variant="standard"
                    sx={{ width: '100%' }}>
                    <AlertTitle>Error</AlertTitle>
                    {this.state.errorMsg}
                </Alert>
            </Snackbar>
        )
    }

    render = () => {
        return (
            <Box className="App">
                <Stack direction="column" justifyContent="center" height='100vh'>
                    <Box sx={{ flexGrow: 1, overflowY: 'scroll', py: 5 }}>

                        <Sidebar open={this.state.menuOpen}
                            path={this.props.location?.pathname || ""}
                            toggleMenu={() => this.setState({ menuOpen: !this.state.menuOpen })}
                        />

                        {this.MenuBtn()}

                        <Container>
                            <Routes>
                                <Route index element={<Navigate to="/AES/Gen" />} />

                                <Route path="/AES/:action" index={true}
                                    element={<AES {...this.state} setState={this.updateState} />} />
                                <Route path="/RSA/:action"
                                    element={<RSA {...this.state} setState={this.updateState} />} />
                                <Route path="/ECDSA/:action"
                                    element={<ECDSA {...this.state} setState={this.updateState} />} />
                                <Route path="/CSR/Gen"
                                    element={<CSR {...this.state} setState={this.updateState} />} />
                                <Route path="/SHA"
                                    element={<SHA {...this.state} setState={this.updateState} />} />
                                <Route path="/Encoding"
                                    element={<Encoding {...this.state} setState={this.updateState} />} />
                            </Routes>
                        </Container>

                        <Container>
                            <Output {...this.state} setState={this.updateState} />
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

                {/* Alerts */}
                {this.ToasterSuccess()}
                {this.ToasterError()}
            </Box>
        );
    }
}

const withNavigation = (Component: any) => {
    return (props: any) => <Component {...props} location={useLocation()} />;
}

export default withNavigation(App);
