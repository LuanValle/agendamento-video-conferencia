import { sql } from './_db.js'

export default async function handler(request, response){
    try{
        const result = await sql`SELECT now() AS agora`

        return response.status(200).json({
            status: 'ok',
            databaseTime: result[0].agora,
        })
    }catch (error){
        return response.status(500).json({
            status: 'error',
            message: error.message,
        })
    }
}