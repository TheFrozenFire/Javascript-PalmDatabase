StringStream = function(string) {
	this.string = string;
	this.position = 0;
}; with({proto: StringStream.prototype}) {
	proto.read = function(bytes) {
		var data = this.string.substr(this.position, bytes);
		this.position += bytes;
		return data;
	}

	proto.seek = function(bytes) {
		this.position += bytes;
		return true;
	}

	proto.rewind = function() {
		this.position = 0;
		return true;
	}

	proto.tell = function() {
		return this.position;
	}

	proto.eof = function() {
		return (this.position >= this.string.length);
	}
}
