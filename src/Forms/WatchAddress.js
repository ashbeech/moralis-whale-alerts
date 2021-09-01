import { Moralis } from "moralis";
import validate from "../Utils/Validate";
import { Form, useField } from "react-final-form";
import {
  FormControl,
  FormErrorMessage,
  Input,
  Button,
  Box,
  ButtonGroup,
} from "@chakra-ui/react";

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;

Moralis.initialize(appId);
Moralis.serverURL = serverUrl;

  /**
   * Build form and handle input
   *
   * @method onSubmit
   * @return <Form/>
   */

export const WatchAddress = () => {

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // handle form submission
  const onSubmit = async (values) => {
    await sleep(300);
    // capture address
    let address = values.address;
    // format input
    const params = { address: address.toLowerCase() };
    // run cloud function to watch, sync and alert
    const watch = await Moralis.Cloud.run("watchAddress", params);
    // user feedback
    if(watch){
      window.alert(JSON.stringify(address + " added to watch list. 🐋👀", 0, 2));
    } else {
      window.alert(JSON.stringify("🚫 You're already watching this address. 🚫", 0, 2));
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      render={({
        handleSubmit,
        form,
        errors,
        submitting,
        pristine,
        values,
      }) => (
        <Box
          as="form"
          p={4}
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="1px 1px 3px rgba(0,0,0,0.3)"
          onSubmit={handleSubmit}
        >
        {
          // input field
        }
          <InputControl name="address" label="Enter Address" colorScheme="green"/>
          <ButtonGroup spacing={4}>
          {
          // submit button
          }
            <Button
              isLoading={submitting}
              loadingText="Submitting"
              colorScheme="green"
              type="submit"
              isDisabled={pristine}
            >
              Submit
            </Button>
            <Button
              colorScheme="green"
              variant="outline"
              onClick={form.restart}
              isDisabled={submitting || pristine}
            >
              Reset
            </Button>
          </ButtonGroup>
          {/* <Box as="pre" my={10}>
            {JSON.stringify(values, 0, 2)}
          </Box> */}
        </Box>
      )}
    />
  );
};

const Control = ({ name, ...rest }) => {
  const {
    meta: { error, touched },
  } = useField(name, { subscription: { touched: true, error: true } });
  return <FormControl {...rest} isInvalid={error && touched} />;
};

const Error = ({ name }) => {
  const {
    meta: { error },
  } = useField(name, { subscription: { error: true } });
  return <FormErrorMessage>{error}</FormErrorMessage>;
};

const InputControl = ({ name, label }) => {
  const { input, meta } = useField(name);
  return (
    <Control name={name} my={4}>
      <Input
        {...input}
        isInvalid={meta.error && meta.touched}
        id={name}
        placeholder={label}
      />
      <Error name={name} />
    </Control>
  );
};
