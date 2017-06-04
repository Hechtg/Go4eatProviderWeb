/** Global Variables **/
var dbClientReference; // WILL hold a reference to the go4eatweb firebase project database AFTER LINKING FIREBASE TO THE PAGE
var dbProviderReference; // WILL hold a reference to the go4eatprovider-5dac4 firebase project database AFTER LINKING FIREBASE TO THE PAGE
var provider; // holds a reference to our current user
var orders = []; // holds all the current unfinished orders
var ordersHistory = []; // holds the history of current provider's orders
var finishedOrders = []; // holds all of todays finished orders
var onHoldOrders = []; // holds all of todays On-Hold orders (problematic orders awaiting solution)
var date; // holds todays Date object
var today; // holds today's date as a string in the following format: dd_mm_yyyy
var GMT = 3; // update as neccessary

/**this is a backup date in case the server request fails**/
  date = new Date();
  var minutes = addZero(date.getMinutes());
  var hours = addZero(date.getHours());
  var day = addZero(date.getDate());
  var month = addZero(date.getMonth()+1);
  var year = addZero(date.getFullYear());
  today =
      day
     +"_"
     +month
     +"_"
     +year;
/**END - this is a backup date in case the server request fails**/

// Assign handlers immediately after making the request,
$.get( "https://us-central1-go4eatprovider-5dac4.cloudfunctions.net/date?gmt="+GMT, function(resDate) {
    date = new Date(resDate);
    var minutes = addZero(date.getMinutes());
    var hours = addZero(date.getHours()+GMT);
    var day = addZero(date.getDate());
    var month = addZero(date.getMonth()+1);
    var year = addZero(date.getFullYear());
    today =
        day
       +"_"
       +month
       +"_"
       +year;

    /** This code forces the page to update at 00:00 to avoid old content **/
    //TODO: FINISH THIS
    // var midnight = new Date(
    //  date.getFullYear(),
    //  date.getMonth(),
    //  date.getDate() + 1, // the next day, ...
    //  0,
    //  0,
    //  0
    // );
    // setTimeout(changeDay, (midnight.getTime() - date.getTime()));
  })
  .fail(function() {
   alert( "error - date" );
  });

$("script[name='firebaseScripts']").ready(function() {
  // Initialize Firebase
  var providerConfig = {
    apiKey: "AIzaSyBmxr2j77P571cuMDbIJLytl5ts7jL7J4o",
    authDomain: "go4eatprovider-5dac4.firebaseapp.com",
    databaseURL: "https://go4eatprovider-5dac4.firebaseio.com",
    projectId: "go4eatprovider-5dac4",
    storageBucket: "go4eatprovider-5dac4.appspot.com",
    messagingSenderId: "867135430663"
  };

  var clientConfig = {
    apiKey: "AIzaSyA9j_49jkNPNYmNJ-YRwpB1F0YX4WEN0WI",
    authDomain: "go4eatweb.firebaseapp.com",
    databaseURL: "https://go4eatweb.firebaseio.com",
    projectId: "go4eatweb",
    storageBucket: "go4eatweb.appspot.com",
    messagingSenderId: "455829610429"
  };

  var providerFb = firebase.initializeApp(providerConfig);
  var clientFb = firebase.initializeApp(clientConfig, "clientFb");

  dbProviderReference = providerFb.database();
  dbClientReference = clientFb.database();
});


$(document).ready(function() {
  /** dynamic menu functions **/
  $('body').addClass('js');
  var $menu = $('#menu'),
    $menulink = $('.menu-link');
  $menulink.click(function() {
    $menulink.toggleClass('active');
    $menu.toggleClass('active');
    return false;
  });
  /** end - dynamic menu functions **/
  initApp(); // user authentication and database listeners
});

/**
 * Handles the sign in button press.
 */
function handleSignIn() {
  if (!firebase.auth().currentUser) {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    if (email.length < 4) {
      alert('Please enter an email address.');
      return;
    }
    if (password.length < 4) {
      alert('Please enter a password.');
      return;
    }
    // Sign in with email and pass.
    // [START authwithemail]
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // [START_EXCLUDE]
      if (errorCode === 'auth/wrong-password') {
        alert('Wrong password.');
      } else {
        alert(errorMessage);
      }
      console.log(error);
      // [END_EXCLUDE]
    });
    // [END authwithemail]
  }
}

/**
 * Handles the sign out button press.
 */
function handleSignOut() {
  $('#menu').toggleClass('active');
  if (firebase.auth().currentUser) {
    firebase.auth().signOut();
  } else {
    console.log("error - sign-out without sign-in")
  }
}

