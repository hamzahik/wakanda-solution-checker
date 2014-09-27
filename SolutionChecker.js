exports.check = function parseSolution ( inWaSolPath ) {
	
	var output		= {};
	var waSolPath	= fixPath( inWaSolPath );
	var jWaSol		= {};
	var fWaSol		= File( waSolPath );
	
	output.solution				= {};
	output.solution.messages	= [];
	output.solution.projects	= {};
	solMsg 						= output.solution.messages;
	solProjects					= output.solution.projects;
	
	if ( fWaSol.exists ) {
	
		var content	= fWaSol.toString();
	
	} else {
	
		solMsg.push( { 'type' : 'error', 'body' : 'waSolution file does not exist : ' + waSolPath } );
		
		return output;
	
	};
	
	try {
	
		if ( isXML( content ) ) {
		
			jWaSol	= parseAsXML( content , 'solution' );
		
		} else {
		
			//jWaSol	= JSON.parse( content );
			
			solMsg.push( { 'type' : 'error' , 'body' : 'waSolution file is not in XML format' } );
			
			return output;
		
		};
	
	} catch ( e ) {
	
		solMsg.push( { 'type' : 'error', 'body' : e.toString() } );
		
		return output;
	
	};
	
	if ( typeof jWaSol.project === "undefined" || jWaSol.project.length === 0 ) {
	
		solMsg.push( { 'type' : 'error', 'body' : 'No Project Defined in the WaSolution File.' } );
	
	};
	
	for ( var i in jWaSol.project ) {
		
		var project		= jWaSol.project[ i ];
		
		if ( typeof project.path == 'undefined' || project.path == '' ) {
		
			solMsg.push( { 'type' : 'error', 'body' : 'Project declared but path not specified in waSolution.' } );
			
			continue;
			
		};
		
		var waProjPath	= fixPath( fWaSol.parent.path +  project.path );
		var fWaProj		= File( waProjPath );
		
		if ( fWaProj.exists ) {
			
			var pathCase	= correctCase( waProjPath );
			
			if ( pathCase === false ) {
			
				solMsg.push( { 'type' : 'warning', 'body' : 'waProject file wont be found on case sensitive filesystems : ' + waProjPath } );
			
			};			
		
			var pRes		= parseWaProj( waProjPath );
			
			solProjects[ project.path ] = pRes;
		
		} else {
		
			solMsg.push( { 'type' : 'error', 'body' : 'waProject File does not exist : ' + waProjPath } );
		
		};		
	
	};
	
	for ( var i in jWaSol.file ) {
		
		var waFile	= jWaSol.file[ i ];
		
		if ( typeof waFile.path == 'undefined' || waFile.path == '' ) {
		
			solMsg.push( { 'type' : 'error', 'body' : 'File declared but path not specified in waSolution.' } );
			
			continue;
			
		};
		
		var waFilePath	= fixPath( fWaSol.parent.path +  waFile.path );
		var fWaFile		= File( waFilePath );
		
		if ( fWaFile.exists ) {
			
			var pathCase	= correctCase( waFilePath );
			
			if ( pathCase === false ) {
			
				solMsg.push( { 'type' : 'warning', 'body' : 'File wont be found on case sensitive filesystems : ' + waFilePath } );
			
			};
		
		} else {
		
			solMsg.push( { 'type' : 'error', 'body' : 'File does not exist : ' + waFilePath } );
		
		};		
	
	};
	
	return output;
	
};

function fixPath( inPath ) {

	var outPath	= inPath.replace(/[^\/]+\/\.\.\//g,'');
	
	outPath	= outPath.replace(/\/\.\//g,'/');	
	
	return outPath;

};

function parseAsXML( content , root ) {

	var jTextContent	= XmlToJSON( content , 'json-bag' , root );
	
	var jContent		= JSON.parse( jTextContent );
	
	return jContent;

};

function parseWaProj ( waProjPath ) {
	
	var output		= {};
	var jWaProj		= {};
	var fWaProj		= File( waProjPath );
	
	output.project				= {};
	output.project.messages		= [];
	projMsg						= output.project.messages;
	
	try {
	
		var content	= fWaProj.toString();
	
		if ( isXML( content ) ) {
		
			jWaProj	= parseAsXML( content , 'project' );
		
		} else {
		
			//jWaProj	= JSON.parse( content );
			
			projMsg.push( { 'type' : 'error' , 'body' : 'waProject file is not in XML format' } );
			
			return output;
		
		};
	
	} catch ( e ) {
	
		projMsg.push( { 'type' : 'error', 'body' : e.toString() } );
		
		return output;
	
	};
	
	for ( var i in jWaProj.file ) {
		
		var waFile	= jWaProj.file[ i ];
		
		if ( typeof waFile.path == 'undefined' || waFile.path == '' ) {
		
			projMsg.push( { 'type' : 'error', 'body' : 'File declared but path not specified in waProject.' } );
			
			continue;
			
		};
		
		var waFilePath	= fixPath( fWaProj.parent.path +  waFile.path );
		var fWaFile		= File( waFilePath );
		
		if ( fWaFile.exists ) {
			
			var pathCase	= correctCase( waFilePath );
			
			if ( pathCase === false ) {
			
				projMsg.push( { 'type' : 'warning', 'body' : 'File wont be found on case sensitive filesystems : ' + waFilePath } );
			
			};
		
		} else {
		
			projMsg.push( { 'type' : 'error', 'body' : 'File does not exist : ' + waFilePath } );
		
		};		
	
	};
	
	for ( var i in jWaProj.folder ) {
		
		var waFolder	= jWaProj.folder[ i ];
		
		if ( typeof waFolder.path == 'undefined' || waFolder.path == '' ) {
		
			projMsg.push( { 'type' : 'error', 'body' : 'Folder declared but path not specified in waProject.' } );
			
			continue;
			
		};
		
		var waFolderPath	= fixPath( fWaProj.parent.path +  waFolder.path );
		var fWaFolder		= Folder( waFolderPath );
		
		if ( fWaFolder.exists ) {
			
			var pathCase	= correctCase( waFolderPath , true );
			
			if ( pathCase === false ) {
			
				projMsg.push( { 'type' : 'warning', 'body' : 'Folder wont be found on case sensitive filesystems : ' + waFolderPath } );
			
			};
		
		} else {
		
			projMsg.push( { 'type' : 'error', 'body' : 'Folder does not exist : ' + waFolderPath } );
		
		};		
	
	};
	
	return output;
	
};

function isXML( content ) {

	return content.match( /^<\?xml/ );

};

function correctCase( userPath , folder ) {
	
	if ( folder ) {
	
		var folder		= Folder( userPath );
		var parent		= folder.parent;
		
		for ( var i in parent.folders ) {
		
			if ( userPath === parent.folders[ i ].path ) {
			
				return true;
			
			};
		
		};
	
	} else {
	
		var file		= File( userPath );
		var parent		= file.parent;
		
		for ( var i in parent.files ) {
		
			if ( userPath === parent.files[ i ].path ) {
			
				return true;
			
			};
		
		};
	
	}
	
	return false;

};