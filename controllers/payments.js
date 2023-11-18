module.exports = (app, db, inDevMode, stripe, io) => {
  const bodyParser = require("body-parser");

  let endpointSecret;
  inDevMode
    ? (endpointSecret = "whsec_XzcFdG7YsriM6rLNEykzox9lUtWnl6Ml")
    : (endpointSecret = "whsec_puynq7BuMg9914dZkT9FdB1lia74IxyF");

  // // const endpointSecret = "whsec_DdrRobS81e78fPbwjsU2uCSH299YqOy4"; //for webhook dashboard check

  // const endpointSecret = process.env.STRIPE_WEBHOOKLIVE

  let socketsTriggerFunc;
  io.on("connection", (socket) => {
    socketsTriggerFunc = async (session) => {
      let params = {
        Email: session.customer_details.email.toLowerCase(),
        SubscriptionID: session.subscription, // if using checkout.session else use session.data.id
        CustomerID: session.customer,
      };

      let sqlQuery;

      if (session.amount_total / 100 > 70) {
        sqlQuery = `Update Users SET SubscriptionID =? , CustomerID =? , NextBillingDate=DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY) WHERE LOWER(Email)=?`;
      } else {
        sqlQuery = `Update Users SET SubscriptionID =? , CustomerID =? , NextBillingDate=DATE_ADD(CURRENT_DATE(), INTERVAL 90 DAY) WHERE LOWER(Email)=?`;
      }

      await db.query(
        sqlQuery,
        [params.SubscriptionID, params.CustomerID, params.Email],
        (err, result) => {
          if (err) {
            throw err;
          }

          if (result.affectedRows >= 1) {
            socket.emit("paymentinfo", { msg: "success" });
          } else {
            console.log("no user matched");
          }
        }
      );
    };

    console.log("client connected");

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  const fulfillOrder = async (session) => {
    // if (session.mode == "subscription") {
    let testModeDetails = {
      customer_details: {
        email: "hello@gmail.com",
      },
      subscription: "sadas12121",
      customer: "testingmax",
    };
    inDevMode
      ? socketsTriggerFunc(testModeDetails)
      : socketsTriggerFunc(session);
  };

  app.post(
    "/api/webhook",
    bodyParser.raw({ type: "application/json" }),
    (req, res) => {
      const payload = req.body;
      const sig = req.headers["stripe-signature"];
      let event;
      try {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
      } catch (err) {
        // On error, log and return the error message
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;

          if (session.payment_status === "paid") {
            fulfillOrder(session);
          }

          break;
        }

        case "checkout.session.async_payment_failed": {
          const session = event.data.object;

          break;
        }

        case "customer.subscription.created": {
          const session = event.data.object;
        }
      }
      // Successfully constructed event
      // console.log("✅ Success:", event.id);

      // Return a response to acknowledge receipt of the event
      res.json({ received: true });
    }
  );

  const handlePaymentIntentSucceeded = async (customerId) => {
    try {
      const invoice = await stripe.invoices.retrieveUpcoming({
        customer: customerId,
      });

      const customerEmail = invoice?.customer_email;
      const nextBillingDateTimestamp = invoice?.created;
      const subscriptionId = invoice?.subscription;

      if (customerEmail && nextBillingDateTimestamp && subscriptionId) {
        const nextBillingDate = new Date(nextBillingDateTimestamp * 1000);
        sqlQuery = `Update Users SET SubscriptionID =? , CustomerID =? , NextBillingDate =?  WHERE LOWER(Email)=?`;

        await db.query(
          sqlQuery,
          [subscriptionId, customerId, nextBillingDate, customerEmail],
          (err, result) => {
            if (err) {
              throw err;
            }
            console.log("result", result);
          }
        );
      }
    } catch (err) {
      console.log("error occurred", err);
    }
  };

  app.post(
    "/api/webhookpaymentsuccess",
    bodyParser.raw({ type: "application/json" }),
    (req, res) => {
      const payload = req.body;
      const sig = req.headers["stripe-signature"];
      let event;
      try {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
      } catch (err) {
        // On error, log and return the error message
        console.log("error", err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;
          const customerId = paymentIntent?.customer;
          if (customerId) {
            handlePaymentIntentSucceeded(customerId);
          }

          break;
        default:
          console.log(`Unhandled event type ${event.type}.`);

          res.json({ received: true });
      }
    }
  );
};
