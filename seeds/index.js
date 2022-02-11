const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('../seeds/cities');
const { descriptors, places } = require('../seeds/seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "conection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: '61fb26015bb23ca3ee59f911',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam dolorem quos debitis molestiae. Non inventore, asperiores reiciendis, in cumque alias aliquid deleniti facilis soluta consequuntur dolorem sit nihil! Quisquam, necessitatibus.',
            price,
            geometry: { 
              type: 'Point', 
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude
              ] 
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dni1yvx6u/image/upload/v1644424155/YelpCamp/mdajszhgmsmkwdrjq0pl.jpg',
                  filename: 'YelpCamp/mdajszhgmsmkwdrjq0pl',
                },
                {
                  url: 'https://res.cloudinary.com/dni1yvx6u/image/upload/v1644424155/YelpCamp/gjys2vxbzdor8p0xarmf.jpg',
                  filename: 'YelpCamp/gjys2vxbzdor8p0xarmf',
                }
              ]
        });

        await camp.save();
    }

}

seedDb().then(() =>{
    mongoose.connection.close();
});