/**
 * Handles the sign up button press.
 */
function handleSignUp() {
  var newProvider = {};
  var email = $('#signUpPage-email').val();
  newProvider.email = $('#signUpPage-email').val();
  // var email = document.getElementById('email').value;
  var password = $('#signUpPage-password').val();
  // var password = document.getElementById('password').value;
  newProvider.displayName = $('#providerName').val();
  console.log("in handleSignUp - newProvider.displayName: ", newProvider.displayName);

  if (email.length < 4) {
    alert('Please enter an email address.');
    return;
  }
  if (password.length < 4) {
    alert('Please enter a password.');
    return;
  }
  // Sign in with email and pass.
  // [START createwithemail]
  firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user) {
      provider = newProvider;
      /**here I can update the firebase user object.
      afire base user has the following properties:
      id (unique)
      email (unique)
      display name
      photo url
      **/
      var user = firebase.auth().currentUser;
      user.updateProfile({
        displayName: newProvider.displayName
      }).then(function() {
        // Update successful.
      }, function(error) {
        // An error happened.
        alert(error);
        console.log("FAILED did not updat user displayName");
      });
  }, function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // [START_EXCLUDE]
      if (errorCode == 'auth/weak-password') {
        alert('The password is too weak.');
      } else {
        alert(errorMessage);
      }
      console.log(error);
      // [END_EXCLUDE]
      // Adding extra data on the user to my Users database
      var updates = {};
      updates["/providers/"+newProvider.displayName] = newProvider;
      return dbProviderReference.ref().update(updates);
    });
  // [END createwithemail]
}

/**
 * Sends an email verification to the user.
 */
function sendEmailVerification() {
  // [START sendemailverification]
  firebase.auth().currentUser.sendEmailVerification().then(function() {
    // Email Verification sent!
    // [START_EXCLUDE]
    alert('Email Verification Sent!');
    // [END_EXCLUDE]
  });
  // [END sendemailverification]
}

// function forgotPassword(){
//   $("#quickstart-password-reset").hide();
// }

function sendPasswordReset() {
  var email = document.getElementById('email').value;
  // [START sendpasswordemail]
  firebase.auth().sendPasswordResetEmail(email).then(function() {
    // Password Reset Email Sent!
    // [START_EXCLUDE]
    alert('Password Reset Email Sent!');
    // [END_EXCLUDE]
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode == 'auth/invalid-email') {
      alert(errorMessage);
    } else if (errorCode == 'auth/user-not-found') {
      alert(errorMessage);
    }
    console.log(error);
    // [END_EXCLUDE]
  });
  // [END sendpasswordemail];
}

/**
 * initApp handles setting up UI event listeners and registering Firebase auth listeners:
 *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
 *    out, and that is where we update the UI.
 */
function initApp() {
  // Listening for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function(user) {
    showHomePage();
    if (user) {
      // User is signed in.
      /** This section of code builds up the pages only the provider is allowed to see **/
      provider = {};
      provider.displayName = user.displayName;
      provider.email = user.email;
      /** build more provider properties here **/

      listenOnDateBase();

      $("li[name=signedInMenu]").show(); // show what you can to create a "working" feeling
      $("li[name=signedOutMenu]").hide(); // hide what's not relevant

    } else {
      // User is signed out.
      provider = null;
      $("li[name=signedOutMenu]").show(); // show what you can to create a "working" feeling
      $("li[name=signedInMenu]").hide(); // hide the user's data to create a feeling that it's gone
      tearDownUserPages(); // remove database listenrs and destory all the pages to prevent private info from leeking
    }
  });
}


/**********Auxilary Functions************/

// create listeners on all neccessary database nodes
function listenOnDateBase(){
  /** listen on the provider's orders and update the orders table accordingly **/
  var todaysProviderOrdersRef = dbProviderReference.ref('providers/'+provider.displayName+"/"+provider.displayName+'_orders/'+today);
  todaysProviderOrdersRef.on('child_added', function(data){
    updateOrdersArray(data.val(), orders);
    buildOrdersTable(orders, "#ordersTableInjectPoint", today);
  });

  /** listen on the provider's finished-orders and update the finished orders table accordingly **/
  var todaysProviderFinishedOrdersRef = dbProviderReference.ref('providers/'+provider.displayName+"/"+provider.displayName+'_finished_orders/'+today);
  todaysProviderFinishedOrdersRef.on('child_added', function(data){
    updateOrdersArray(data.val(), finishedOrders);
    buildFinishedOrdersTable(finishedOrders, "#finishedOrdersTableInjectPoint", today);
  });

  /** listen on the provider's on-hold orders and update the on-hold orders table accordingly **/
  var todaysProviderOnHoldOrdersRef = dbProviderReference.ref('providers/'+provider.displayName+"/"+provider.displayName+'on_hold_orders/'+today);
  todaysProviderOnHoldOrdersRef.on('child_added', function(data){
    updateOrdersArray(data.val(), onHoldOrders);
    buildOrdersTable(onHoldOrders, "#onHoldTableInjectPoint", today);
  });
}

