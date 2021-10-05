const sha3_256 = require("js-sha3").sha3_256;

const validate = (values) => {
  const errors = {};
  // address field
  if (!values.address) {
    errors.address = "Required";
  } else if (ValidateAddress(values.address) === false) {
    errors.address = "Not a valid address";
  }
  // checkboxes
  if (!values.alert_method || values.alert_method.length < 1) {
    errors.alert_method = "You need at least 1 method";
  }
  return errors;
};

const ValidateAddress = (address) => {
  /**
   * checks if the given string is a checksummed address
   *
   * @method isChecksumAddress
   * @param {String} address the given HEX adress
   * @return {Boolean}
   */
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    // check if it has the basic requirements of an address
    return false;
  } else if (
    /^(0x)?[0-9a-f]{40}$/.test(address) ||
    /^(0x)?[0-9A-F]{40}$/.test(address)
  ) {
    // if it's all small caps or all all caps, return true
    return true;
  } else {
    // otherwise check each case
    return isChecksumAddress(address);
  }
};

const isChecksumAddress = (address) => {
  // Check each case
  address = address.replace("0x", "");
  var addressHash = sha3_256(address.toLowerCase());
  for (var i = 0; i < 40; i++) {
    // the nth letter should be uppercase if the nth digit of casemap is 1
    if (
      (parseInt(addressHash[i], 16) > 7 &&
        address[i].toUpperCase() !== address[i]) ||
      (parseInt(addressHash[i], 16) <= 7 &&
        address[i].toLowerCase() !== address[i])
    ) {
      return false;
    }
  }
};

export default validate;
