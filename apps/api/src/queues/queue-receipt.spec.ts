import assert from 'node:assert/strict';
import { buildQueueReceipt } from './queues.service';

const receipt = buildQueueReceipt({
  tokenNumber: 12,
  currentNumber: 7,
  waitingCount: 5,
  averageConsultationTime: 15,
  createdAt: new Date('2026-09-16T10:00:00Z'),
  patientName: 'John Doe',
  doctorName: 'Dr. Jane Smith',
  departmentName: 'Cardiology',
  roomNumber: 'A-104',
});

assert.equal(receipt.tokenNumber, 12);
assert.match(receipt.receiptId, /^RCPT-/);
assert.equal(receipt.estimatedWaitMinutes, 75);
assert.equal(receipt.doctorName, 'Dr. Jane Smith');

console.log('queue receipt test passed');
