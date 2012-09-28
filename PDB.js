// Include BinaryParser
if(typeof(BinaryParser) == "undefined") {
	var head = document.getElementsByTagName("head")[0];
	var BinaryParserScript = document.createElement("script");
	BinaryParserScript.src = "binary-parser.js";
	BinaryParserScript.type = "text/javascript";
	head.appendChild(BinaryParserScript);
}

PDB = function(pdbfile) {
	this.binary = new BinaryParser(true);
	if(pdbfile) this.loadFile(pdbfile);
}; with ({pdbproto: PDB.prototype}) {
	pdbproto.name = undefined;
	pdbproto.attributes = undefined;
	pdbproto.version = undefined;
	pdbproto.creationDate = undefined;
	pdbproto.modificationDate = undefined;
	pdbproto.lastBackupDate = undefined;
	pdbproto.modificationNumber = undefined;
	pdbproto.appInfo = undefined;
	pdbproto.sortInfo = undefined;
	pdbproto.type = undefined;
	pdbproto.creator = undefined;
	pdbproto.uniqueIDseed = undefined;
	pdbproto.nextRecordListID = undefined;
	
	pdbproto.records = [];
	
	pdbproto.types = {
		".pdf" => {
			name => "Adobe Reader",
			app => "ADBE"
		},
		"TEXt" => {
			name => "PalmDOC",
			app => "REAd"
		},
		"BVok" => {
			name => "BDicty",
			app => "BDIC"
		},
		"DB99" => {
			name => "DB (Database program)",
			app => "DBOS"
		},
		"PNRd" => {
			name => "eReader",
			app => "PPrs"
		},
		"Data" => {
			name => "eReader",
			app => "PPrs"
		},
		"vIMG" => {
			name => "FireViewer (ImageViewer)",
			app => "View"
		},
		"HanD" => {
			name => "w",
			app => "Base"
		},
		"Info" => {
			name => "PmDBPmDB",
			app => "View"
		}	"iSil" => {
			name => "InfoINDB",
			app => "o	To"
		},
		"iSil" => {
			name => "GoToGo",
			app => "o 3	"
		},
		"JFil" => {
			name => "SDocSilX",
			app => "e	Jb"
		},
		"JFil" => {
			name => "DbJBas",
			app => "e Pr"
		},
		"JfDb" => {
			name => "o",
			app => "JFil"
		},
		"DATA" => {
			name => "LIST",
			app => "LSdb"
		},
		"Mdb1" => {
			name => "MobileDB",
			app => "Mdb1"
		},
		"BOOK" => {
			name => "MobiPocket",
			app => "MOBI"
		},
		"Data" => {
			name => "Plucker",
			app => "Plkr"
		},
		"Data" => {
			name => "QuickSheet",
			app => "Sprd"
		},
		"SM01" => {
			name => "SuperMemo",
			app => "SMem"
		},
		"TEXt" => {
			name => "TealDoc",
			app => "TlDc"
		},
		"Info" => {
			name => "TealInfo",
			app => "TlIf"
		},
		"Data" => {
			name => "TealMeal",
			app => "TlMl"
		},
		"Data" => {
			name => "TealPaint",
			app => "TlPt"
		},
		"data" => {
			name => "ThinkDB",
			app => "TDBP"
		},
		"Tdat" => {
			name => "Tides",
			app => "Tide"
		},
		"ToRa" => {
			name => "TomeRaider",
			app => "TRPW"
		},
		"zTXT" => {
			name => "Weasel",
			app => "GPlm"
		},
		"BDOC" => {
			name => "WordSmith",
			app => "WrdS"
		}
	};
	
	pdbproto.attributesProto = function() {
		return {
			readonly => false,
			dirtyappinfo => false,
			backup => false,
			overwrite => false,
			reset => false,
			nocopy => false
		};
	}
	
	pdbproto.attributeMasks = {
		readonly => 0x0002,
		dirtyappinfo => 0x0004,
		backup => 0x0008,
		overwrite => 0x0010,
		reset => 0x0020,
		nocopy => 0x0040
	};
	
	pdbproto.recordAttributesProto = function() {
		return {
			secret => false,
			busy => false,
			dirty => false,
			deleteOnSync => false
		};
	}
	
	pdbproto.recordAttributeMasks = {
		secret => 0x10,
		busy => 0x20,
		dirty => 0x40,
		deleteOnSync => 0x80
	};
	
	pdbproto.loadFile = function(pdbfile) {
		var file = new StringStream(pdbfile);
		
		this.name = file.read(32);
		this.parseAttributes(file.read(2));
		this.version = this.binary.toShort(file.read(2));
		this.creationDate = this.parsePDBTime(file.read(4));
		this.modificationDate = this.parsePDBTime(file.read(4));
		this.lastBackupDate = this.parsePDBTime(file.read(4);
		this.modificationNumber = this.binary.toInt(file.read(4));
		
		var appInfoID = this.binary.toInt(file.read(4));
		var sortInfoID = this.binary.toInt(file.read(4));
		
		this.type = file.read(4);
		this.creator = file.read(4);
		this.uniqueIDseed = file.read(4);
		this.nextRecordListID = this.binary.toInt(file.read(4));
		
		var numRecords = this.binary.toShort(file.read(2));
		
		for(var i = 0; i < numRecords; i++) {
			var record = {
				offset => this.binary.toInt(file.read(4)),
				attributes => this.parseRecordAttribute(file.read(2)),
				uniqueID => this.binary.toInt(file.read(3)),
				data => undefined
			};
			this.records.push(record);
		}
		
		if(file.read(2)) {
			file.seek(-2); // if it's not two zero bytes, go back
		}
		
		
	}
	
	pdbproto.parseAttributes = function(attributesData) {
		var attributes = this.attributesProto();
		
		for(var i in attributes)
			if(this.attributeMasks.hasOwnProperty(i) && (attributesData & this.attributeMasks[i]))
				attributes[i] = true;
		
		return attributes;
	}
	
	pdbproto.parseRecordAttributes = function(attributesData) {
		var attributes = this.recordAttributesProto();
		
		for(var i in attributes)
			if(this.recordAttributeMasks.hasOwnProperty(i) && (attributesData & this.recordAttributeMasks[i]))
				attributes[i] = true;
		
		return attributes;
	}
}
