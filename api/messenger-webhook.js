// ===================================================================
// MESSENGER WEBHOOK HANDLER
// Verifies webhook and receives messages from Facebook Messenger
// ===================================================================

export default async function handler(req, res) {
  const { method, query, body } = req;

  // ============================================================
  // WEBHOOK VERIFICATION (Facebook calls this to verify)
  // ============================================================
  if (method === 'GET') {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    const VERIFY_TOKEN = process.env.VITE_MESSENGER_VERIFY_TOKEN;

    console.log('📱 Messenger webhook verification attempt');
    console.log('Mode:', mode);
    console.log('Token received:', token);
    console.log('Expected token:', VERIFY_TOKEN);

    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ Webhook verified successfully!');
        // Respond with 200 OK and challenge token from the request
        return res.status(200).send(challenge);
      } else {
        console.log('❌ Verification failed - token mismatch');
        // Responds with '403 Forbidden' if verify tokens do not match
        return res.status(403).send('Forbidden');
      }
    }

    console.log('❌ Verification failed - missing parameters');
    return res.status(400).send('Bad Request');
  }

  // ============================================================
  // WEBHOOK EVENTS (Facebook sends messages here)
  // ============================================================
  if (method === 'POST') {
    console.log('📨 Received webhook event from Messenger');
    console.log('Body:', JSON.stringify(body, null, 2));

    try {
      // Process the webhook event
      if (body.object === 'page') {
        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach((entry) => {
          // Get the webhook event
          const webhookEvent = entry.messaging[0];
          console.log('Webhook event:', webhookEvent);

          // Get the sender PSID
          const senderPsid = webhookEvent.sender.id;
          console.log('Sender PSID:', senderPsid);

          // Check if the event is a message or postback
          if (webhookEvent.message) {
            handleMessage(senderPsid, webhookEvent.message);
          } else if (webhookEvent.postback) {
            handlePostback(senderPsid, webhookEvent.postback);
          }
        });

        // Return a '200 OK' response to all events
        return res.status(200).send('EVENT_RECEIVED');
      } else {
        // Return a '404 Not Found' if event is not from a page subscription
        return res.status(404).send('Not Found');
      }
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      return res.status(500).send('Internal Server Error');
    }
  }

  // If neither GET nor POST
  return res.status(405).send('Method Not Allowed');
}

// ============================================================
// HANDLE MESSAGE
// ============================================================
function handleMessage(senderPsid, receivedMessage) {
  console.log('💬 Message received from:', senderPsid);
  console.log('Message:', receivedMessage);

  // TODO: Process the message and send response
  // For now, just log it
  
  // You can integrate with your chatbot logic here
  // Example: Call your AI service, then send response using callSendAPI()
}

// ============================================================
// HANDLE POSTBACK
// ============================================================
function handlePostback(senderPsid, receivedPostback) {
  console.log('🔘 Postback received from:', senderPsid);
  console.log('Postback:', receivedPostback);

  // TODO: Handle button clicks and quick replies
  // For now, just log it
}

// ============================================================
// SEND MESSAGE (Helper function)
// ============================================================
async function callSendAPI(senderPsid, response) {
  const PAGE_ACCESS_TOKEN = process.env.VITE_MESSENGER_PAGE_ACCESS_TOKEN;

  // Construct the message body
  const requestBody = {
    recipient: {
      id: senderPsid,
    },
    message: response,
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await res.json();
    console.log('✅ Message sent:', data);
    return data;
  } catch (error) {
    console.error('❌ Unable to send message:', error);
    throw error;
  }
}
