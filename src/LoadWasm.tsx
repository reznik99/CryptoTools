import React, { useEffect } from 'react';

import './types/WasmTypes.d.ts';
import './lib/wasm_exec.js';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';

async function loadWasm(): Promise<void> {
    const goWasm = new window.Go();
    const result = await WebAssembly.instantiateStreaming(fetch('crypto.wasm'), goWasm.importObject);
    goWasm.run(result.instance);
}

const LoadWasm: React.FC<React.PropsWithChildren<{}>> = (props) => {
    const [isLoading, setIsLoading] = React.useState(true);

    useEffect(() => {
        console.time("wasm loader")
        loadWasm()
            .then(() => console.log("Loaded WASM crypto module"))
            .catch((err) => console.error("Failed to load WASM crypto module", err))
            .finally(() => {
                setIsLoading(false)
                console.timeEnd("wasm loader")
            })
    }, []);

    if (isLoading) {
        return (
            <Box className="App">
                <Stack spacing={2}
                    width="100vw"
                    height="100vh"
                    justifyContent="center"
                    alignItems="center">
                    <Typography variant='h4'>Loading</Typography>
                    <CircularProgress size={40} />
                </Stack>
            </Box>
        );
    } else {
        return <React.Fragment>{props.children}</React.Fragment>;
    }
};

export default LoadWasm