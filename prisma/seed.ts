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

  // ─── MAP NAVIGATION NODES (Exhaustive Vector SVG Map) ───
  // Scale: 1000x1200
  const createNode = (label: string, type: any, x: number, y: number, floorId: string, deptId: string | null = null) => {
    return prisma.navigationNode.create({ data: { floorId, departmentId: deptId, x, y, nodeType: type, label } });
  };

  // Main Entrances & Corridors
  const nMainLobby = await createNode('East Entrance / Main Lobby', 'ENTRANCE', 350, 1050, floors.A_GF.id);
  const nCorrSouth = await createNode('South Corridor Intersection', 'INTERSECTION', 350, 900, floors.A_GF.id);
  const nCorrMid = await createNode('Central Corridor Intersection', 'INTERSECTION', 350, 750, floors.A_GF.id);
  const nCorrNorth = await createNode('North Corridor Intersection', 'INTERSECTION', 350, 460, floors.A_GF.id);
  const nCorrRehab = await createNode('Rehab Corridor Intersection', 'INTERSECTION', 350, 325, floors.A_GF.id);
  const nCorrRightEast = await createNode('East Clinic Corridor', 'INTERSECTION', 680, 750, floors.A_GF.id);
  
  // Left Wing (Emergency)
  const nEmergency = await createNode('Emergency Department', 'EMERGENCY', 225, 1025, floors.B_GF.id, depts.Emergency.id);
  const nUrgentCare = await createNode('Urgent Care Check-In (A)', 'DEPARTMENT', 250, 775, floors.B_GF.id);

  // Central Core
  const nAdmitting = await createNode('Admitting / Registration', 'DEPARTMENT', 525, 1050, floors.A_GF.id);
  const nLab = await createNode('Laboratory', 'DEPARTMENT', 525, 960, floors.A_GF.id);
  const nPharmacy = await createNode('Pharmacy', 'DEPARTMENT', 525, 880, floors.A_GF.id);
  const nCardio = await createNode('Cardiovascular Center (B)', 'DEPARTMENT', 500, 725, floors.A_GF.id);
  const nXray = await createNode('Radiology X-Ray (C)', 'DEPARTMENT', 300, 690, floors.A_GF.id, depts.Radiodiagnosis.id);

  // Rehab Wing (Top Left)
  const nRehabElevators = await createNode('Rehab Elevators', 'ELEVATOR', 300, 325, floors.C_SF.id);
  const nM = await createNode('PT Exercise Gym (M)', 'DEPARTMENT', 190, 460, floors.A_GF.id);
  const nN = await createNode('Wound Clinic (N)', 'DEPARTMENT', 190, 560, floors.A_GF.id);
  const nKL = await createNode('PT / OT Gym (K, L)', 'DEPARTMENT', 290, 460, floors.A_GF.id);
  const nF = await createNode('Thrombosis Center (F)', 'DEPARTMENT', 390, 560, floors.A_GF.id);
  const nGHI = await createNode('Rehab Psychology / Interventional Rad (G, H, I)', 'DEPARTMENT', 490, 540, floors.A_GF.id);

  // Right Wing (Outpatient Clinics)
  const nC9 = await createNode('ENT/Audiology Clinic (9)', 'DEPARTMENT', 790, 290, floors.A_GF.id, depts.ENT.id);
  const nC7 = await createNode('Dental Clinic (7)', 'DEPARTMENT', 790, 390, floors.A_GF.id, depts.Dentistry.id);
  const nC5 = await createNode('Surgery Clinic (5)', 'DEPARTMENT', 790, 490, floors.A_GF.id, depts.Surgery.id);
  const nC4 = await createNode('OB/GYN Clinic (4)', 'DEPARTMENT', 742, 590, floors.A_GF.id, depts.ObGyn.id);
  const nC6 = await createNode('Pediatrics Clinic (6)', 'DEPARTMENT', 837, 590, floors.A_GF.id, depts.Pediatrics.id);
  const nC3 = await createNode('Pulmonary Clinic (3)', 'DEPARTMENT', 790, 690, floors.A_GF.id, depts.TBChest.id);
  const nC2 = await createNode('Rheumatology Clinic (2)', 'DEPARTMENT', 790, 790, floors.A_GF.id, depts.Orthopedics.id);
  const nC1A = await createNode('Infectious Diseases (1A)', 'DEPARTMENT', 790, 890, floors.A_GF.id);
  const nC1 = await createNode('Internal Medicine (1)', 'DEPARTMENT', 790, 990, floors.A_GF.id, depts.GenMed.id);

  // Edges
  const edge = (from: any, to: any, dist: number, emergency: boolean = false) => {
    return prisma.navigationEdge.create({ data: { fromNodeId: from.id, toNodeId: to.id, distance: dist, bidirectional: true, isEmergencyRoute: emergency } });
  };

  // Main Spine Corridor
  await edge(nMainLobby, nCorrSouth, 150);
  await edge(nCorrSouth, nCorrMid, 150);
  await edge(nCorrMid, nCorrNorth, 290);
  await edge(nCorrNorth, nCorrRehab, 135);
  
  // Cross Corridors
  await edge(nCorrMid, nCorrRightEast, 330);
  
  // Lobby Connections
  await edge(nMainLobby, nEmergency, 125, true);
  await edge(nMainLobby, nAdmitting, 175);
  
  // South Corridor Connections
  await edge(nCorrSouth, nLab, 180);
  await edge(nCorrSouth, nPharmacy, 175);
  await edge(nCorrSouth, nUrgentCare, 160);

  // Mid Corridor Connections
  await edge(nCorrMid, nCardio, 150);
  await edge(nCorrMid, nXray, 70);

  // North Corridor Connections
  await edge(nCorrNorth, nKL, 60);
  await edge(nCorrNorth, nM, 160);
  await edge(nCorrNorth, nN, 190);
  await edge(nCorrNorth, nF, 110);
  await edge(nCorrNorth, nGHI, 160);

  // Rehab Corridor Connections
  await edge(nCorrRehab, nRehabElevators, 50);
  await edge(nCorrRehab, nC9, 440);

  // Outpatient Wing (Vertical spine on right)
  await edge(nCorrRightEast, nC2, 115);
  await edge(nCorrRightEast, nC3, 115);
  await edge(nC3, nC4, 110);
  await edge(nC3, nC6, 160);
  await edge(nC4, nC5, 110);
  await edge(nC5, nC7, 100);
  await edge(nC7, nC9, 100);
  
  await edge(nC2, nC1A, 100);
  await edge(nC1A, nC1, 100);

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