//TODO: do I need this?
// updating an array of orders with the data retrieved from database
// function updateOrders(order, ordersArray){
//   if(ordersArray.length===0){
//     ordersArray.push(order);
//     return ordersArray;
//   }
//   var tempOrdersLength=ordersArray.length;
//   for(var i=0; i<tempOrdersLength; i++){
//     if(ordersArray[i].time > order.time){
//       ordersArray.splice(i, 0, order);
//       return ordersArray;
//     } else if(i+1 == ordersArray.length){
//       ordersArray.push(order);
//       return ordersArray;
//     }
//   }
// }

// tears down all the user's private pages to prevent data leakage
function tearDownUserPages(){
  orders = []; // delete all previousely loaded orders from the array
  provider = null; // current user is now an empty object
  $("td[name='providerTablesInjection']").html("Not Logged In!");
}

// move the chosen order to the finished orders table and notify the client that the order is ready
function finishOrder(index){
  $("#"+orders[index].key).remove();
  var order = orders[index];
  orders.splice(index,1);
  for(var i=index; i<orders.length; i++)
    $("#orderReadyButton"+orders[i].key).attr("onclick","finishOrder("+i+")");

  // Moving the order to the finished orders database
  var updates = {};
  // updates["/providers/"+order.provider+"/"+order.provider+"_orders/"+order.date+"/"+order.userId+"/"+newOrderKey] = order;
  updates["/providers/"+order.provider+"/"+order.provider+"_orders/"+order.date+"/"+order.key] = null;
  updates["/providers/"+order.provider+"/"+order.provider+"_finished_orders/"+order.date+"/"+order.key] = order;
  // updates["/users/"+order.userId+"/"+order.userId+"_ready_orders/"+order.date+"/"+order.key] = order; //TODO: REMOVE THIS - PROVIDER IS NOW ALLOWED TO READ/WRITE THE USERS DATABASE!

  return dbProviderReference.ref().update(updates);
}

// adding a new order object to an array of orders (e.g on-going, finished, history etc...)
function updateOrdersArray(order, arr){
  if(arr.length===0){
    arr.push(order);
    return arr;
  }
  var tempArrLength=arr.length;
  for(var i=0; i<tempArrLength; i++){
    if(arr[i].time > order.time){
      arr.splice(i, 0, order);
      return arr;
    } else if(i+1 == arr.length){
      arr.push(order);
      return arr;
    }
  }
}

// this functions takes a number n and adds a leading zero if n < 10 (to help date formatting)
function addZero(n){
  return n<10? '0'+n:''+n;
}

// updates the current date global variables
// function changeDay(){//TODO: finish this
//   /** update current date variables **/
//   date.setDate(date.getDate() + 1);
//   today =
//    date.getDate()
//    +"_"
//    +(date.getMonth()+1)
//    +"_"
//    +date.getFullYear();
//    orders = []; // delete all previousely loaded orders from the array (this array is refreshed daily)
//    $("td[name='providerPages']").html("Not Logged In");
// }

