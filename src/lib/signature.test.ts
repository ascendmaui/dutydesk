import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isSignatureValid,
  makeSignature,
  noteFingerprint,
  staffMarkFromSignature,
} from './signature.ts';
import type { Note } from './types.ts';

function createMockNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note_123',
    templateId: 'return-to-work',
    employeeId: 'emp_456',
    status: 'draft',
    diagnosis: 'Acute Upper Respiratory Infection',
    natureOfIllness: 'Viral syndrome',
    datesOfCare: '2026-09-30 to 2026-10-01',
    returnDate: '2026-10-02',
    workStatus: 'full-duty',
    comments: 'Patient is cleared for regular duty without limitations.',
    restrictions: '',
    absenceStart: '2026-09-30',
    absenceEnd: '2026-10-01',
    schoolName: '',
    author: 'Dr. Jane Smith, MD',
    authorTitle: 'Attending Physician',
    serviceDate: '2026-10-01',
    fin: 'FIN-88219',
    createdAt: '2026-10-01T12:00:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
    signature: undefined,
    ...overrides,
  };
}

test('signature verification: unsigned note is not valid', () => {
  const note = createMockNote();
  assert.equal(isSignatureValid(note), false);
});

test('signature verification: valid drawn signature', () => {
  const note = createMockNote();
  note.signature = makeSignature(note, {
    kind: 'drawn',
    imageDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  });

  assert.equal(isSignatureValid(note), true);
  assert.equal(note.signature.kind, 'drawn');
  assert.equal(note.signature.signerName, 'Dr. Jane Smith, MD');
});

test('signature verification: valid typed signature', () => {
  const note = createMockNote();
  note.signature = makeSignature(note, {
    kind: 'typed',
    typedName: '  Dr. Jane Smith, MD  ',
  });

  assert.equal(isSignatureValid(note), true);
  assert.equal(note.signature.kind, 'typed');
  assert.equal(note.signature.typedName, 'Dr. Jane Smith, MD');
});

test('tamper detection: modifying diagnosis invalidates signature', () => {
  const note = createMockNote();
  note.signature = makeSignature(note, {
    kind: 'typed',
    typedName: 'Dr. Jane Smith, MD',
  });
  assert.equal(isSignatureValid(note), true);

  // Modifying diagnosis must break the fingerprint match
  const tamperedNote = {
    ...note,
    diagnosis: 'Lumbar Strain',
  };
  assert.equal(isSignatureValid(tamperedNote), false);
});

test('tamper detection: modifying return date invalidates signature', () => {
  const note = createMockNote();
  note.signature = makeSignature(note, {
    kind: 'typed',
    typedName: 'Dr. Jane Smith, MD',
  });
  assert.equal(isSignatureValid(note), true);

  // Altering return date must break verification
  const tamperedNote = {
    ...note,
    returnDate: '2026-10-15',
  };
  assert.equal(isSignatureValid(tamperedNote), false);
});

test('tamper detection: modifying work status invalidates signature', () => {
  const note = createMockNote();
  note.signature = makeSignature(note, {
    kind: 'typed',
    typedName: 'Dr. Jane Smith, MD',
  });
  assert.equal(isSignatureValid(note), true);

  const tamperedNote: Note = {
    ...note,
    workStatus: 'light-duty',
  };
  assert.equal(isSignatureValid(tamperedNote), false);
});

test('signature verification: empty drawn signature is invalid', () => {
  const note = createMockNote();
  note.signature = {
    kind: 'drawn',
    imageDataUrl: '',
    signedAt: '2026-10-01T12:00:00Z',
    signerName: note.author,
    signerTitle: note.authorTitle,
    fingerprint: noteFingerprint(note),
  };
  assert.equal(isSignatureValid(note), false);
});

test('signature verification: empty or blank typed name is invalid', () => {
  const note = createMockNote();
  note.signature = {
    kind: 'typed',
    typedName: '    ',
    signedAt: '2026-10-01T12:00:00Z',
    signerName: note.author,
    signerTitle: note.authorTitle,
    fingerprint: noteFingerprint(note),
  };
  assert.equal(isSignatureValid(note), false);
});

test('staffMarkFromSignature: accurately converts note signature to staff mark', () => {
  const note = createMockNote();
  const sig = makeSignature(note, {
    kind: 'drawn',
    imageDataUrl: 'data:image/png;base64,sample',
  });
  const mark = staffMarkFromSignature(sig);
  assert.deepEqual(mark, {
    kind: 'drawn',
    imageDataUrl: 'data:image/png;base64,sample',
    typedName: undefined,
  });
});

test('tamper detection: exhaustive check across all clinical fields', () => {
  const clinicalFieldsToMutate: Array<[keyof Note, string]> = [
    ['employeeId', 'emp_999'],
    ['templateId', 'duty-restriction'],
    ['natureOfIllness', 'Bacterial infection'],
    ['datesOfCare', '2026-10-02 to 2026-10-03'],
    ['comments', 'Altered clearance notes.'],
    ['restrictions', 'No heavy lifting over 10 lbs.'],
    ['absenceStart', '2026-09-25'],
    ['absenceEnd', '2026-10-05'],
    ['schoolName', 'Clemson University'],
    ['author', 'Dr. John Doe, MD'],
    ['authorTitle', 'Chief Medical Officer'],
    ['serviceDate', '2026-10-05'],
    ['fin', 'FIN-00000'],
  ];

  for (const [field, tamperedVal] of clinicalFieldsToMutate) {
    const baseNote = createMockNote();
    baseNote.signature = makeSignature(baseNote, {
      kind: 'typed',
      typedName: 'Dr. Jane Smith, MD',
    });
    assert.equal(isSignatureValid(baseNote), true, `Base note should be valid before tampering ${field}`);

    const tamperedNote = {
      ...baseNote,
      [field]: tamperedVal,
    };
    assert.equal(
      isSignatureValid(tamperedNote),
      false,
      `Mutating ${field} must invalidate clinical signature`
    );
  }
});

