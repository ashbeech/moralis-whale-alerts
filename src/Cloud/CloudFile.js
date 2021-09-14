// Moralis cloud functions:
// * add address to watch list
// * alert on change of address state

// todo: implement various conditions to apply to wathced addresses
// todo: cross-chain compatible.
// todo: all hardcoded variables and settings are exposed to frontend UI
// todo: user accounts login/logout/etc

// ---

const sendTelegramAlert = async (request) => {
  // Telegram creds
  const telegram_bot_id = "xxx"; // <-- ENTER TELEGRAM BOT ID
  const chat_id = "-xxx"; // <-- ENTER TELEGRAM CHAT ID

  // alert message
  let message = "https://etherscan.io/tx/" + request.get("hash");

  // Moralis httpRequest to Telegram API
  Moralis.Cloud.httpRequest({
    url: "https://api.telegram.org/bot" + telegram_bot_id + "/sendMessage",
    method: "POST",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "cache-control": "no-cache",
    },
    params: "chat_id=" + chat_id + "&text=" + message,
  }).then(
    function (httpResponse) {
      logger.info(httpResponse.text);
    },
    function (httpResponse) {
      logger.info("Request failed with response code " + httpResponse.status);
    }
  );
};

// full description of how to set this up with Moralis x SendGrid here:
// https://youtu.be/SY30AUb8144
// docs here: https://docs.moralis.io/moralis-server/tools/sending-email

const sendEmailAlert = async (request) => {
  let _link = "https://etherscan.io/tx/" + request.get("hash");

  Moralis.Cloud.sendEmail({
    to: "xxx", // <-- ENTER EMAIL ADDRESS HERE
    templateId: "d-xxx", // <-- ENTER SENDGRID TEMPLATE ID HERE
    dynamic_template_data: {
      link: _link,
    },
  });
};

Moralis.Cloud.define("watchAddress", async (request) => {
  const logger = Moralis.Cloud.getLogger();

  // check 1/2: address exists
  if (!request.params.address) {
    logger.info("error: missing address param.");
  } else {
    let address = request.params.address;

    if (!address) {
      return null;
    }

    // check 2/2: address is not already being watched
    const countQuery = new Moralis.Query("WatchedEthAddress");
    countQuery.equalTo("address", address);
    const watchCount = await countQuery.count();

    if (watchCount > 0) {
      // already on watch list, don't sync again
      return null;
    }

    // add address to watch list
    // sync all txs in realtime to WatchedEthAddress class
    await Moralis.Cloud.run("watchEthAddress", {
      address,
      sync_historical: false,
    });

    // method of alerting
    const alert_method = "telegram"; // temporarily static for demo telegram/email/twitter/etc
    // check address has saved
    const query = new Moralis.Query("WatchedEthAddress");
    // get row of saved address
    query.equalTo("address", address);
    const row_object = await query.first();
    // set alert method for that row
    row_object.set("alertMethod", alert_method);
    // save it
    try {
      await row_object.save();
    } catch (err) {
      logger.info(err);
    }

    // every time the 'to_address' of tx is on our watch list, fire alert
    Moralis.Cloud.afterSave("EthTransactions", async function (request) {
      // check address is in watch list
      const to_address = request.object.get("to_address");
      // query list of watched addresses
      const query = new Moralis.Query("WatchedEthAddress");
      // temporary demo alert condition: address of tx == to_address
      query.equalTo("address", to_address);
      // results = tx data
      const tx_data = await query.first();

      // results exist, fire alert with link to block explorer
      if (tx_data) {
        // temporary demo alert readout
        /*
        logger.info("----------------");
        logger.info("https://etherscan.io/tx/" + request.object.get("hash"));
        logger.info("--🚨ALERT 🚨--");
        */

        // declare alert method from
        let _alert_method = tx_data.get("alertMethod");
        // pass instructions to allocated alert functions as request.object

        //if telegram selected
        if (_alert_method == "telegram") {
          sendTelegramAlert(request.object);
        }
        //if email selected
        if (_alert_method == "email") {
          //sendEmailAlert(request.object);
        }
        //if Twitter selected
        if (_alert_method == "twitter") {
          //todo: expose to twitter API
          //sendTwitterAlert(request.object);
        }
      }
    });

    return true;
  }
});