// build the currentOrdersTable
function buildOrdersTable(ordersArray, injectionPoint, today){
  var tableBuildString = "";
  for(j=0; j<ordersArray.length; j++){
    tableBuildString = tableBuildString
    +'<div id="'+ordersArray[j].key+'">'
    +  '  <table style="width: 100%; border-bottom: thin black; border-top: thin black; border-style:solid;">'
    +     '<tr>'
    +       '<td style="width:50%; color:Black;">Order ID: '+ ordersArray[j].key +'<br><br></td>'
    +       '<td rowspan="2" style="width:50%; color:Black;"><button id="orderReadyButton'+ordersArray[j].key+'" class="button" style="width:100%; height:100%;" onclick="finishOrder('+j+')">Order Is Ready</button></td>'
    +      '</tr>'
    +      '<tr>'
    +       '<td style="width:50%; color:Black;">User ID: '+ordersArray[j].userId+'<br><br></td>'
    +      '</tr>'
    +      '<tr>'
    +       '<td style="width:50%; color:Black;">Time Sent: '+ordersArray[j].time+'<br><br></td>'
    +      '</tr>'
    +      '<tr>'
    +       '<td style="width:50%; color:Black;">'+ordersArray[j].dishTitle+'<br><br></td>'
    +      '</tr>'
    +      '<tr>'
    +       '<td style="width:50%; color:Black;">Ingridients:</td>'
    +      '</tr>'
    +      '<tr>'
    +       '<td style="width:50%; color:#626161;">&nbsp&nbsp&nbsp'+ordersArray[j].dishIngredients.join('<br>&nbsp&nbsp&nbsp')+'<br><br></td>'
    +       '<td rowspan="2" style="width:50%; color:Black;"><button class="button" style="width:100%; height:100%;">Problem With The Order</button></td>'
    +      '</tr>'
    +      '<tr>'
    +       '<td style="width:50%; color:Black;">Notes:</td>'
    +      '</tr>'
    +      '<tr>'
    +       '<td style="width:50%; color:#626161;">&nbsp&nbsp&nbsp'+ordersArray[j].notes+'<br><br></td>'
    +      '</tr>'
    +    '</table>'
    +'</div>'
    ;
    $(injectionPoint).html(tableBuildString);
  }
}

function buildFinishedOrdersTable(ordersArray, injectionPoint, today){
  var tableBuildString = "";
  for(j=0; j<ordersArray.length; j++){
    tableBuildString = tableBuildString
    +'<div id="'+ordersArray[j].key+'_finished_orders">'
    +  '  <table style="width: 100%; border-bottom: thin black; border-top: thin black; border-style:solid;">'
    +     '<tr>'
    +       '<td style="width:50%; color:Black;">Order ID: '+ ordersArray[j].key +'<br><br></td>'
    // +       '<td rowspan="2" style="width:50%; color:Black;"><button id="orderReadyButton'+ordersArray[j].key+'_finished_orders" class="button" style="width:100%; height:100%;" onclick="finishOrder('+j+')">Order Is Ready</button></td>'
    +      '</tr>'
    +      '<tr>'
    +       '<td style="width:50%; color:Black;">User ID: '+ordersArray[j].userId+'<br><br></td>'
    +      '</tr>'
    +      '<tr>'
    +       '<td style="width:50%; color:Black;">Time Sent: '+ordersArray[j].time+'<br><br></td>'
    +      '</tr>'
    +      '<tr>'
    +       '<td style="width:50%; color:Black;">'+ordersArray[j].dishTitle+'<br><br></td>'
    +      '</tr>'
    +      '<tr>'
    +       '<td style="width:50%; color:Black;">Ingridients:</td>'
    +      '</tr>'
    +      '<tr>'
    +       '<td style="width:50%; color:#626161;">&nbsp&nbsp&nbsp'+ordersArray[j].dishIngredients.join('<br>&nbsp&nbsp&nbsp')+'<br><br></td>'
    // +       '<td rowspan="2" style="width:50%; color:Black;"><button class="button" style="width:100%; height:100%;">Problem With The Order</button></td>'
    +      '</tr>'
    +      '<tr>'
    +       '<td style="width:50%; color:Black;">Notes:</td>'
    +      '</tr>'
    +      '<tr>'
    +       '<td style="width:50%; color:#626161;">&nbsp&nbsp&nbsp'+ordersArray[j].notes+'<br><br></td>'
    +      '</tr>'
    +    '</table>'
    +'</div>'
    ;
    $(injectionPoint).html(tableBuildString);
  }
}

function buildOnHoldOrdersTable(ordersArray, injectionPoint, today){
  //TODO: replace this...
  $(injectionPoint).html("No Relevant Data Was Found!");
}


