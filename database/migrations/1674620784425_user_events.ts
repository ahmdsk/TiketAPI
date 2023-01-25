import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserEvents extends BaseSchema {
  protected tableName = 'user_events'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
