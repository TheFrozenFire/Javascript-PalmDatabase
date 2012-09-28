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
	
	pdbproto.attributesProto = function() {
		return {
			readonly : false,
			dirtyappinfo : false,
			backup : false,
			overwrite : false,
			reset : false,
			nocopy : false
		};
	}
	
	pdbproto.attributeMasks = {
		readonly : 0x0002,
		dirtyappinfo : 0x0004,
		backup : 0x0008,
		overwrite : 0x0010,
		reset : 0x0020,
		nocopy : 0x0040
	};
	
	pdbproto.recordAttributesProto = function() {
		return {
			secret : false,
			busy : false,
			dirty : false,
			deleteOnSync : false
		};
	}
	
	pdbproto.recordAttributeMasks = {
		secret : 0x10,
		busy : 0x20,
		dirty : 0x40,
		deleteOnSync : 0x80
	};
	
	pdbproto.loadFile = function(pdbfile) {
		var file = new StringStream(pdbfile);
		
		this.name = file.read(32);
		this.parseAttributes(file.read(2));
		this.version = this.binary.toShort(file.read(2));
		this.creationDate = this.parsePDBTime(file.read(4));
		this.modificationDate = this.parsePDBTime(file.read(4));
		this.lastBackupDate = this.parsePDBTime(file.read(4));
		this.modificationNumber = this.binary.toInt(file.read(4));
		
		var appInfoID = this.binary.toInt(file.read(4));
		var sortInfoID = this.binary.toInt(file.read(4));
		
		this.type = file.read(4);
		this.creator = file.read(4);
		this.uniqueIDseed = file.read(4);
		this.nextRecordListID = this.binary.toInt(file.read(4));
		
		var numRecords = this.binary.toShort(file.read(2));
		
		var record;
		for(var i = 0; i < numRecords; i++) {
			record = {
				offset : this.binary.toInt(file.read(4)),
				attributes : this.parseRecordAttributes(file.read(2)),
				uniqueID : this.binary.toInt(0x0+file.read(3)),
				data : undefined
			};
			this.records.push(record);
		}
		
		var start;
		var end;
		var size;
		for(var i = 0; i < this.records.length; i++) {
			file.rewind();
			
			start = this.records[i].offset;
			if(this.records[i+1] != undefined) {
				end = this.records[i+1].offset;
			} else {
				end = file.length;
			}
			size = end - start;
			
			file.seek(start);
			this.records[i].data = file.read(size);
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
	
	pdbproto.parsePDBTime = function(data) {
		var value = this.binary.toDWord(data);
	
		var epochDifference = 2082844800;
		var highBit = 2147483648;
		
		var isPDB = ((data & highBit) > 0);
		
		if(isPDB) {
			value -= epochDifference
		}
		
		return new Date(value * 1000);
	}
}
