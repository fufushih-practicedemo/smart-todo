const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Create status labels for Kanban
  const statusLabels = [
    { name: 'Backlog', type: 'STATUS' },
    { name: 'To Do', type: 'STATUS' },
    { name: 'In Progress', type: 'STATUS' },
    { name: 'In Review', type: 'STATUS' },
    { name: 'Done', type: 'STATUS' },
    // Priority labels
    { name: 'High', type: 'PRIORITY' },
    { name: 'Medium', type: 'PRIORITY' },
    { name: 'Low', type: 'PRIORITY' },
    // Category labels
    { name: 'Work', type: 'CATEGORY' },
    { name: 'Personal', type: 'CATEGORY' },
    { name: 'Study', type: 'CATEGORY' },
    { name: 'Shopping', type: 'CATEGORY' }
  ]

  console.log('Start seeding labels...')
  
  for (const label of statusLabels) {
    await prisma.label.upsert({
      where: { name: label.name },
      update: {},
      create: {
        name: label.name,
        type: label.type
      }
    })
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
