import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Starting GMERS database seed...');
  await prisma.queueEntry.deleteMany();
  await prisma.queue.deleteMany();
  await prisma.navigationEdge.deleteMany();
  await prisma.qRCodeLocation.deleteMany();
  await prisma.navigationNode.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.room.deleteMany();
  await prisma.department.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.building.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Cleaned existing data');

  const passwordHash = await hashPassword('Admin@123');
  const doctorPasswordHash = await hashPassword('Doctor@123');
  const patientPasswordHash = await hashPassword('Patient@123');

  // ─── ADMIN USER ───
  await prisma.user.create({
    data: {
      name: 'GMERS Admin',
      email: 'admin@gmers.edu.in',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // ─── PATIENT USER ───
  const patientUser = await prisma.user.create({
    data: {
      name: 'Rahul Patel',
      email: 'rahul.patel@patient.com',
      phone: '+919876543210',
      passwordHash: patientPasswordHash,
      role: 'PATIENT',
      patient: { create: {} },
    },
    include: { patient: true },
  });

  // ─── HOSPITAL ───
  const hospital = await prisma.hospital.create({
    data: {
      name: 'GMERS Medical College & Hospital, Sola',
      address: 'General Civil Hospital, Sola, Ahmedabad - 380060, Gujarat, India',
      latitude: 23.0768,
      longitude: 72.5250,
      contact: '+91-79-27664359',
    },
  });

  // ─── BUILDINGS ───
  const blocks = {
    A: await prisma.building.create({ data: { hospitalId: hospital.id, name: 'Block A (OPD & Administration)', code: 'BLK_A' } }),
    B: await prisma.building.create({ data: { hospitalId: hospital.id, name: 'Block B (Emergency & Surgical Services)', code: 'BLK_B' } }),
    C: await prisma.building.create({ data: { hospitalId: hospital.id, name: 'Block C (General Wards)', code: 'BLK_C' } }),
    D: await prisma.building.create({ data: { hospitalId: hospital.id, name: 'Block D (Speciality & ICU)', code: 'BLK_D' } }),
    Super: await prisma.building.create({ data: { hospitalId: hospital.id, name: 'Super Speciality Block', code: 'BLK_SS' } }),
    Utility: await prisma.building.create({ data: { hospitalId: hospital.id, name: 'Utility Block', code: 'BLK_UTIL' } }),
    HostelUG: await prisma.building.create({ data: { hospitalId: hospital.id, name: 'Hostel (UG)', code: 'HSTL_UG' } }),
    HostelPG: await prisma.building.create({ data: { hospitalId: hospital.id, name: 'Hostel (PG)', code: 'HSTL_PG' } }),
  };

  // ─── FLOORS ───
  const floors = {
    A_GF: await prisma.floor.create({ data: { buildingId: blocks.A.id, name: 'Ground Floor', floorNumber: 0 } }),
    A_FF: await prisma.floor.create({ data: { buildingId: blocks.A.id, name: 'First Floor', floorNumber: 1 } }),
    B_GF: await prisma.floor.create({ data: { buildingId: blocks.B.id, name: 'Ground Floor', floorNumber: 0 } }),
    B_FF: await prisma.floor.create({ data: { buildingId: blocks.B.id, name: 'First Floor', floorNumber: 1 } }),
    C_SF: await prisma.floor.create({ data: { buildingId: blocks.C.id, name: 'Second Floor', floorNumber: 2 } }),
  };

  // ─── DEPARTMENTS ───
  const createDept = async (floorId: string, name: string, code: string, category: any) => {
    return prisma.department.create({
      data: { hospitalId: hospital.id, floorId, name, code, category },
    });
  };

  const depts = {
    GenMed: await createDept(floors.A_GF.id, 'General Medicine', 'DPT_MED', 'CLINICAL'),
    Surgery: await createDept(floors.A_GF.id, 'Surgery', 'DPT_SURG', 'CLINICAL'),
    Pediatrics: await createDept(floors.A_GF.id, 'Pediatrics', 'DPT_PED', 'CLINICAL'),
    Orthopedics: await createDept(floors.A_GF.id, 'Orthopedics', 'DPT_ORTHO', 'CLINICAL'),
    ENT: await createDept(floors.A_GF.id, 'ENT', 'DPT_ENT', 'CLINICAL'),
    ObGyn: await createDept(floors.A_FF.id, 'Obstetrics & Gynecology', 'DPT_OBGYN', 'CLINICAL'),
    Ophtha: await createDept(floors.A_FF.id, 'Ophthalmology', 'DPT_OPHTHA', 'CLINICAL'),
    Dermatology: await createDept(floors.A_FF.id, 'Dermatology', 'DPT_DERMA', 'CLINICAL'),
    Psychiatry: await createDept(floors.A_FF.id, 'Psychiatry', 'DPT_PSYCH', 'CLINICAL'),
    TBChest: await createDept(floors.A_FF.id, 'TB & Chest', 'DPT_TB', 'CLINICAL'),
    Dentistry: await createDept(floors.A_FF.id, 'Dentistry', 'DPT_DENT', 'CLINICAL'),
    Emergency: await createDept(floors.B_GF.id, 'Emergency Department', 'DPT_EMERG', 'EMERGENCY'),
    Radiodiagnosis: await createDept(floors.B_GF.id, 'Radiodiagnosis', 'DPT_RADIO', 'DIAGNOSTIC'),
    Anaesthesia: await createDept(floors.B_FF.id, 'Anaesthesia', 'DPT_ANES', 'SUPPORT'),
  };

  // ─── ROOMS & DOCTORS ───
  const createDoctor = async (name: string, email: string, spec: string, deptId: string, floorId: string, roomType: any) => {
    const room = await prisma.room.create({
      data: {
        floorId,
        departmentId: deptId,
        roomNumber: `R-${Math.floor(Math.random() * 1000)}`,
        name: `Dr. ${name.split(' ')[0]} Cabin`,
        type: roomType,
      },
    });

    const docUser = await prisma.user.create({
      data: { name: `Dr. ${name}`, email, passwordHash: doctorPasswordHash, role: 'DOCTOR' },
    });

    const doc = await prisma.doctor.create({
      data: {
        userId: docUser.id,
        employeeId: `EMP${Math.floor(Math.random() * 10000)}`,
        specialization: spec,
        departmentId: deptId,
        roomId: room.id,
        availabilityStatus: 'AVAILABLE',
        consultationStart: '09:00',
        consultationEnd: '17:00',
      },
    });

    const queue = await prisma.queue.create({
      data: { doctorId: doc.id, departmentId: deptId, currentNumber: 12, waitingCount: Math.floor(Math.random() * 15) },
    });

    return { doc, queue };
  };

  await createDoctor('Vikram Sharma', 'vikram.sharma@gmers.edu.in', 'Senior Physician', depts.GenMed.id, floors.A_GF.id, 'CONSULTATION');
  await createDoctor('Neha Desai', 'neha.desai@gmers.edu.in', 'General Surgeon', depts.Surgery.id, floors.A_GF.id, 'CONSULTATION');
  await createDoctor('Amit Joshi', 'amit.joshi@gmers.edu.in', 'Pediatrician', depts.Pediatrics.id, floors.A_GF.id, 'CONSULTATION');
  const dOrtho = await createDoctor('Rajesh Patel', 'rajesh.patel@gmers.edu.in', 'Orthopedic Surgeon', depts.Orthopedics.id, floors.A_GF.id, 'CONSULTATION');
  await createDoctor('Anjali Mehta', 'anjali.mehta@gmers.edu.in', 'Ophthalmologist', depts.Ophtha.id, floors.A_FF.id, 'CONSULTATION');
  await createDoctor('Prakash Verma', 'prakash.verma@gmers.edu.in', 'ER Specialist', depts.Emergency.id, floors.B_GF.id, 'CONSULTATION');

  // Add the demo patient to Dr Rajesh Patel's queue
  await prisma.queueEntry.create({
    data: {
      queueId: dOrtho.queue.id,
      patientId: patientUser.patient!.id,
      tokenNumber: 13,
      status: 'WAITING',
    }
  });

  // ─── MAP NAVIGATION NODES (Based on the GMERS Layout image) ───
  // Scale: 1000x800 approx
  const createNode = (label: string, type: any, x: number, y: number, floorId: string, deptId: string | null = null) => {
    return prisma.navigationNode.create({ data: { floorId, departmentId: deptId, x, y, nodeType: type, label } });
  };

  const nMainGate = await createNode('Main Entrance (Patient Entry)', 'ENTRANCE', 500, 700, floors.A_GF.id);
  const nCourtyard = await createNode('Central Courtyard', 'INTERSECTION', 500, 400, floors.A_GF.id);
  
  // Facilities from JSON
  const nInfoDesk = await createNode('Information Desk', 'DEPARTMENT', 500, 680, floors.A_GF.id);
  const nParking = await createNode('South Campus Parking', 'DEPARTMENT', 400, 750, floors.A_GF.id);
  const nCafeteria = await createNode('Cafeteria', 'DEPARTMENT', 600, 750, floors.A_GF.id);

  // Block A (OPD)
  const nBlockAEntry = await createNode('Block A Entrance', 'ENTRANCE', 300, 400, floors.A_GF.id);
  const nRegistration = await createNode('Registration & Enquiry', 'DEPARTMENT', 200, 450, floors.A_GF.id);
  const nGenMed = await createNode('OPD General Medicine', 'DEPARTMENT', 250, 400, floors.A_GF.id, depts.GenMed.id);
  const nPediatrics = await createNode('OPD Pediatrics', 'DEPARTMENT', 200, 350, floors.A_GF.id, depts.Pediatrics.id);
  
  // Block B (Emergency)
  const nEmergencyGate = await createNode('Emergency Entry (Ambulance)', 'EMERGENCY', 700, 700, floors.B_GF.id);
  const nBlockBEntry = await createNode('Block B Entrance', 'ENTRANCE', 700, 400, floors.B_GF.id);
  const nCasualty = await createNode('Casualty / Emergency Dept', 'DEPARTMENT', 750, 400, floors.B_GF.id, depts.Emergency.id);
  
  // Block C (Wards)
  const nBlockCEntry = await createNode('Block C Wards', 'ENTRANCE', 500, 200, floors.C_SF.id);

  // Lifts & Stairs (Facilities)
  const nLiftA = await createNode('Lift Block A', 'ELEVATOR', 200, 380, floors.A_GF.id);
  const nStairsA = await createNode('Stairs Block A', 'STAIRS', 220, 380, floors.A_GF.id);

  // Edges
  const edge = (from: any, to: any, dist: number, emergency: boolean = false) => {
    return prisma.navigationEdge.create({ data: { fromNodeId: from.id, toNodeId: to.id, distance: dist, bidirectional: true, isEmergencyRoute: emergency } });
  };

  await edge(nMainGate, nInfoDesk, 20);
  await edge(nInfoDesk, nCourtyard, 80);
  await edge(nMainGate, nParking, 100);
  await edge(nMainGate, nCafeteria, 100);
  await edge(nCourtyard, nBlockAEntry, 80);
  await edge(nBlockAEntry, nRegistration, 20);
  await edge(nRegistration, nGenMed, 30);
  await edge(nRegistration, nPediatrics, 40);
  
  await edge(nCourtyard, nBlockBEntry, 80);
  await edge(nEmergencyGate, nCasualty, 50, true);
  await edge(nBlockBEntry, nCasualty, 30);
  
  await edge(nCourtyard, nBlockCEntry, 120);

  console.log('✅ GMERS Medical College database seeding complete!');
  console.log(`
--- GMERS Demo Accounts ---
Admin: admin@gmers.edu.in / Admin@123
Doctor (Ortho): rajesh.patel@gmers.edu.in / Doctor@123
Patient: rahul.patel@patient.com / Patient@123
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
