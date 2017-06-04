var functions = require('firebase-functions');

const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

// [START addMessage]
// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
// [START addMessageTrigger]
exports.addMessage = functions.https.onRequest((req, res) => {
// [END addMessageTrigger]
  // Grab the text parameter.
  const original = req.query.text;
  // Push it into the Realtime Database then send a response
  admin.database().ref('/messages').push({original: original}).then(snapshot => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    // res.redirect(303, snapshot.ref);    
  });
});
// [END addMessage]

// [START makeUppercase]
// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
// [START makeUppercaseTrigger]
exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
    .onWrite(event => {
// [END makeUppercaseTrigger]
      // [START makeUppercaseBody]
      // Grab the current value of what was written to the Realtime Database.
      const original = event.data.val();
      console.log('Uppercasing', event.params.pushId, original);
      const uppercase = original.toUpperCase();
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
      return event.data.ref.parent.child('uppercase').set(uppercase);
      // [END makeUppercaseBody]
    });
// [END makeUppercase]
// [END all]

// exports.notifyUserOrderReady = functions.database.ref('/providers/{provider}/{provider}_finished_orders')
//     .onWrite(event => {
//       // Grab the current value of what was written to the Realtime Database.
//       const original = event.data.val();
//
//       console.log('NotifyingUserOrderReady', event.params.pushId, original);
//
//       admin.database().ref('/users/'+original.userId+'/'+original.userId+'_ready_orders').push({original: original}).then(snapshot => {
//           // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
//           // res.redirect(303, snapshot.ref);
//       });
//       return event.data.ref.parent.child(original.date).child(original.key).set(original);
//     });
//

const cors = require('cors')({origin: true});

exports.date = functions.https.onRequest((request, response) => {
  if (request.method === 'PUT') {
    response.status(403).send('Forbidden!');
  }
  cors(request, response, () => {
    var date = new Date;
    console.log('Sending Formatted date:', date);
    response.status(200).send(date);
  });
});


// const nodemailer = require('nodemailer');
//
// var transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'Go4eat.contact@gmail.com',
//     pass: 'go$eat@)!&'
//   }
// });
//
// var mailOptions = {
//   from: 'Go4eat.contact@gmail.com',
//   to: 'guyhecht1990@gmail.com',
//   subject: 'Sending Email using Node.js',
//   text: 'That was easy!'
// };

// exports.test = functions.https.onRequest((request, response) => {
//   transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//   });
// })
