const mongorito=require('mongorito'),fs=require('fs'),path=require('path');

module.exports=async function (mongoUrl,collection,config){
	if(mongoUrl && collection){
		const db=new mongorito.Database(mongoUrl);
		await db.connect();

		let model=require('./lib/model');
		let modelCreated=await model(collection,config);
		db.register(modelCreated);

		return modelCreated;
	}else{
		throw new Error('No enough arguments!')
	}
};