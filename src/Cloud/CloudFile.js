// Moralis cloud functions:
// * add address to watch list
// * alert on change of address state

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
    Moralis.Cloud.run("watchEthAddress", {
      address,
      sync_historical: false,
    });

    // every time the 'to_address' of tx is on our watch list, fire alert
    Moralis.Cloud.afterSave("EthTransactions", async function (request) {
      // check address is in watch list
      const to_address = request.object.get("to_address");
      // query list of watched addresses
      const query = new Moralis.Query("WatchedEthAddress");
      // temporary demo alert condition: address of tx == to_address
      query.equalTo("address", to_address);
      const results = await query.find();

      // results exist, fire alert with link to block explorer
      if (results) {
        // temporary demo alert readout
        logger.info("----------------");
        logger.info("https://etherscan.io/tx/" + request.object.get("hash"));
        logger.info("--🚨ALERT 🚨--");
      }

      // todo: dispatch alerts via Telegram/Twitter/Native Push
      // e.g. send alert: via email
      /*  Moralis.Cloud.sendEmail({
            to: request.user.get("email"),
            templateId: "300ebeac203c4d8d9678163c78fc67e6",
            dynamic_template_data: {
              name: data.to_address
            }
          });
      */
      // todo: check if conditions regarding address are met
      // todo: cross-chain, same code.
    });

    return true;
  }
});
