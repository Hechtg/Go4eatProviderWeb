// dynamic menu functions
var orders = []; //this is a global variable that holds all the current unfinished orders
var history = []; //this is a global variable that holds all history (only finished orders from today and from previous days)

$(document).ready(function() {
  $('body').addClass('js');
  var $menu = $('#menu'),
    $menulink = $('.menu-link');

  $menulink.click(function() {
    $menulink.toggleClass('active');
    $menu.toggleClass('active');
    return false;
  });
  var providerName = "karnaf" //TODO: change to a dynamic value
  var today = new Date();
  today = today.getDate()+"_"+(today.getMonth()+1)+"_"+today.getFullYear();
  var ordersRef = firebase.database().ref('providers/'+providerName+"/"+providerName+'_orders/'+today);
  ordersRef.on('child_added', function(data){
    updateOrders(data.val());
    updateOrdersTable(orders, today);
  });
});

function updateOrdersTable(orders, today){
    var curOrderString =
      '<table id="OrdersTable" style="width:100%; border-color: black; border-style:solid; border-width: thin;">'
      +'<tr style="width:100%;">'
      +'<th style="width:100%;">'+today.replace(/_/g, ".")+'</th>'
      +'</tr>'
      +'<tr style="width:100%;">'
      +'<td style="width:100%;">';

    for(j=0; j<orders.length; j++){
      curOrderString = curOrderString
      +'<div>'
      +  '  <table style="width: 100%; border-bottom: thin black; border-top: thin black; border-style:solid;">'
      +     '<tr>'
      +       '<td style="width:50%; color:Black;">Order Details:<br><br></td>'
      +       '<td rowspan="2" style="width:50%; color:Black;"><button class="button" style="width:100%; height:100%;">Order Is Ready</button></td>'
      +      '</tr>'
      +      '<tr>'
      +       '<td style="width:50%; color:Black;">User ID: '+orders[j].userId+'<br><br></td>'
      +      '</tr>'
      +      '<tr>'
      +       '<td style="width:50%; color:Black;">Time Sent: '+orders[j].time+'<br><br></td>'
      +      '</tr>'
      +      '<tr>'
      +       '<td style="width:50%; color:Black;">'+orders[j].dishTitle+'<br><br></td>'
      +      '</tr>'
      +      '<tr>'
      +       '<td style="width:50%; color:Black;">Ingridients:</td>'
      +      '</tr>'
      +      '<tr>'
      +       '<td style="width:50%; color:#626161;">&nbsp&nbsp&nbsp'+orders[j].dishIngredients.join('<br>&nbsp&nbsp&nbsp')+'<br><br></td>'
      +       '<td rowspan="2" style="width:50%; color:Black;"><button class="button" style="width:100%; height:100%;">Problem With The Order</button></td>'
      +      '</tr>'
      +      '<tr>'
      +       '<td style="width:50%; color:Black;">Notes:</td>'
      +      '</tr>'
      +      '<tr>'
      +       '<td style="width:50%; color:#626161;">&nbsp&nbsp&nbsp'+orders[j].notes+'<br><br></td>'
      +      '</tr>'
      +    '</table>'
      +'</div>'
      ;
  }
    curOrderString = curOrderString
    +  '</td>'
    +  '</tr>'
    +'</table>';
  // document.getElementById("todaysOrdersTable").innerHTML=curOrderString;
  $("#todaysOrdersTable").html(curOrderString);
}

function showHomePage(){
  $("td[name='providerPages']").hide();
  $("#homePageObject").show();
}

function showLiveOrdersTable(){
  $("td[name='providerPages']").hide();
  $("#todaysOrdersTable").show();
}

function showOnholdOrdersTable(){
  $("td[name='providerPages']").hide();
  $("#onholdOrdersTable").show();
}

function showFinishedOrdersTable(){
  $("td[name='providerPages']").hide();
  $("#finishedOrdersTable").show();
}

function showOrdersHistoryTable(){
  $("td[name='providerPages']").hide();
  $("#ordersHistoryTable").show();
}

function notifyMissingIngridients(){
  $("td[name='providerPages']").hide();
  $("#missingIngridientsReport").show();
}

function showUpdateMyMenuPage(){
  $("td[name='providerPages']").hide();
  $("#updateMenuScreen").show();
}


/**********Auxilary Functions************/

// Updating an array of orders with the data retrieved from database
function updateOrders(order){
  if(orders.length===0){
    orders.push(order);
    return orders;
  }
  var tempOrdersLength=orders.length;
  for(var i=0; i<tempOrdersLength; i++){
    if(orders[i].time > order.time){
      orders.splice(i, 0, order);
      return orders;
    } else if(i+1 == orders.length){
      orders.push(order);
      return orders;
    }
  }
}
