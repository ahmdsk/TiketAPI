import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Event from './Event'

export default class Ticket extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public code: string

  @column()
  public amount: number

  @column()
  public id_used: boolean

  @column()
  public userId: number

  @column()
  public eventId: number

  @column()
  public used_date: string

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Event)
  public event: BelongsTo<typeof Event>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
