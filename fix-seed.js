const fs = require('fs');
let code = fs.readFileSync('prisma/seed.ts', 'utf-8');
code = code.replace(/(NodeType|UserRole|DoctorStatus|DepartmentCategory|RoomType|QueueEntryStatus)\.([A-Z_]+)/g, '"$2"');
code = code.replace(/import \{.*?\} from '@prisma\/client';/, '');
fs.writeFileSync('prisma/seed.ts', code);
console.log('Fixed seed script');
