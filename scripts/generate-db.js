import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { faker } from '@faker-js/faker'

const __dirname = dirname(fileURLToPath(import.meta.url))

function parseArgs(argv) {
  const args = { members: 5, out: null, format: 'db', collection: null }
  const positional = []
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') args.out = argv[++i]
    else if (argv[i] === '--format') args.format = argv[++i]
    else if (argv[i] === '--collection') args.collection = argv[++i]
    else positional.push(argv[i])
  }
  if (positional[0] !== undefined) {
    args.members = Number(positional[0]) || args.members
  }
  return args
}

const {
  members: MEMBER_COUNT,
  out,
  format,
  collection,
} = parseArgs(process.argv.slice(2))

const PRIORITIES = ['low', 'medium', 'high']

// Deterministic so the local db and the two Pages files agree on member ids.
faker.seed(42)

const members = Array.from({ length: MEMBER_COUNT }, () => {
  const month = String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0')
  const day = String(faker.number.int({ min: 1, max: 28 })).padStart(2, '0')
  return {
    id: faker.string.nanoid(),
    name: faker.person.firstName(),
    birthday: `${month}-${day}`,
  }
})

const wishes = members.flatMap((member) => {
  const others = members.filter((candidate) => candidate.id !== member.id)
  const count = faker.number.int({ min: 4, max: 8 })

  return Array.from({ length: count }, () => {
    const reserver =
      others.length > 0 && faker.datatype.boolean(0.33)
        ? faker.helpers.arrayElement(others)
        : null

    return {
      id: faker.string.nanoid(),
      memberId: member.id,
      title: faker.commerce.productName(),
      url: faker.internet.url(),
      notes: faker.datatype.boolean(0.5) ? faker.lorem.sentence() : '',
      price: `${faker.commerce.price({ min: 5, max: 300 })}€`,
      priority: faker.helpers.arrayElement(PRIORITIES),
      createdAt: faker.date.recent({ days: 60 }).toISOString(),
      reservedBy: reserver ? reserver.id : null,
      reservedAt: reserver
        ? faker.date.recent({ days: 20 }).toISOString()
        : null,
    }
  })
})

const collections = { members, wishes }

const payload =
  format === 'array'
    ? collections[collection ?? 'wishes']
    : { members, wishes, $schema: './node_modules/json-server/schema.json' }

const outputPath = out
  ? resolve(process.cwd(), out)
  : resolve(__dirname, '..', 'db.json')

writeFileSync(outputPath, JSON.stringify(payload, null, 2) + '\n')

console.log(
  `Generated ${members.length} members / ${wishes.length} wishes` +
    `${format === 'array' ? ` (${collection ?? 'wishes'} only)` : ''} in ${outputPath}`,
)
