/*
*/

function emptyIDHashtable(){
    return {"size":0,"hashes":{}};
}

function getId(table,key){
    //console.debug("Value of key is "+ table[key]);
    if (table.hashes[key] == undefined){
	table.hashes[key] = table.size;
	table.size++;
    }
    return table.hashes[key];
}
