
require('dotenv').config()
const express = require("express")
const app = express();
const cors = require('cors');

const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hncbqqn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const usersMembersCollection = client.db('SEU').collection('members');
    const usersGalleryCollection = client.db('SEU').collection('gallery');
    const usersDataCollection = client.db('SEU').collection('data');
    const usersEventsCollection = client.db('SEU').collection('events');
    const usersNewsCollection = client.db('SEU').collection('news');
    const usersJobsCollection = client.db('SEU').collection('jobs');
    const usersAuthorityCollection = client.db('SEU').collection('club_authority');


    app.get('/members', async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;
      const result = await usersMembersCollection.find().limit(limit).skip(skip).toArray();
      res.send(result)
    });

    // add members
    app.post('/addMembers',async (req,res)=>{
      const addInfo = req.body;
      // console.log(addInfo)
      const result = await usersMembersCollection.insertOne(addInfo);
      res.send(result);
    })

    // member search 
    app.get('/members/:text', async (req, res) => {
      let searchData = req.params.text;
      // console.log(searchData)
      const result = await usersMembersCollection.find({
        $or: [
          { name: { $regex: searchData, $options: 'i' } },
          { batch: { $regex: searchData, $options: 'i' } },
          { role: { $regex: searchData, $options: 'i' } },
          { department: { $regex: searchData, $options: 'i' } },
        ]
      }).toArray();
      res.send(result);
    });


    app.get('/authority', async (req, res) => {

      const result = await usersAuthorityCollection.find().toArray();
      res.send(result)
    });

    app.get('/gallery', async (req, res) => {

      const result = await usersGalleryCollection.find().toArray();
      res.send(result)
    });


    app.get('/data', async (req, res) => {

      const result = await usersDataCollection.find().toArray();
      res.send(result)
    });

    //news api
    app.get('/news', async (req, res) => {
      const result = await usersNewsCollection.find().toArray();
      res.send(result)
    });

    app.get('/news/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const query = { _id: new ObjectId(id) }
      const result = await usersNewsCollection.findOne(query);
      res.send(result)
    });


    // event api
    app.get('/events', async (req, res) => {
      const limit = parseInt(req.query.limit) || 1;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;
      const result = await usersEventsCollection.find().limit(limit).skip(skip).toArray();
      res.send(result)
    });

    app.get('/events/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const query = { _id: new ObjectId(id) }
      const result = await usersEventsCollection.findOne(query);
      res.send(result)
    });

    // jobs api 
    app.get('/jobs',async(req,res)=>{
      const result = await usersJobsCollection.find().toArray();
      res.send(result);
    })
    app.get('/jobs/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await usersJobsCollection.findOne(query)
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
  res.send("SEU Is on the goo");
})

app.listen(port, () => {
  console.log(`seu server is running on ${port}`)
})