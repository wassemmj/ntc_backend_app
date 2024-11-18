const knex = require('../db');

class Comment {
    constructor(data) {
        this.content = data.content;
        this.user_id = data.user_id;
        this.product_id = data.product_id;
    }

    async save() {
        return await knex('Comments').insert(this); 
    }
}

module.exports.comment = Comment ;
