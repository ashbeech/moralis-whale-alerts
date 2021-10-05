import { Moralis } from "moralis";
import validate from "../Utils/Validate";
import { Form, Field, useField } from "react-final-form";
import {
  FormControl,
  FormErrorMessage,
  Input,
  Button,
  Box,
  ButtonGroup,
  FormLabel,
  Select,
  Checkbox,
  HStack,
  Textarea,
  InputGroup,
  InputLeftElement,
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
    // capture other params
    let alert_method = values.alert_method;
    let conditions = values.conditions;
    let threshold = values.threshold;
    let notes = values.notes;

    // format input
    const params = {
      address: address.toLowerCase(),
      alert_method: alert_method,
      conditions: conditions,
      threshold: threshold,
      notes: notes,
    };
    // run cloud function to watch, sync and alert
    const watch = await Moralis.Cloud.run("watchAddress", params);
    // user feedback
    if (watch) {
      window.alert(
        JSON.stringify(address + " added to watch list. 🐋👀", 0, 2)
      );
    } else {
      window.alert(
        JSON.stringify("🚫 You're already watching this address. 🚫", 0, 2)
      );
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      render={({ handleSubmit, form, submitting, pristine }) => (
        <Box
          as="form"
          p={4}
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="1px 1px 3px rgba(0,0,0,0.3)"
          onSubmit={handleSubmit}
        >
          <FormLabel htmlFor="address">Wallet Address</FormLabel>

          {
            // input field
          }
          <InputControl
            name="address"
            label="Enter Address"
            colorScheme="green"
          />
          {
            // checkbox
          }
          <Control mb={4} colorScheme="green" name="alert_method" my={4}>
            <FormLabel htmlFor="alert_method">Alert Method</FormLabel>
            <HStack spacing={4}>
              <CheckboxArrayControl name="alert_method" value="telegram">
                Telegram
              </CheckboxArrayControl>
              <CheckboxArrayControl name="alert_method" value="twitter">
                Twitter
              </CheckboxArrayControl>
              <CheckboxArrayControl name="alert_method" value="email">
                Email
              </CheckboxArrayControl>
            </HStack>
            <Error name="alert_method" />
          </Control>

          <Control mb={4} colorScheme="green" name="conditions" my={4}>
            <FormLabel htmlFor="conditions">Conditions</FormLabel>

            <Field
              placeholder="Select option"
              spacing={4}
              colorScheme="green"
              name="conditions"
              component={ReactSelectAdapter}
            >
              <option name="conditions" value="increase">
                ⬆ Increase
              </option>
              <option name="conditions" value="decrease">
                ⬇ Decrease
              </option>
              <option name="conditions" value="change">
                𝚫 Change
              </option>
            </Field>
            <Error name="conditions" />
          </Control>

          {
            // input field
          }
          <FormLabel htmlFor="threshold">Threshold</FormLabel>
          <InputControlLeftIcon
            name="threshold"
            colorScheme="green"
            type="number"
          />

          <TextareaControl
            name="notes"
            label="Notes"
            placeholder="e.g. Coinbase ETH Whale"
          />
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
              Set Alert
            </Button>
            <Button
              colorScheme="green"
              variant="outline"
              onClick={() => {
                form.reset();
              }}
              isDisabled={submitting || pristine}
            >
              Reset
            </Button>
          </ButtonGroup>
          {/*<Box as="pre" my={10}>
              {JSON.stringify(values, 0, 2)}
            </Box>*/}
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

const InputControlLeftIcon = ({ name, label, type }) => {
  const { input, meta } = useField(name);
  return (
    <Control name={name} my={4}>
      <InputGroup>
        <InputLeftElement
          pointerEvents="none"
          color="gray.300"
          fontSize="1.2em"
          children="$"
        />
        <Input
          {...input}
          isInvalid={meta.error && meta.touched}
          id={name}
          placeholder={label}
          type={type}
        />
        <Error name={name} />
      </InputGroup>
    </Control>
  );
};

const CheckboxArrayControl = ({ name, value, children }) => {
  const {
    input: { checked, ...input },
    meta: { error, touched },
  } = useField(name, {
    type: "checkbox", // important for RFF to manage the checked prop
    value, // important for RFF to manage list of strings
  });
  return (
    <Checkbox {...input} isChecked={checked} isInvalid={error && touched}>
      {children}
    </Checkbox>
  );
};

const ReactSelectAdapter = ({ input, ...rest }) => (
  <Select {...input} {...rest} />
);

const AdaptedTextarea = ({ input, meta, ...rest }) => (
  <Textarea {...input} {...rest} isInvalid={meta.error && meta.touched} />
);

const TextareaControl = ({ name, label, placeholder }) => (
  <Control name={name} my={4}>
    <FormLabel htmlFor={name}>{label}</FormLabel>
    <Field
      name={name}
      component={AdaptedTextarea}
      placeholder={placeholder}
      id={name}
    />
    <Error name={name} />
  </Control>
);
