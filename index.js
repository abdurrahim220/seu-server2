
require('dotenv').config()
const express = require("express")
const app = express();
const cors = require('cors');
const SSLCommerzPayment = require('sslcommerz-lts')

const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hncbqqn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const store_id = process.env.Store_ID
const store_passwd = process.env.Store_Password
const is_live = false


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const usersCollection = client.db('SEU').collection('users');
    const usersOrderCollection = client.db('SEU').collection('order');
    const cartsCollection = client.db('SEU').collection('carts');
    const usersMembersCollection = client.db('SEU').collection('members');
    const usersGalleryCollection = client.db('SEU').collection('gallery');
    const usersDataCollection = client.db('SEU').collection('data');
    const usersEventsCollection = client.db('SEU').collection('events');
    const usersNewsCollection = client.db('SEU').collection('news');
    const usersJobsCollection = client.db('SEU').collection('jobs');
    const usersAuthorityCollection = client.db('SEU').collection('club_authority');
    const androidCommunityCollection = client.db('SEU').collection('androidCommunity');



    // user api
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists" })
      }
      const result = await usersCollection.insertOne(user);
      res.send(result)
    });

    // cart api
    // todo : jwtVerify 
    //carts api collection 
    app.get('/carts', async (req, res) => {
      const email = req.query.email;
      // console.log(email)
      if (!email) {
        res.send([])
      }
      const query = { email: email }
      const result = await cartsCollection.find(query).toArray();
      res.send(result)
    })

    app.post('/carts', async (req, res) => {
      const item = req.body;
      // console.log(item)
      const result = await cartsCollection.insertOne(item);
      res.send(result)
    })
    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartsCollection.deleteOne(query)
      res.send(result)
    })

    // member api
    app.get('/members', async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;
      const result = await usersMembersCollection.find().limit(limit).skip(skip).toArray();
      res.send(result)
    });

    // add members
    app.post('/addMembers', async (req, res) => {
      const addInfo = req.body;
      // console.log(addInfo)
      const result = await usersMembersCollection.insertOne(addInfo);
      res.send(result);
    })

    // delete member
    app.delete('/deleteMember/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = { _id: new ObjectId(id) }
      const result = await usersMembersCollection.deleteOne(query)
      console.log(result)
      // res.send(result)
    })
    // member search 
    app.get('/members/:text', async (req, res) => {
      try {
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
      } catch (error) {
        // console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
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

    // android api collection 

    app.get('/android', async (req, res) => {
      const result = await androidCommunityCollection.find().toArray();
      res.send(result);
    })


    app.post('/android', async (req, res) => {
      const addInfo = req.body;
      // console.log(addInfo)
      const result = await androidCommunityCollection.insertOne(addInfo);
      res.send(result);
    })

    app.get('/android/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await androidCommunityCollection.findOne(query);

        if (result) {
          res.send(result);
        } else {

          res.status(404).send('Not Found');
        }
      } catch (error) {
        res.status(500).send('Internal Server Error');
      }
    })

    app.delete('/android/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const query = { _id: new ObjectId(id) }
      const result = await androidCommunityCollection.deleteOne(query);
      res.send(result)
    })

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


    // event api with pagination
    app.get('/events', async (req, res) => {
      const limit = parseInt(req.query.limit) || 4
      const page = parseInt(req.query.page) || 1
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
    app.get('/jobs', async (req, res) => {
      const result = await usersJobsCollection.find().toArray();
      res.send(result);
    })
    app.get('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await usersJobsCollection.findOne(query)
      res.send(result);
    })


    app.post('/order', async (req, res) => {

      const tran_id = new ObjectId().toString();

      // const product = await cartsCollection.findOne({_id:new ObjectId(req.body.productId)})

      // console.log(product)
      const order = req.body;
      // console.log(order)

      const data = {
        total_amount: order.price,
        currency: "BDT",
        tran_id: tran_id, // use unique tran_id for each api call
        success_url: 'http://localhost:3030/success',
        fail_url: 'http://localhost:3030/fail',
        cancel_url: 'http://localhost:3030/cancel',
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: "",
        cus_email: order.email,
        cus_add1: "",
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: "",
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
      };
      // console.log(data)
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
      sslcz.init(data).then(apiResponse => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL
        res.send({ url: GatewayPageURL })
        const finalOrder = {

          transitionId: tran_id,

        }

        const result = usersOrderCollection.insertOne(finalOrder)
        console.log('Redirecting to: ', GatewayPageURL)
      });




      app.post('/payment/success/:tranId', async (req, rew) => {
        // console.log(req.params.tranId)
        const result = await usersOrderCollection.updateOne(
          {
            transitionId: req.params.tranId
          },
          {
            $set: {
              paidStatus: true,
            }
          }

        )
        if (result.modifiedCount > 0) {
          res.redirect(`http://localhost:5173/payment/success/${req.params.tranId}`)

        }
      })

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