// Update the relevant fields with the new data
// Global data

IP = "http://192.173.5.114"
PORT =  "1337"

function setDOMInfo(info) {
  //document.getElementById('total').textContent   = info.total;
  //document.getElementById('inputs').textContent  = info.inputs;
  //document.getElementById('buttons').textContent = info.buttons;
}

// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', function () {
  document.getElementById('pay')
    .addEventListener('click', startPaymentMethod);
  

  // listener for buy
  document.getElementById('buy')
    .addEventListener('click', buyBitCoinsWithINR);


  // listner for price 
  document.getElementById('price')
    .addEventListener('click', checkPrice);
  
  // ...query for the active tab...
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    // ...and send a request for the DOM info...
    chrome.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'DOMInfo'},
        // ...also specifying a callback to be called 
        //    from the receiving end (content script)
        setDOMInfo);
  });
});


function startPaymentMethod(){

    var bitCoins = document.getElementById("amnt").value;
    var address  = document.getElementById("address").value;

    if(bitCoins != "" && address != ""){
      // Get client id and client secret
      // add the hidden elements with the values
      var el = document.getElementById( 'main' );
      el.parentNode.removeChild( el );
      //document.getElementById("main").style.visibility = 'hidden'; 
      getCredentials(bitCoins, address);
      
    }
    else
      alert("Please fill the entries to proceed");
}


function getCredentials(bitCoins, address){
  var div = document.getElementById("credentials");
    div.innerHTML = '<input type="text" class="uno-input uno-border" name="client_id" id="client_id" placeholder="client id" >\
    <br><input type="password" class="uno-input uno-border" name="client_secret" id="client_secret" placeholder="client secret" >\
    <br><input type="text" name="email"  class="uno-input uno-border" id="email" placeholder="email" ><br>\
    <input type="password"  class="uno-input uno-border"  id="pass" name="pass" placeholder="password" ><br>\
    <input type="button" value="submit" id="submit" class="uno-btn uno-blue">';
    
    document.getElementById('submit')
    .addEventListener('click', startVerification);
    

    if(bitCoins && address){
      document.getElementById("data").innerHTML='<input type="hidden" value="" id="bitCoins">\
      <input type="hidden" value="" id="bitaddress">';

      document.getElementById("bitCoins").value = bitCoins;
      document.getElementById("bitaddress").value = address;
    }

}
// buy bit coins from INR
function buyBitCoinsWithINR(){
      var el = document.getElementById( 'main' );
      el.parentNode.removeChild( el );
      //document.getElementById("main").style.visibility = 'hidden'; 
      getCredentials();
  
}


// function to generate access token and further buy item and bit coins
function startVerification(){
    var client_id = document.getElementById("client_id").value;
    var client_secret  = document.getElementById("client_secret").value;
    var email  = document.getElementById("email").value;
    var pass  = document.getElementById("pass").value;
    
    
    try { 
      var bitCoins =  document.getElementById("bitCoins").value;
      var bitaddress = document.getElementById("bitaddress").value;
      var el = "" , e2="";
      el = document.getElementById( 'bitCoins' );
      el.parentNode.removeChild( el );

      e2 = document.getElementById( 'bitaddress' );
      e2.parentNode.removeChild( e2 );

      if(client_id != "" && client_secret != "" && email != "" && pass != "" && bitCoins != "" && bitaddress != ""){
        var OTP = prompt("Please enter OTP sent to mobile", "");
        if (OTP == null) 
          alert("Please restart the app and try again!");      
        else{
          
          var e3 = document.getElementById( 'credentials' );
          e3.parentNode.removeChild( e3 );
          // start the main payment API
          callBuyItemAPI(client_id, client_secret, email, pass, bitCoins, bitaddress, OTP);
        }
      }
      else
        alert("Please fill the entries to proceed");
    }
    catch(err) {
      //alert("catch block started");
      console.log("Buying Bit Coins");
      if(client_id != "" && client_secret != "" && email != "" && pass != "" && bitCoins != "" && bitaddress != ""){
        var OTP = prompt("Please enter OTP sent to mobile", "");
        if (OTP == null) 
          alert("Please restart the app and try again!");      
        else{
          
          var e3 = document.getElementById( 'credentials' );
          e3.parentNode.removeChild( e3 );
          // start the main payment API
          // callButItemAPI(client_id, client_secret, email, pass, bitCoins, bitaddress, OTP);
          callBuyItemAPI(client_id, client_secret, email, pass, "", "", OTP);
        }
      }
      else
        alert("Please fill the entries to proceed");
    }

    
}

