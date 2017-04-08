function getAccessToken(client_id_var, client_secret_var){
	$.post( 
		"https://sandbox.unocoin.co/oauth/token", 
		{ 
			client_id : client_id_var, 
			client_secret : client_secret_var, 
			grant_type = "all" ,
			access_lifetime = "7200"
		})
  	.done(function( data ) {
    	alert( "Data Loaded: " + data );
  	});
}