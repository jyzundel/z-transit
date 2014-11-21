paper.install(window);

$( function() {

	// Status trackers
	var sFactories = new Object(); // Status tracker for factories
	sVehicles = new Object(); // Status tracker for vehicles
	var sScore = 100; // Status tracker for score
	var sCity; // Where is the city?

	
	//
	//
	// Canvas setup
	//
	//

	var canvas = document.getElementById( "canvas" );
    canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	paper.setup( "canvas" ); // Paper.js project and view

    var cxt = canvas.getContext( "2d" );

	// view.viewSize = new Size( canvas.width, canvas.height );

	sCity = {
		x: canvas.width / 2,
		y: canvas.height / 2
	};

    // FUTURE: Resize the canvas to fill browser window dynamically


	//
	//
	// Initial setup
	//
	//
	window.onload = function() {
		sCity.obj = gImages.city.place();
		sCity.obj;
		sCity.obj.position = new Point( sCity.x, sCity.y );

        fCreate( true );
		fCreate( true );
		vCreate( true );

		sCity.obj.bringToFront();

		console.log( "Loaded" );
		console.log( "View size: " + view.size );

		view.update();
    };

    // Import the SVG paths for the sprites
    var gImages = {
		city: new Symbol( project.importSVG( document.getElementById( "city-svg" ) ) ),
		factory: new Symbol( project.importSVG( document.getElementById( "factory-svg" ) ) ),
		vehicle: new Symbol( project.importSVG( document.getElementById( "vehicle-svg" ) ) ),
		vehicleR: new Symbol( project.importSVG( document.getElementById( "vehicleR-svg" ) ) )
	};

	// Hide the actual SVG elements
	$( "#city-svg" ).hide();
	$( "#factory-svg" ).hide();
	$( "#vehicle-svg" ).hide();
	$( "#vehicleR-svg" ).hide();


    //
    //
    // For each frame, draw any active vehicle movement
    //
    //
	view.onFrame = function( event ) {
    	$.each( sVehicles, function( k, v ){
			// console.log( "SEND: Vehicle " + v.num + " busy: " + v.busy );
			if ( v.busy === true && v.obj ){
				var dest = v.road.getPointAt( v.tracker.progressbar( "value" ) * ( v.road.length / 100 ) );
				// console.log( "dest.x: " + dest.x + ", obj x: " + v.obj.position.x );

				var xNew = dest.x - v.obj.position.x;
				var yNew = dest.y - v.obj.position.y;

				if ( xNew === 0 && yNew === 0 ) {
					return;
				}

				vector = new Point( xNew, yNew );
				v.obj.position = new Point( v.obj.position.x + vector.x, v.obj.position.y + vector.y );

			}
		});

		view.update;
    }
    

	//
	//
	// Event triggers
	//
	//
	$( "#restart" ).click( function(){ location.reload() } );
	$( "#addFactory" ).click( fCreate );
	$( "#addTruck" ).click( vCreate );
	$( ".factory-status" ).click( function() { fToggle( $( this ).parent().attr("id").slice(7) ); } );
	$( ".send" ).click( fSend );
	$( "#showHide" ).click( function(){
		if ( $( "#magicmonitor" ).is( ":visible" ) ) {
			$( this ).html( "Show Monitor" );
			$( "#magicmonitor" ).slideUp();
		} else {
			$( this ).html( "Hide Monitor" );
			$( "#magicmonitor" ).slideDown();
		}
	});


	//
	//
	// Creation functions
	//
	//

	// Add a vehicle to the inventory
	function vCreate( free ) {
		if ( free ) {
			console.log( "Yay, free vehicle!" );
		} else if ( sScore < 10 ){
			alert( "Not enough points!" );
			return;
		} else {
			sScore = parseInt( sScore ) - 10;
			$( "#score" ).html( sScore );
		}

		var $a = $( "#tAvail" );
		var $c = $( "#tCount" );

		var vehicleAvail = parseInt( $a.html() );
		var vNum = parseInt( $c.html() );

		$c.html( vNum + 1 );
		$a.html( vehicleAvail + 1 );
		sVehicles[vNum] = new Object();
		sVehicles[vNum] = {
			num: ( Object.keys(sVehicles).length - 1 ),
			busy: false,
			tracker: null,
			capacity: 6,
			cargo: 0,
			speed: 1
		};

		// console.log( "Vehicle count: " + Object.keys(sVehicles).length );
	}

	// Add a factory
	function fCreate( free ) {
		// Check for free factory, and create if true
		if ( free === true ) {
			console.log( "Yay, free factory!" );

			// Determine size of canvas and assign random coordinates in the top half
			var loc = {
				x: Math.max( 1, Math.floor( ( canvas.width - 40 ) * Math.random() ) ),
				y: Math.max( 61, Math.floor( ( canvas.height / 2 ) * Math.random() ) )
			};
			// console.log( "Random location x: " + loc.x + ", y: " + loc.y );
			fFinalize( loc );
			return;
		} else if ( sScore < 100 ){
			alert( "Not enough points!" );
			return;
		} else {
			sScore = parseInt( sScore ) - 100;
			$( "#score" ).html( sScore );
		}

		// Hide elements, focus on the canvas so that placement is unobstructed
		$( "#magicmonitor" ).slideUp();
		$( "#canvas" ).toggleClass( "cursor-active" );

		// Add listener to canvas element
		canvas.addEventListener( "click", fCheckPosition );
	}

	// Verify and return canvas coordinates for new factory
	function fCheckPosition () {
		// Get clicked coordinates
		var loc = {
			x: window.event.pageX,
			y: window.event.pageY
		};

		console.log( "Completed: x at " + loc.x + ", y at " + loc.y );

		// Restore visibility to the hidden elements
		$( "#magicmonitor" ).slideDown();
		$( "#canvas" ).toggleClass( "cursor-active" );

		// Create the actual factory
		fFinalize( loc );

		// Remove the event listener from canvas
		canvas.removeEventListener( "click", fCheckPosition );
	}

	// Finalize factory creation by actually creating the factory object, using location pass in or click position
	function fFinalize ( loc ) {
		// Make sure location actually gets passed!
		// ...skipping this for now

		// console.log( "Location give as x: " + loc.x + ", y: " + loc.y );

		// Clone the prototype element
		$( "#factoryPrototype" ).clone(true, true).appendTo( $( "#factoryspace" ) );

		// Determine which number of factory this is
		var factNum = ( $( ".factory" ).length - 1 );
		var $fNew = $( "#factoryspace > div:last" ).attr( "id", "factory" + factNum );
		$fNew.find( $( ".factory-title" ) ).html( "Factory " + factNum );
		
		// Create the actual factory object
		sFactories[factNum] = new Object();
		sFactories[factNum] = {
			num: factNum,
			goods: 0,
			capacity: 15,
			location: loc
		};

		// Draw the road in the view
		sFactories[factNum].roadToRome = new Path.Line( 
			new Point( sFactories[factNum].location.x, sFactories[factNum].location.y ),
			new Point( sCity.x, sCity.y ) );
		sFactories[factNum].roadToRome.strokeColor = '#dedede';

		// Draw the factory in the view
		sFactories[factNum].obj = gImages.factory.place();
		// sFactories[factNum].obj.style.fillColor = "#c75320";
		sFactories[factNum].obj.position = new Point( sFactories[factNum].location.x, sFactories[factNum].location.y );
		console.log( "Distance from factory " + sFactories[factNum].num + " to city: " + sFactories[factNum].roadToRome.length );

		console.log( "Factory " + sFactories[factNum].num + " created: " + sFactories[factNum].goods + " goods, " + sFactories[factNum].capacity + " capacity, " + sFactories[factNum].location.x + " x, and " + sFactories[factNum].location.y + " y." )

		// Create the jQuery UI element that displays factory production
		var storageBar = $fNew.find( $( "div.factory-storage" ) );
		storageBar.progressbar({
			value: 0,
			max: sFactories[factNum].capacity
		});
	}


	//
	//
	// Factory manipulation, both implicit and explicit
	//
	//

	// Toggle a factory on or off
	function fToggle( factory, onoff ) {
		// console.log( "Toggle called on Factory: " + factory );

		var $f = $( "#factory" + factory );
		var $p = $f.find( $( ".factory-status" ) );
		var status = $p.html();

		if ( onoff === "on" ) {
			// Turn on factory, explicit
			if ( $p.hasClass( "off" ) ) {
				$p.removeClass( "off" );
				$p.html( "Turn Off" );
				// console.log( "Factory " + factory + " is now ON, via explicit call." );
				fProduce( factory );
			} else {
				console.log( "Factory is already on!" );
			}
		} else if ( onoff === "off" ) {
			// Turn off factory, explicit
			if ( $p.hasClass( "off" ) ){
				console.log( "Factory is already off!" );
			} else {
				$p.addClass( "off" );
				$p.html( "Turn On" );
				clearTimeout(sFactories[factory].clearance);
				sFactories[factory].clearance = null;
				// console.log( "Factory " + factory + " is now OFF, via explicit call." );
			}
		} else {
			// Toggle factory status, implicit
			$p.toggleClass("off");

			if ( $p.hasClass( "off" ) ) {
				$p.html("Turn On");
				clearTimeout(sFactories[factory].clearance);
				sFactories[factory].clearance = null;
				// console.log( "Factory " + factory + " is now OFF, via implicit call." );
			}
			else {
				$p.html("Turn Off");
				// console.log( "Factory " + factory + " is now ON, via implicit call." );
				fProduce( factory ); //$f.find( $( "div.factory-storage" ) ), 
			}
		}
	}

	// Factory production
	function fProduce( factory ) {
		// console.log( "Starting production of an item for Factory " + factory );

		sFactories[factory].tracker = $( "#factory" + factory ).find( $( "div.factory-storage" ) );

		if ( sFactories[factory].goods < sFactories[factory].capacity ){
			sFactories[factory].goods = sFactories[factory].goods + 1;
			sFactories[factory].tracker.progressbar( "value", sFactories[factory].goods );
			
			// console.log( "Production of one item for Factory " + factory + " successful!" );
			sFactories[factory].clearance = setTimeout( function(){ fProduce( factory ) }, 3000 );
			
			// console.log( "Factory goods: " + sFactories[factory].goods );
			// console.log( "Factory capacity: " + sFactories[factory].capacity );
			return;
		} else {
			console.log( "Factory storage full for Factory " + factory + "!" )
			fToggle( factory, "off" );
		}
	}

	// Factory sending goods
	function fSend() {
		var $f = $( this ).parent();
		var factNum = $f.attr("id").slice(7);

		if ( sFactories[factNum].goods === 0 ){
			console.log( "No goods to send!" );
			return;
		}

		var $a = $( "#tAvail" );
		var vehicleAvail = parseInt( $a.html() );

		if ( parseInt( vehicleAvail ) === 0 ) {
			console.log( "SEND: Summoned a truck. None came." );
			return;
		} else {
			// console.log( "SEND: Trucks available! Summoning..." );
			$a.html( vehicleAvail - 1 );
		}

		// Find a vehicle that's not busy, then trigger delivery with that vehicle
		$.each( sVehicles, function( k, v ){
			// console.log( "SEND: Vehicle " + v.num + " busy: " + v.busy );
			if ( v.busy === true ){
				// console.log( "SEND: Vehicle " + k + " is busy. Calling the next truck..." );
			} else {
				// console.log( "SEND: Found a vehicle..." );
				vDeliver( v, sFactories[factNum] );
				return false;
			}
		});
	}


	//
	//
	// Vehicle manipulation, both implicit and explicit
	//
	//

	// When a vehicle is summoned, initialize related elements on screen
	function vInit( vehicle ) {
		console.log( "INIT: Vehicle " + vehicle.num + " is available! It's on the way..." );
		// console.log( "INIT: Vehicle " + vehicle.num + " busy: " + vehicle.busy );
		vehicle.busy = true;
		// console.log( "INIT: Vehicle " + vehicle.num + " busy: " + vehicle.busy );
		// console.log( "INIT: Vehicle " + vehicle.num + " initialization started..." );

		// Create the div for the truck progress bar
		$( "#truckspace" ).append( "<div class='truck'></div>" );
		vehicle.tracker = $( ".truck" ).filter( ":last" ).attr( "id", ( "vehicle" + vehicle.num ) );
		vehicle.tracker.progressbar({
			value: 0,
			max: 100
		});

		// vMovement( vehicle );

		// console.log( "INIT: Vehicle " + vehicle.num + " initialized." );
	}

	// Once a vehicle has finished delivering goods, return it to available vehicles
	function vPark( vehicle ) {
		// Park the vehicle (i.e. destroy tracker, add avail quant)
		console.log( "PARK: Vehicle " + vehicle.num + " told to park." );
		
		// Destroy the progrss bar
		var $v = vehicle.tracker;
		$v.remove();

		vehicle.obj.remove();

		// Set the vehicle as not busy
		vehicle.busy = false;
		vehicle.tracker = null;
		vehicle.cargo = 0;

		// console.log( "PARK: Vehicle " + vehicle.num + " busy: " + vehicle.busy );
		// console.log( "PARK: Vehicle " + vehicle.num + " cargo: " + vehicle.cargo );

		// Increment the available vehicle display
		// console.log( "PARK: Vehicle " + vehicle.num + " on it's way back to garage." );
		setTimeout( function(){ $( "#tAvail" ).html( parseInt( $( "#tAvail" ).html() ) + 1 ) }, 3000 );
	}

	// Track the vehicle's progress in delivering goods
	function vProgress( vehicle ) {
		var clearProg;
		var $v = vehicle.tracker;
		var val = $v.progressbar( "value" );

		// console.log( "PROG: Vehicle " + vehicle.num + " in progress" );

		if ( val < $v.progressbar( "option", "max" ) ) {
			$v.progressbar( "value", val + Math.floor( Math.random() * 3 ) );
			clearProg = setTimeout( function() { vProgress( vehicle ) }, 50 );
		} else {
			console.log( "Vehicle " + vehicle.num + " has arrived at its destination with " + vehicle.cargo + " cargo. Yay!" );
			sScore = sScore + vehicle.cargo;
			$( "#score" ).html( sScore );
			vPark( vehicle );
		}
	}

	// Parent function to handle vehicle delivery
	function vDeliver( vehicle, factory ) {

		// Remember the road you are on
		vehicle.road = factory.roadToRome;

		// Initialize the vehicle
		if ( factory.obj.position.x >= sCity.obj.position.x ) {
			vehicle.obj = gImages.vehicle.place();
			vehicle.obj.scale( 0.5 );
		} else {
			vehicle.obj = gImages.vehicleR.place();
			vehicle.obj.scale( 0.025 );
		}

		vehicle.obj.position = new Point( factory.obj.position );
		// console.log( vehicle.obj.position );
		view.draw();

		vInit( vehicle );

		// DEBUG: Check if the factory has enough goods, or wait
		// console.log( "DELIVER: Vehicle capacity: " + vehicle.capacity );
		// console.log( "DELIVER: Vehicle load: " + vehicle.cargo );

		var howMany = vehicle.capacity - vehicle.cargo;
		// console.log( "DELIVER: " + howMany + " goods needed to fill vehicle " + vehicle.num );
		// console.log( "DELIVER: Factory " + factory.num )

		if ( factory.goods >= howMany ) {
			factory.goods = factory.goods - howMany;
			vehicle.cargo = vehicle.cargo + howMany;
			factory.tracker.progressbar( "value", factory.goods );
			console.log( "DELIVER: Vehicle shipping will full cargo: " + vehicle.cargo );

		} else {
			vehicle.cargo = factory.goods;
			factory.goods = 0;
			factory.tracker.progressbar( "value", factory.goods );
			console.log( "DELIVER: Cargo shipped under capacity!" );
		}

		fToggle( factory.num, "on" );
		vProgress( vehicle );

	}



	//
	//
	// Reference Material 
	// Note: random, could be interesting to look through these more
	// Not necessarily used in this code
	//
	//

	/*
	References for path drawing and following:
	http://www.html5canvastutorials.com/tutorials/html5-canvas-paths/
	https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
	http://paperjs.org/reference/global/

	// Some good references on bezier curves and canvas
	http://corehtml5canvas.com/code-live/ch02/example-2.22/example.html
	http://corehtml5canvas.com/code-live/
	https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_text

	http://phrogz.net/svg/animation_on_a_curve.html
	https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateMotion
	*/








});