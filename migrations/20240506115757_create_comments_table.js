exports.up = async function(knex) {
    await knex.schema.createTable('Comments',(table) => {
        table.increments('id').primary();
        table.string('content').notNullable();
        table.integer('user_id').unsigned().notNullable();
        table.foreign('user_id').references('Users.id');
        table.integer('product_id').unsigned().notNullable();
        table.foreign('product_id').references('Products.id');
        table.timestamps(true, true); 
    }) ;
};

exports.down = async function(knex) {
    await knex.schema.dropTable('Comments'); 
};
