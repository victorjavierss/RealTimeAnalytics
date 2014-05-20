var DataTable = function( indexBy ){
	this.indexField = indexBy;
}

DataTable.prototype.COUNT = 'count';
DataTable.prototype.indexField = null;
DataTable.prototype.table = [];

DataTable.prototype.sort = function() {
    var dt = this;
    var sortByCountField = function(a, b){
	   	if(a[ dt.COUNT ]  < b[ dt.COUNT ] ) return 1;
    	if(a[ dt.COUNT ]  > b[ dt.COUNT ] ) return -1;
    	return 0;
    }
	this.table.sort ( sortByCountField );
}

DataTable.prototype.seek = function( row ){
	for(var key in this.table){
		if ( this.table[key][this.indexField] == row ){
			return key;
		}
	}
	return false;
}

DataTable.prototype.getCount = function( row ){
	var position = this.seek(row[ this.indexField  ] );
	if( position === false) {
		return 0;
	}else{
		return this.table[ position ][ this.COUNT ];
	}
}

DataTable.prototype.insert = function( row ){
	var position = this.seek( row[this.indexField ] );
	if( position === false ){
		row[ this.COUNT ] = 1;
		this.table.push( row );
	}else{
		this.table[position][this.COUNT]++;
	}
	this.sort();
}

DataTable.prototype.removeEmpty = function(){
	for(var key in this.table){
		if ( this.table[key][this.COUNT] == row ){

		}
	}
	/*if( this.table[position][this.COUNT] == 0 ){
		this.table.pop();
	}*/
}

DataTable.prototype.remove = function( row ){
	var position = this.seek( row [ this.indexField ] );
	if( position === false ){

	}else{
		if ( this.table[position][this.COUNT] > 0 ){
			this.table[position][this.COUNT]--;
			this.sort();
			removeEmpty();
		}
	}
}