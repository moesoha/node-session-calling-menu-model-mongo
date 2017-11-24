'use strict';
const {Model,ObjectId}=require('mongorito');

let promiseMongoObjectId=function (a){
	switch(typeof(a)){
		case 'string':
			return(mongorito.ObjectId.createFromHexString(a));
			break;
		case 'object':
			if(a.constructor===mongorito.ObjectId){
				return(a);
			}
			break;
		default:
			throw new Error('Wrong type of the field \'ObjectID\'.')
	}
}

let create=async function (collectionName='sph_session',{
	expireTime=3600*1000
}){
	class Data extends Model{
		collection(){
			return collectionName;
		}
		
		async newSession({
			unique,
			entry
		}){
			this.set('uniqueId',unique);
			this.set('entry',entry);
			this.set('status',0);	// 0-ongoing 1-exited 2-finished
			this.set('currentLayer',0);	// layer number
			this.set('conversation',[]);
			this.set('createTime',new Date());
			this.set('updateTime',new Date());
			await this.save();
			return this.get('_id');
		}

		async updateTime(){
			this.set('updateTime',new Date());
			await this.save();
		}

		async currentLayerInc(){
			this.increment('currentLayer',1);
			await this.save();
		}

		async currentLayerDec(){
			this.increment('currentLayer',-1)
			await this.save();
		}

		async setFinished(){
			this.increment('status',2)
			await this.save();
		}

		async setExited(){
			this.increment('status',1)
			await this.save();
		}

		async addToConversation({
			content,
			sender	// here OR there
		}){
			let a=this.get('conversation');
			a.push({
				content: content,
				updateTime: new Date(),
				sender: sender,
				layer: this.get('currentLayer')
			});
			this.set('conversation',a);
			await this.save();
		}
	}
	
	Data.use(function (BeExtended){
		BeExtended.getSession=async function(unique){
			if(unique){
				let searchObj={
					uniqueId: unique,
					updateTime: {
						$gte: new Date(new Date().getTime()-expireTime)
					},
					status: 0
				};
				let result=await this.findOne(searchObj);
				
				if(result){
					return result;
				}else{
					return(false);
				}
			}else{
				return(false);
			}
		};
	});

	return Data;
}


module.exports=create;