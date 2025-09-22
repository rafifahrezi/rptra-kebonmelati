const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

async function testConnection() {
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI not found in environment variables')
        process.exit(1)
    }

    console.log('🔄 Testing MongoDB connection...')

    try {
        const client = new MongoClient(process.env.MONGODB_URI)
        await client.connect()

        // Test database access
        const db = client.db()
        const collections = await db.listCollections().toArray()

        console.log('✅ MongoDB connection successful!')
        console.log(`📊 Database: ${db.databaseName}`)
        console.log(`📋 Collections: ${collections.length}`)

        await client.close()
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message)
        process.exit(1)
    }
}

testConnection()