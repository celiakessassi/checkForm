/*!
 * chceckFrom, Adam Mikó
 * version: 1.5.0 (28.08.2013)
 * @requires jQuery v1.9+
 *
 * http://opensource.org/licenses/MIT
 */
;(function ( $, window, document, undefined ) {

	// Meno pluginu
	var pluginName  = "checkForm",		// Nazov pluginu
		checkInputs = $('input, textarea, select')
						.not(':input[type=button], :input[type=submit], :input[type=reset]'),
		defaults    = {
			setAttr:    "data-check",   // Default, oznacenie elementu na kontrolu
			setGroup: 	"data-group",	// Default, oznacenie skupiny elementov na kontrolu
			setMsg: 	"data-msg",		// Default, oznacenie na chybovu hlasku
			errorClass: "errInput",     // Class pre error inputy
			ajax:       false,          // Odosielanie ajaxom, stopne post
			debug:      false           // Vypisuje v konzole hodnoty premennych
		},
		runError,
		item = {},						// Objekt s nazvami inputov a ich hodnotami
		IDItem = {};					// Objekt s nazvami inputov a ich IDckami

	// Konstruktor pluginu
	function Plugin( element, options, callback ) {
		this.element = element;
		this.options = $.extend({

			init: 	 function() {},  // Zavola sa pri starte pluginu
			error:   function() {},  // Zavola ak chyba = true
			success: function() {}   // Zavola ak chyba = false

		}, defaults, options, callback );

		this._defaults = defaults;
		this._name = pluginName;

		// Volanie prototype
		this.checkInputs(element, options, defaults);

		// Ak sa pri spusteni nevyskytol error plugin pokracuje
		if( !runError ) {
			this.init(element, options);
			this.setRandomId(element, options);
		}
	}

	Plugin.prototype = {

		/**
		 *	init
		 *
		 *	Vykonava sa pred startom pluginu
		 *
		 *	@param el: Element this
		 *	@param option: Volania pluginu
		 */
		init: function( el, options ) {

			// Inicializacia pluginu
			// Uz je pristup k elementom DOM
			// Mozu sa pridavat dalsie funkcie
			// Volby cez instanciu this.element a this.options

			// Vola sa pri starte pluginu
			if( options.init != null )
				options.init.call( this, options );
		},

		/*
		 *	setRandomId
		 *
		 *	Vracia nahodne generovane cislo pre lepsiu identifikaciu
		 *
		 *	@param el: Element this
		 *	@param option: Volania pluginu
		 */
		setRandomId: function( el, options ) {

			var generate = pluginName+"_",
				lengthString = 15,
				charArray = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
				i;

			for( i = 0; i < lengthString; i++ )
				generate += charArray.charAt(Math.floor(Math.random() * charArray.length));

			return $(el).data('data-id', generate);
		},

		/**
		 *	checkInputs
		 *
		 *	Kontroluje ci maju atribut setAttr spravne elementy
		 *	Success: input, textarea, select
		 *
		 *	@param el: Element this
		 *	@param option: Volania pluginu
		 *	@param defaults: Nastavenia pluginu
		 */
		checkInputs: function( el, options, defaults ) {

			var self = $(el);

			// najde vsetky elementu s atributom setAttr a nasledne ich prejde
			self.find("["+defaults.setAttr+"]").each(function( index, element ) {

				var element = $(element);

				if( element.is(defaults.checkInputs) ) {
					window.alert("Zadané nesprávne elementy na kontrolu, plugin sa nespusti");

					// Prida formu data-run = false, cim neumozni start pluginu
					self.data("data-run", false);
				}
			});

			// Ak sa nasla chyba, prida atribut data-run pre ukoncenie behu pluginu
			if( runError ) {
				self.data("data-run", false);
			}
			else {
				self.data("data-run", true);
			}

		}
	};

	/**
	 *	validate()
	 *
	 *	kontroluje dlzku value v elemente a chybovu hlasku
	 *
	 *	@param message: Chybova hlaska elementu
	 */
	$.fn.validate = function( message ) {
		var returnBool = false;

		if ( this.val().length <= 0 || this.val() == message ) {
			returnBool = true;
		}

		// false alebo true
		return returnBool;
	};

	/**
	 *	TELO PLUGINU
	 *
	 *	@param option: Nastavenia pluginu
	 *	@param cellback: Spatne volania pluginu
	 */
	$.fn[pluginName] = function( options, callback ) {

		// Vracia kod
		return this.each(function() {

			// Ak form nema name generuje novy plugin
			if( !$.data(this, "plugin_" + pluginName) )
				 $.data(this, "plugin_" + pluginName, new Plugin( this, options ));

			// Ak sa nasla chyba pri spustani pluginu, ukonci sa
			if( !$(this).data("data-run") )
				 return false;			

			/**
			 *	getCheckInputs
			 *
			 * 	Funkcia vrati kontrolu inputov
			 *
			 *	@param t_form: cely element form
			 *	@param t_event: event submitu
			 */
			function getCheckInputs( t_form, t_event ) {

				var returnCheckGroup = null;

				// Ak je povoleny debug mod
				if( options.debug )
					console.log(t_form);

				t_form.find("["+defaults.setGroup+"]").each(function( index, t_el ) {

					// TODO: zatial som nenasiel vyuzitie :D
					// var groupName = $(t_el).data("group").group;
					var groupMin  = $(t_el).data("group").min;

					// Prehaldava elementy v skupine
					returnCheckGroup = getCheckGroupElements( t_el, groupMin );
				});

				getCheckElemets( t_form, returnCheckGroup, t_event );
			};

			/*
			 * Funkcia kontroluje elementy vo forme
			 * @t_form: cely element form
			 * @returnCheckGroup: vracia ci vznikla pri kontrole grup chyba
			 * @gCh_event: event submitu
			 */
			function getCheckElemets( t_form, returnCheckGroup, gCh_event ) {

				var checkError       = false;
				var emailPattern 	 = new RegExp("^[_a-zA-Z0-9\.\-]+@[_a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,4}$");
				var numberOfInvalids = 0;

				// TODO: spravit kontrolu elementov
				t_form.find('td').not( "["+defaults.setGroup+"]" ).each( function( index, element ) {

					var element = $(element);
					
					element.find(checkInputs).each(function( inex, input_el ) {

						// Element this
						var input_el = $(input_el);

						// JSON string, uklada do premennych name inputu a hodnotu
						var itemName  = input_el.attr("name");
						var itemValue = input_el.val();

						// Odstrani prazdne znaky z inputu
						input_el.val( $.trim(input_el.val()) );

						// Ulozi do premennej atribut data-msg
						var dataMsg = input_el.attr(defaults.setMsg);

						// Kontrola podla hodnoty atributu
						if( input_el.attr(defaults.setAttr) != "" && input_el.attr(defaults.setAttr) != undefined ) {

							// Podla nazvu hodnoty v atribute defaults.setAttr
							switch( input_el.attr(defaults.setAttr) ) {

								// data-check="true"
								case "true":

									var idElement = input_el.attr('id');

									// Ak je element :text, :password, textarea a kontrola SKONCI chybou
									if( input_el.is(":text, :password, textarea") && input_el.validate(dataMsg) ) {

										// Ak je hodnota v dataMsg vypise sa do value inputu
										if( dataMsg != "" )
											input_el.val(dataMsg);

										// Pridava class inputu pri chybe
										input_el.addClass(defaults.errorClass);

										// Pripocita chybny input k celkovemu poctu
										numberOfInvalids += 1;

										// Nastavi premennu na chybu, neumozni pluginu pokracovat v success
										checkError = true;

										// Prida idcko chybneho elementu ak existuje
										if( idElement == undefined ) {
											IDItem[itemName] = 'Nebolo nájdene žiadne ID';
										}
										else {
											IDItem[itemName] = idElement;
										}
									}

									// Ak je element :text, :password, textarea a kontrola NESKONCI chybou
									else if( input_el.is(":text, :password, textarea") && !input_el.validate(dataMsg) ) {
										input_el.removeClass(defaults.errorClass);
									}

									// Ak je element select alebo :file a kontrola SKONCI chybou
									else if( input_el.is("select, :file") && input_el.val() == "" ) {

										// Pridava class inputu pri chybe
										input_el.addClass(defaults.errorClass);

										// Pripocita chybny input k celkovemu poctu
										numberOfInvalids += 1;

										// Nastavi premennu na chybu, neumozni pluginu pokracovat v success
										checkError = true;

										// Prida idcko chybneho elementu ak existuje
										if( idElement == "" ) {
											IDItem[itemName] = 'Nebolo nájdene žiadne ID';
										}
										else {
											IDItem[itemName] = idElement;
										}
									}

									// Ak je element :checkbox a kontrola SKONCI chybou
									else if( input_el.is(":checkbox") && !input_el.prop('checked') ) {

										// Pridava class labelu s rovnakym ID pri chybe
										$('label[for="' + idElement + '"]').addClass(defaults.errorClass);

										// Pripocita chybny input k celkovemu poctu
										numberOfInvalids += 1;

										// Nastavi premennu na chybu, neumozni pluginu pokracovat v success
										checkError = true;

										// Prida idcko chybneho elementu ak existuje
										if( idElement == undefined ) {
											IDItem[itemName] = 'Nebolo nájdene žiadne ID';
										}
										else {
											IDItem[itemName] = idElement;
										}
									}

									// Ak je element :checkbox a kontrola NESKONCI chybou
									else if( input_el.is(":checkbox") && input_el.prop('checked') ) {

										// Odstrani class elementu
										$('label[for="' + idElement + '"]').removeClass(defaults.errorClass);
									}

								break;

								// data-check="email"
								case "email":

									// Ak je element :text
									if( input_el.is(":text") ) {

										// Ak hodnota nesedi s regexpom, kontrola KONCI chybou
										if( !emailPattern.test(input_el.val()) || input_el.val() == dataMsg ) {

											// Ak je hodnota v dataMsg vypise sa do value inputu
											if( dataMsg != "" )
												input_el.val(dataMsg);

											// Pridava class inputu pri chybe
											input_el.addClass(defaults.errorClass);

											// Pripocita chybny input k celkovemu poctu
											numberOfInvalids += 1;

											// Nastavi premennu na chybu, neumozni pluginu pokracovat v success
											checkError = true;

											// Prida idcko chybneho elementu ak existuje
											if( idElement == undefined ) {
												IDItem[itemName] = 'Nebolo nájdene žiadne ID';
											}
											else {
												IDItem[itemName] = idElement;
											}
										}
										// Kontrola NEKONCI chybou
										else {
											input_el.removeClass(defaults.errorClass);
										}
									}

									// Ak element nieje :text
									else {
										window.alert("Email môže mať len input type: text\n(ID: "
											+ input_el.attr("id") + ",element: " + input_el[0].tagName+")");

										// Pripocita chybny input k celkovemu poctu
										numberOfInvalids += 1;

										// Nastavi premennu na chybu, neumozni pluginu pokracovat v success
										checkError = true;
									}
								break;

								// Vlastny regexp
								default:

									// Ak je element :text, textarea
									if( input_el.is(":text, textarea") ) {

										// Vlastny pattern v atribute setAttr
										var manualPattern = new RegExp(input_el.attr(defaults.setAttr));

										// Ak kontrola paternu konci chybou
										if( !manualPattern.test( input_el.val() ) || input_el.val() == dataMsg ) {

											// Ak je hodnota v dataMsg vypise sa do value inputu
											if( dataMsg != "" )
												input_el.val(dataMsg);

											// Pridava class inputu pri chybe
											input_el.addClass(defaults.errorClass);

											// Pripocita chybny input k celkovemu poctu
											numberOfInvalids += 1;

											// Nastavi premennu na chybu, neumozni pluginu pokracovat v success
											checkError = true;

											// Prida idcko chybneho elementu ak existuje
											if( idElement == undefined ) {
												IDItem[itemName] = 'Nebolo nájdene žiadne ID';
											}
											else {
												IDItem[itemName] = idElement;
											}
										}

										// Ak kontrola nekonci chybou
										else {
											input_el.removeClass(defaults.errorClass);
										}
									}

									// Ak element nieje :text, textarea
									else {
										window.alert("Vlastný regexp môžu mať len inputy type: text\nID chybného inputu: "+input_el.attr("id"));

										// Pripocita chybny input k celkovemu poctu
										numberOfInvalids += 1;

										// Nastavi premennu na chybu, neumozni pluginu pokracovat v success
										checkError = true;
									}
								break;
							}
						}

						// Ak je povoleny debug mod
						if( options.debug ) {
							console.log( itemName, ": " + input_el.val() );
							console.log( itemName + ' errMsg: ' + dataMsg );
						}

						// Prida do objektu element name a hodnotu ak kontrola neskocila chybou
						// pre lahke odoslanie JSONom napriklad
						item[itemName] = itemValue;
					});
				});
				
				// Ak vrati chybu kontrolovanie grupy a elementov
				if( returnCheckGroup && checkError ) {

					setCheckError( gCh_event, numberOfInvalids, IDItem );
				}

				// Ak vrati chybu kontrolovanie grupy alebo elementov
				else if( returnCheckGroup || checkError ) {

					setCheckError( gCh_event, numberOfInvalids, IDItem );
				}

				// Ak kontrolovanie prejde bez chyby
				else {

					setCheckAccept( gCh_event, item )
				}
			};

			/*
			 * Funkcia na kontrolovanie elementov v skupe
			 * @el: element s data-group
			 * @groupMin: minimalny pocet elementov na kontrolu
			 */
			function getCheckGroupElements( el, groupMin ) {

				var countCheck = 0;
				var checkError = false;

				$(el).find(checkInputs).each(function( index, group_el ) {

					// Ak je nastavena kontrola manualne
					if( $(el).data('group').check == "manual" ) {

						// Ak je input checkbox a ma atribut setAttr
						if( $(group_el).is(':checkbox') && $(group_el).attr(defaults.setAttr) ) {

							// TODO: nejako vymysliet kontrolu elementov v skupine :-/
							var isChecked  = $(group_el).prop('checked');

							// Ak je element checked pipocita cislo
							if( isChecked ) {
								var itemName   = $(group_el).attr("name");
								item[itemName] = isChecked;
								++countCheck;
							}
						}
					}
					// Ak je nastavena kontrola na vsetky inputy
					else if( $(el).data('group').check == "all" ) {

						if( $(group_el).is(':checkbox') ) {

							var isChecked  = $(group_el).prop('checked');

							// Ak je element checked pipocita cislo
							if( isChecked ) {
								var itemName   = $(group_el).attr("name");
								item[itemName] = isChecked;
								++countCheck;
							}
						}
					}
				});

				// Ak je checked menej ako je minimum vrati chybu
				if( countCheck < groupMin  )
					checkError = true;

				return checkError;
			};

			/*
			 * Funkcia chyba pri kontrole
			 * @sCh_event: event submitu
			 * @numberOfInvalids: pocet chybnych elementov
			 */
			function setCheckError( sCh_event, numberOfInvalids, IDItemJSON ) {

				if( options.error != null )
					options.error.call( this, numberOfInvalids, IDItemJSON );

				sCh_event.preventDefault();
			};

			/*
			 * Funkcia ak nenastala chyba
			 * @sCh_event: cely element form
			 * @itemJSON:  JSON format skontrolovanych inputov
			 * 			   Funguje ak sa formular skontroloval uspesne
			 *			   Da sa zobrazit pri callbacku
			 */
			function setCheckAccept( sCh_event, itemJSON ) {

				// Ak ajax = true, stopuje post
				if( options.ajax )
					sCh_event.preventDefault();

				if( options.success != null )
					options.checkSuccess.call( this, itemJSON );

				// Vymazava error class
				$("."+defaults.errorClass).removeClass(defaults.errorClass);
			};


			// Odoslanie formularu
			$(this).on("submit", function( event ) {
				var self = $(this);
				var tEvent = event;

				getCheckInputs(self, tEvent);
			});
		});
	}
})( jQuery, window, document );
