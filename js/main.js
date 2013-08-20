;(function($) {
	$(document).ready(function () {
		
		/*
		 * Cufon
		 * @font-family: Nazov pisma
		 * @hover: true, false
		 */
		//	Cufon.replace('.cufon', {fontFamily: '', hover: true});
		
		;(function() {
			/*
			 * Anonymous function self calling
			 */
			 
			 /*
			  * Vyvolanie fancyboxu
			  */
			$(".fancybox").fancybox();

			$("#kontroluj").checkForm({
				ajax: true,
				debug: false,
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

		})();

	});
})(jQuery);
