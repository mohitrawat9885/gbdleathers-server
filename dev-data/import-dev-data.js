const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Categorys = require('../Controllers/Category/CategoryModel');
const Products = require('../Controllers/Product/ProductModel');
const ShopProfile = require('../Controllers/ShopProfile/ShopProfileModel');
const Users = require('../Controllers/User/UserModel');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log('Database Connected'));

// READ JSON FILE

const categorys = JSON.parse(
  fs.readFileSync(`${__dirname}/categorys.json`, 'utf-8')
);

const products = JSON.parse(
  fs.readFileSync(`${__dirname}/products.json`, 'utf-8')
);

const shopProfile = JSON.parse(
  fs.readFileSync(`${__dirname}/shopProfile.json`, 'utf-8')
);

const users = JSON.parse(fs.readFileSync(`${__dirname}/user.json`, 'utf-8'));

products.forEach((p, i) => {
  products[i]._id = p._id['$oid'];
  products[i].user = p.user['$oid'];
  products[i].category = p.category['$oid'];
  products[i].created_at = p.created_at['$date'];
  products[i].updated_at = p.updated_at['$date'];
  products[i].slug = `${p.slug}-${i}`;
});

const importData = async () => {
  try {
    // await Categorys.create(categorys);
    await Products.create(products);
    // await ShopProfile.create(shopProfile);
    // await Users.create(users);
    console.log('Data Loaded!👌👌');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Categorys.deleteMany();
    await Products.deleteMany();
    // await ShopProfile.deleteMany();
    // await Users.deleteMany();

    console.log('Data has been deleted!☠️☠️');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// console.log(process.argv);
