import { ByMoralis } from "react-moralis";
import { Box, Stack, Heading, Center } from "@chakra-ui/react";
import { WatchAddress } from "./Forms/WatchAddress";

function App() {

  return (
    <Center>
    <Box w={450}>
      <Center>
      <Heading m={4} as="h1" size="2xl" isTruncated>🐋🚨</Heading>
      </Center>
      <Stack spacing={3}>
        <Box>
        {
          // form begins here
        }
          <WatchAddress />
        </Box>
      </Stack>
      <Box float="right" mt={4}>
        <ByMoralis width={200} variant="dark"/>
      </Box>
    </Box>
    </Center>
  );
}

export default App;
