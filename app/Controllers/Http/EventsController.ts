import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Event from 'App/Models/Event'
import Ticket from 'App/Models/Ticket'
import User from 'App/Models/User'
import UserEvent from 'App/Models/UserEvent'
import { DateTime } from 'luxon'
const Keygen = require('keygen')

export default class EventsController {
    public async index({}: HttpContextContract) {
        const events = await Event.query().preload('user').preload('tickets')
        return {
            status: true,
            message: 'Showing All Events',
            data: events
        }
    }

    public async userevents({ auth }: HttpContextContract) {
        const user = await auth.authenticate()
        const events = await Event.query().where('user_id', user.id).preload('user').preload('tickets')
        console.log(events)
        return events
    }

    public async show({ params }: HttpContextContract) {
        try {
            const event = await Event.find(params.id)
            if(event) {
                await event.preload('user')
                await event.preload('tickets')
                return {
                    status: true,
                    message: 'Event Found',
                    data: event
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    public async update({ request, params }: HttpContextContract) {
        const event = await Event.find(params.id)
        if(event) {
            event.title = request.input('title')
            event.description = request.input('description')
            event.date = request.input('date')
            event.ticket_price = request.input('ticket_price')

            if(await event.save()) {
                await event.preload('user')
                await event.preload('tickets')
                return {
                    status: true,
                    message: 'Save Data Successfully',
                    data: event
                }
            } else {
                return {
                    status: false,
                    message: 'Error Save Data'
                }
            }
        } else {
            return {
                status: false,
                message: 'Data Not Found'
            }
        }
    }

    public async store({ auth, request }: HttpContextContract) {
        const user = await auth.authenticate()
        const event = new Event()

        event.title = request.input('title')
        event.description = request.input('description')
        event.date = DateTime.fromISO(request.input('date')).toSQL()
        event.ticket_price = request.input('ticket_price')

        await user.related('events').save(event)
        return event
    }

    public async destroy({ auth, params }: HttpContextContract) {
        const user = await auth.authenticate()
        await Event.query().where('user_id', user.id).where('id', params.id).delete()
        
        return {
            status: true,
            message: 'Delete Event Successfully'
        }
    }

    public async join({ params, auth, response, request }: HttpContextContract) {
        const user = await auth.authenticate()
        const ticket = await Ticket.query()
            .where('user_id', user.id)
            .where('code', request.input('code'))
            .where('event_id', params.id)
            .first()

        if(!ticket) {
            return response.json({ 
                message: 'Ticket code not valid!'
            })
        }

        if(ticket && ticket.is_used && ticket.used_date <= DateTime.fromSQL(ticket.used_date).toSQL()) {
            return response.json({
                message: 'Ticket already used!'
            })
        }

        const joinEvent = new UserEvent()
        joinEvent.user_id = user.id
        joinEvent.event_id = params.id

        ticket.is_used = true
        ticket.used_date = DateTime.now().toSQL()

        if((await joinEvent.save()) && (await ticket.save())) {
            return response
                .status(200)
                .json({
                    message: `You've joined event with id: ${params.id} successfully`
                })
        }

        return response
            .status(500)
            .json({
                message: 'Internal Server Error, Please try again'
            })
    }

    public async buy({ request, params, response, auth }: HttpContextContract) {
        const event = await this.findEvent(params.id)

        if(event === null) {
            return response.status(404).json({ message: 'Event is not valid' })
        }

        const user = await auth.authenticate()

        if(event.ticket_price != request.input('amount')) {
            const message = `Ticket with id: ${event.id} with amount ${event.ticket_price} does not equal to User amount: ${request.input('amount')}`
            return response.status(422).json({message})
        }

        const ticket = new Ticket()
        ticket.userId = user.id
        ticket.eventId = event.id
        ticket.amount = request.input('amount')
        ticket.code = Keygen.hex(5)

        if(await ticket.save()) {
            await User.find(user.id)
            return response.status(200).json({ message: `Payment for event with id: ${event.id} was successfully` })
        }

        return response.status(500).json({ message: 'Internal Server Error, Please try again' })
    }

    public async findEvent(id: number): Promise<Event | null> {
        try {
            const event = await Event.find(id)
            if(event) {
                await event.preload('user')
                await event.preload('tickets')
                return event
            }
        } catch (error) {
            console.log(error)
        }

        return null
    }
}
