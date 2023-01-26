import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Ticket from 'App/Models/Ticket'

const Keygen = require('keygen')

export default class TicketsController {
    public async index({ response }: HttpContextContract) {
        const tickets = await Ticket.query().preload('user').preload('event')
        return response.status(200).json({
            message: 'Showing All Tickets',
            data: tickets
        })
    }

    public async show({ params, response }: HttpContextContract) {
        try {
            const ticket = await Ticket.find(params.id)

            if(ticket) {
                await ticket.preload('user')
                await ticket.preload('event')
                return response.status(200).json({
                    message: 'Data Ticket Found',
                    data: ticket
                })
            } else {
                return response.status(404).json({
                    message: 'Ticket Not Found'
                })
            }
        } catch (error) {
            console.log(error)
        }
    }

    public async store({ auth, request }: HttpContextContract) {
        const user = await auth.authenticate()
        const ticket = new Ticket()

        ticket.code = Keygen.hex(5)
        ticket.eventId = request.input('event_id')
        ticket.amount = request.input('amount')

        await user.related('tickets').save(ticket)
        return ticket
    }

    public async update({ request, response, params }: HttpContextContract) {
        const ticket = await Ticket.find(params.id)

        if(ticket) {
            ticket.amount = request.input('amount')
            if(await ticket.save()) {
                await ticket.preload('user')
                await ticket.preload('event')

                return response.status(200).json({
                    message: 'Ticket Successfully Updated',
                    data: ticket
                })
            } else {
                return response.status(422).json({
                    message: 'Failed Update Ticket'
                })
            }
        } else {
            return response.status(404).json({
                message: 'Ticket Not Found'
            })
        }
    }

    public async destroy({ response, auth, params }: HttpContextContract) {
        const user = await auth.authenticate()
        await Ticket.query().where('user_id', user.id).where('id', params.id).delete()
        return response.status(200).json({
            message: 'Ticket Delete Successfully'
        })
    }
}