//TODO: Not sure that I need this function, but if I do it should be rebuilt to be more responsive
// building the page that shows the current orders
// function updateOrdersTable(orders, today){
//   console.log("in updateOrdersTable");
//     var curOrderString =
//       '<table id="OrdersTable" style="width:100%; border-color: black; border-style:solid; border-width: thin;">'
//       +'<tr style="width:100%;">'
//       +'<th style="width:100%;">'+today.replace(/_/g, ".")+'</th>'
//       +'</tr>'
//       +'<tr style="width:100%;">'
//       +'<td style="width:100%;">';
//
//     for(j=0; j<orders.length; j++){
//       curOrderString = curOrderString
//       +'<div id="'+orders[j].key+'">'
//       +  '  <table style="width: 100%; border-bottom: thin black; border-top: thin black; border-style:solid;">'
//       +     '<tr>'
//       +       '<td style="width:50%; color:Black;">Order ID: '+ orders[j].key +'<br><br></td>'
//       +       '<td rowspan="2" style="width:50%; color:Black;"><button id="orderReadyButton'+orders[j].key+'" class="button" style="width:100%; height:100%;" onclick="finishOrder('+j+')">Order Is Ready</button></td>'
//       +      '</tr>'
//       +      '<tr>'
//       +       '<td style="width:50%; color:Black;">User ID: '+orders[j].userId+'<br><br></td>'
//       +      '</tr>'
//       +      '<tr>'
//       +       '<td style="width:50%; color:Black;">Time Sent: '+orders[j].time+'<br><br></td>'
//       +      '</tr>'
//       +      '<tr>'
//       +       '<td style="width:50%; color:Black;">'+orders[j].dishTitle+'<br><br></td>'
//       +      '</tr>'
//       +      '<tr>'
//       +       '<td style="width:50%; color:Black;">Ingridients:</td>'
//       +      '</tr>'
//       +      '<tr>'
//       +       '<td style="width:50%; color:#626161;">&nbsp&nbsp&nbsp'+orders[j].dishIngredients.join('<br>&nbsp&nbsp&nbsp')+'<br><br></td>'
//       +       '<td rowspan="2" style="width:50%; color:Black;"><button class="button" style="width:100%; height:100%;">Problem With The Order</button></td>'
//       +      '</tr>'
//       +      '<tr>'
//       +       '<td style="width:50%; color:Black;">Notes:</td>'
//       +      '</tr>'
//       +      '<tr>'
//       +       '<td style="width:50%; color:#626161;">&nbsp&nbsp&nbsp'+orders[j].notes+'<br><br></td>'
//       +      '</tr>'
//       +    '</table>'
//       +'</div>'
//       ;
//   }
//     curOrderString = curOrderString
//     +  '</td>'
//     +  '</tr>'
//     +'</table>';
//   $("#ordersTableTd").html(curOrderString);
// }

/**********END - Auxilary Functions************/

/** Menu-Buttons onclick() methods **/

function showPagesHelper(pageId){
  $('#menu').toggleClass('active');
  $("td[name='providerPages']").hide();
  $("td[name='basicPages']").hide();
  $("#homePageObject").hide();
  $(pageId+"Td").show();
}

//TODO: Is this function neccessary???
function showHomePage(){
  $("td[name='providerPages']").hide();
  $("td[name='basicPages']").hide();
  $("#homePageObject").show();
}

function showLiveOrdersTable(){
  showPagesHelper("#ordersTable");
  if(provider){
    $("#ordersTableDateHeader").html("On Going Orders - "+today.replace(/_/g, '.'));
    buildOrdersTable(orders, "#ordersTableInjectPoint", today);
  } else {
    $("#ordersTableInjectPoint").html("Not Logged In!");
  }
}

//TODO: Is this function neccessary???
function showFinishedOrdersTable(){
  showPagesHelper("#finishedOrdersTable");
  if(provider){
    $("#finishedOrdersTableDateHeader").html("Finished Orders - "+today.replace(/_/g, '.'));
    buildFinishedOrdersTable(finishedOrders, "#finishedOrdersTableInjectPoint", today);
  } else {
    $("#finishedOrdersTableInjectPoint").html("Not Logged In!");
  }
}

function showOnholdOrdersTable(){
  showPagesHelper("#onholdOrdersTable");
  if(provider){
    $("#onholdOrdersTableDateHeader").html("On Hold Orders - "+today.replace(/_/g, '.'));
    buildOnHoldOrdersTable(onHoldOrders, "#onHoldOrdersTableInjectPoint", today);
  } else {
    $("#onHoldOrdersTableInjectPoint").html("Not Logged In!");
  }
}

//TODO: Is this function neccessary???
function showOrdersHistoryTable(){
  showPagesHelper("#ordersHistoryTable");
}

//TODO: Is this function neccessary???
function notifyMissingIngridients(){
  showPagesHelper("#missingIngridientsReport");
}

//TODO: Is this function neccessary???
function showUpdateMyMenuPage(){
  showPagesHelper("#updateMenuScreen");
}

//TODO: Is this function neccessary???
function showSignInPage(){
  showPagesHelper("#signInPage");
}

//TODO: Is this function neccessary???
function showSignupPage(){
  showPagesHelper("#signUpPage");
}
/** END - Menu-Buttons onclick() methods **/


//TODO: REMOVE THIS FUNCTION!!!
function testingMSGS(){
  
}
