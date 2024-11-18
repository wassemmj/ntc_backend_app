const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  await knex('Users').del()
  await knex('Users').insert([
    {id: 1, name: 'admin' , email : 'admin@admin.com' , address : 'damascus' ,
     phoneNumber : '1234567890' , role : 'admin' , password : await bcrypt.hash('123456789', await bcrypt.genSalt(10))},
  ]);
};
