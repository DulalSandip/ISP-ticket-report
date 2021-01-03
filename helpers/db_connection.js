require('dotenv').config()
const mongoose = require('mongoose')

mongoose
  .connect(process.env.MONGOODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch((err) => {
    console.log(err.message);
  });

const db = mongoose.connection
db.on('connected',()=>{
    console.log('Mongoose connected to database')
})

db.on('error',(err)=>{
    console.log(err.message)
})
db.on('disconnected',()=>{
    console.log('Mongoose is disconnected now')
})

process.on('SIGINT',async()=>{
    await db.close()
    process.exit(0)

})