function callBuyItemAPI(client_id, client_secret, email, pass, bitCoins, recieverbitaddress, OTP){
    //alert(client_id+" "+client_secret+" "+email+" "+pass+" "+bitCoins+" "+bitaddress +" " + OTP);
    //testing
    if(bitCoins != "" && recieverbitaddress != ""){
        /*
        var client_id="9RW1NF2WNT"
        var client_secret="43f958df-bb48-4385-b59d-9f0bce36c1b1";
        var  email="team50@gmail.com";
        var  pass="3GfnFysy";
        var  bitCoins="0.0002";
        var  recieverbitaddress="32waespAbSj5eoEGnXDciW9pg7hWhtuZt4";
        var  OTP="999999";    //loading image
        */
        
        document.getElementById("data").innerHTML='<img src="loading.gif" id="load" style="width: 295px;">';
        

        // call the API here
        var http = new XMLHttpRequest();
        var url = IP+":"+PORT+"/bit/info";
        var params = "client_id_var="+client_id+"&client_secret_var="+client_secret+"&email_id="+email+"&signinpassword="+pass+"&signinsecpwd="+OTP;
        http.open("POST", url, true);

        //Send the proper header information along with the request
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        http.onreadystatechange = function() {//Call a function when the state changes.
            if(http.readyState == 4 && http.status == 200) {
                var result = JSON.parse(http.responseText);
                var access_token = result.access_token;
                var bal =   result.btc_balance;
                //console.log(bal);
                //console.log(bitCoins);
                if(bal < bitCoins){
                  alert(`you need ${bitCoins-bal} bit coins more`);
                }else{
                  buyItem(access_token, bitCoins, recieverbitaddress);
              }
            }
            else if(http.readyState == 4 && http.status != 200)
              alert("Something went wrong with status "+http.status);
        }
        http.send(params);
    }
    else{
        /*
        var client_id="9RW1NF2WNT"
        var client_secret="43f958df-bb48-4385-b59d-9f0bce36c1b1";
        var  email="team50@gmail.com";
        var  pass="3GfnFysy";
        var  bitCoins="0.0002";
        var  recieverbitaddress="32waespAbSj5eoEGnXDciW9pg7hWhtuZt4";
        var  OTP="999999";    //loading image
        */
        document.getElementById("data").innerHTML='<img src="loading.gif" id="load" style="width: 295px;">';
        

        // call the API here
        var http = new XMLHttpRequest();
        var url = IP+":"+PORT+"/bit/info";
        var params = "client_id_var="+client_id+"&client_secret_var="+client_secret+"&email_id="+email+"&signinpassword="+pass+"&signinsecpwd="+OTP;
        http.open("POST", url, true);

        //Send the proper header information along with the request
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        http.onreadystatechange = function() {//Call a function when the state changes.
            if(http.readyState == 4 && http.status == 200) {
                var result = JSON.parse(http.responseText);
                var access_token = result.access_token;
                var bal =   result.btc_balance;
                document.getElementById("data").innerHTML +='<input type="hidden" value="" id="access_token_auth">';
                document.getElementById("access_token_auth").value = access_token;
                
                var btc = prompt("Enter Number of BTC you want to purchase","");  
                callBuyBitCoin(access_token, btc);
            }
            else if(http.readyState == 4 && http.status != 200)
              alert("Something went wrong with status "+http.status);
        }
        http.send(params);
    }
}
// but btc 
function callBuyBitCoin(access_token, btc){
  //alert("call by btc");
  var http = new XMLHttpRequest();
    var url = IP+":"+PORT+"/bit/buy";
     
    var params = "access_token="+access_token+"&btc="+btc;

    http.open("POST", url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            // var result = JSON.parse(http.responseText);
            // var access_token = result.access_token;
            // var bal =   result.btc_balance;
            // if(bal < bitCoins){
            //   alert(`you need ${bitCoins-bal} bit coins more`);
            // }else{
              var result = JSON.parse(http.responseText);
              var e4 = document.getElementById( 'load' );
              e4.parentNode.removeChild( e4 );
              document.getElementById("data").innerHTML='<p style="padding: 22px;"><b>'+btc+' </b>bitcoin(s) bought successfully.</p>';
              //alert(http.responseText);
              // buyItem(access_token, bitCoins, recieverbitaddress);
          // }
         // document.getElementById("data").innerHTML +='<input type="hidden" value="" id="access_token_auth">';
          //document.getElementById("access_token_auth").value = access_token;
        }
        else if(http.readyState == 4 && http.status != 200)
          alert("Something went wrong with status "+http.status);
    }
    http.send(params);
}
// purchase item using bitcoin
function buyItem(access_token, bitCoins, recieverbitaddress){
    var http = new XMLHttpRequest();
    var url = IP+":"+PORT+"/bit/send";
    var data = {"to_address" : recieverbitaddress, "btcamount" : bitCoins};
    var params = "access_token="+access_token+"&data="+JSON.stringify(data);

    http.open("POST", url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            // var result = JSON.parse(http.responseText);
            // var access_token = result.access_token;
            // var bal =   result.btc_balance;
            // if(bal < bitCoins){
            //   alert(`you need ${bitCoins-bal} bit coins more`);
            // }else{
              var e4 = document.getElementById( 'load' );
              e4.parentNode.removeChild( e4 );
              document.getElementById("data").innerHTML=`<p style="padding: 22px;">Your transaction is submitted with <b>${bitCoins}</b> bit coins  for processing.You can monitor its status through Transaction history table on Send/Recieve bitcoins page</p>`;
              //alert(http.responseText);
              // buyItem(access_token, bitCoins, recieverbitaddress);
          // }
          document.getElementById("data").innerHTML +='<input type="hidden" value="" id="access_token_auth">';
          document.getElementById("access_token_auth").value = access_token;
        }
        else if(http.readyState == 4 && http.status != 200)
          alert("Something went wrong with status "+http.status);
    }
    http.send(params);
}
// check current price
function checkPrice(){
  var e1 = document.getElementById( 'main' );
  if(e1) e1.parentNode.removeChild( e1 );
  var e2 = document.getElementById( 'credentials' );
  if(e2) e2.parentNode.removeChild( e2 );
  
  
  if(document.getElementById("access_token_auth").value != "")
    callPriceAPI(document.getElementById("access_token_auth").value);
  else
    alert("First Login To get the Access Token");
  // calling price api
   
}


// call price API
function callPriceAPI(access_token){
    //alert("callPriceAPI");
    var http = new XMLHttpRequest();
    var url = IP+":"+PORT+"/bit/price";
    var params = "access_token="+access_token+"&btc=0.5";

    http.open("POST", url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            // var result = JSON.parse(http.responseText);
            // var access_token = result.access_token;
            // var bal =   result.btc_balance;
            // if(bal < bitCoins){
            //   alert(`you need ${bitCoins-bal} bit coins more`);
            // }else{
              //alert(http.responseText);
              var result = JSON.parse(http.responseText);
              var bPrice = result.buybtc;
              var sPrice = result.sellbtc;

              document.getElementById("data").innerHTML ='<div style="padding: 21px;"><b>Buying BitCoin Price:'+bPrice+'</br>';
              document.getElementById("data").innerHTML +='<b style="padding: 23px;">Selling BitCoin Price:'+sPrice+"</div>";
              
              //alert(http.responseText);
              // buyItem(access_token, bitCoins, recieverbitaddress);
          // }
        }
        else if(http.readyState == 4 && http.status != 200)
          alert("Something went wrong with status "+http.status);
    }
    http.send(params);
}

