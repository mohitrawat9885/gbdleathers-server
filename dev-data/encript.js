const bcrypt = require("bcrypt");
const saltRounds = 10;
const myPlaintextPassword = "mohit";
const someOtherPlaintextPassword = "not_bacon";

bcrypt.hash(myPlaintextPassword, saltRounds, function (err, hash) {
  console.log(hash);
});
