const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma.postgres.bak', 'utf-8');

// Change provider
schema = schema.replace('provider = "postgresql"', 'provider = "sqlite"');
schema = schema.replace('url      = env("DATABASE_URL")', 'url      = "file:./dev.db"');

// Remove enum definitions
schema = schema.replace(/enum \w+ {[\s\S]*?}/g, '');

// Replace enum references with String
schema = schema.replace(/role          UserRole/g, 'role          String');
schema = schema.replace(/availabilityStatus DoctorStatus/g, 'availabilityStatus String');
schema = schema.replace(/category   DepartmentCategory/g, 'category   String');
schema = schema.replace(/type         RoomType/g, 'type         String');
schema = schema.replace(/nodeType     NodeType/g, 'nodeType     String');
schema = schema.replace(/status      QueueEntryStatus @default\(WAITING\)/g, 'status      String @default("WAITING")');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Converted schema to sqlite!');
