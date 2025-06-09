const mongoose = require('mongoose');


const connectDB = async ()=> {
    if(process.ENV.NODE_ENV==='test'){
        console.log('skipping the db connection in test environment');
        return;
    }
try{
await mongoose.connect('mongodb://mongo:27017/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
console.log('Connected to MongoDB')
}
catch(err){
 console.error('MongoDB connection error:', err);
}
};
module.exports=connectDB;