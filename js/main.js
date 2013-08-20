;(function($) {
	$(document).ready(function () {
		
		$("#kontroluj").checkForm({
			ajax: true,
			debug: true,
			init: function( opt ) {
				console.log("INIT: Plugin sa spustil");
				// Vlastny option
				// opt['vlastnyOption'] = "Skuska";
				// console.log(opt);
			},
			error: function( numberOfInvalid, IDItemJSON ) {
				console.log('Pocet chybnych elementov: ' + numberOfInvalid);
				console.log(IDItemJSON);
			},
			success: function( value ) {
				console.log(value);
			}
		});

	});
})(jQuery);
