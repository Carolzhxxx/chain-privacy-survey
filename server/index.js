import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(projectRoot, 'data');
const sessionDir = path.join(dataDir, 'sessions');
const assignmentStatePath = path.join(dataDir, 'item_assignment_state.json');
const relationshipStatePath = path.join(dataDir, 'relationship_assignment_state.json');
const participantAssignDir = path.join(dataDir, 'participant_assignments');
const port = Number(process.env.PORT ?? 5002);
const host = process.env.HOST ?? '0.0.0.0';
const exportToken = process.env.EXPORT_TOKEN ?? '';

fs.mkdirSync(sessionDir, { recursive: true });
fs.mkdirSync(participantAssignDir, { recursive: true });

const exportModulePath = pathToFileURL(
  path.join(projectRoot, 'src', 'lib', 'surveyExport.js'),
).href;
const assignmentModulePath = pathToFileURL(
  path.join(projectRoot, 'src', 'lib', 'itemAssignment.js'),
).href;

const { exportLongCsv, exportScenarioCsv, exportWideCsv } = await import(
  exportModulePath
);
const {
  buildScenarioAssignments,
  CATEGORY_COUNT,
  createEmptyAssignmentState,
  drawItems,
} = await import(assignmentModulePath);
const {
  buildRelationshipAssignment,
  createEmptyRelationshipState,
  isValidRelationshipAssignment,
} = await import(
  pathToFileURL(path.join(projectRoot, 'src', 'lib', 'relationshipAssignment.js')).href
);
const { countAssignments, pickBalancedItems, pickBalancedRelationship } = await import(
  pathToFileURL(path.join(projectRoot, 'src', 'lib', 'balancedAssignment.js')).href
);

function readRelationshipState() {
  try {
    if (!fs.existsSync(relationshipStatePath)) {
      return createEmptyRelationshipState();
    }
    return JSON.parse(fs.readFileSync(relationshipStatePath, 'utf8'));
  } catch {
    return createEmptyRelationshipState();
  }
}

const randomBelow = (max) => crypto.randomInt(0, max);

/** Every stored assignment with its session (if any), for balancing. */
function currentCounts() {
  const entries = fs
    .readdirSync(participantAssignDir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => {
      try {
        const assignment = JSON.parse(fs.readFileSync(path.join(participantAssignDir, name), 'utf8'));
        const file = sessionPath(assignment.participant_id ?? name.replace(/\.json$/, ''));
        const session = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
        return { assignment, session };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  return countAssignments(entries, Date.now());
}

function assignBalancedRelationship() {
  return buildRelationshipAssignment(
    pickBalancedRelationship(currentCounts(), randomBelow),
    'server_completion_balanced',
  );
}

function sessionPath(participantId) {
  const safe = String(participantId).replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(sessionDir, `${safe}.json`);
}

function readAssignmentState() {
  try {
    if (!fs.existsSync(assignmentStatePath)) {
      return createEmptyAssignmentState();
    }
    return JSON.parse(fs.readFileSync(assignmentStatePath, 'utf8'));
  } catch {
    return createEmptyAssignmentState();
  }
}

function writeAssignmentState(state) {
  fs.writeFileSync(assignmentStatePath, `${JSON.stringify(state, null, 2)}\n`);
}

function participantAssignPath(participantId) {
  const safe = String(participantId).replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(participantAssignDir, `${safe}.json`);
}

function readParticipantAssignment(participantId) {
  if (!participantId) return null;
  const file = participantAssignPath(participantId);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function writeParticipantAssignment(participantId, payload) {
  if (!participantId) return;
  fs.writeFileSync(
    participantAssignPath(participantId),
    `${JSON.stringify(payload, null, 2)}\n`,
  );
}

function readAllSessions() {
  if (!fs.existsSync(sessionDir)) return [];
  return fs
    .readdirSync(sessionDir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => {
      try {
        return JSON.parse(
          fs.readFileSync(path.join(sessionDir, name), 'utf8'),
        );
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function requireExportAuth(request, response) {
  if (!exportToken) {
    response
      .status(503)
      .json({ error: 'EXPORT_TOKEN is not configured on the server.' });
    return false;
  }
  const header = request.get('x-export-token') ?? '';
  const query = request.query.token ?? '';
  if (header !== exportToken && query !== exportToken) {
    response.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

const app = express();
app.use(express.json({ limit: '1mb' }));

app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, x-export-token',
  );
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }
  next();
});

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, service: 'chain-privacy-survey' });
});

/**
 * Completion-balanced assignment (src/lib/balancedAssignment.js) of the
 * participant's information items (one per category) and relationship
 * structure (A–B, A–C, A–D, B–C, C–D). Stored once and returned unchanged on
 * repeat requests (refresh, back navigation).
 */
app.post('/api/assign-items', (request, response) => {
  const body = request.body ?? {};
  const participantId = body.participant_id;
  const n = Number.isInteger(body.n) && body.n >= 1 && body.n <= CATEGORY_COUNT ? body.n : 1;
  const studyMode = body.study_mode === 'formal' ? 'formal' : 'pilot';
  if (!participantId) {
    response.status(400).json({ error: 'participant_id required' });
    return;
  }

  const existing = readParticipantAssignment(participantId);
  if (Array.isArray(existing?.scenarios) && existing.scenarios.length === n) {
    if (isValidRelationshipAssignment(existing.relationship)) {
      response.json({ ok: true, ...existing, reused: true });
      return;
    }
    // Assigned before relationship structures existed: keep the items, add a structure.
    const updated = { ...existing, relationship: assignBalancedRelationship() };
    writeParticipantAssignment(participantId, updated);
    response.json({ ok: true, ...updated, reused: true });
    return;
  }

  let scenarios;
  if (n === CATEGORY_COUNT) {
    const picks = pickBalancedItems(currentCounts(), randomBelow);
    scenarios = buildScenarioAssignments(picks, participantId, 'server_completion_balanced');
  } else {
    const { picks, state } = drawItems(readAssignmentState(), n, () =>
      crypto.randomInt(0, 0xffffffff),
    );
    writeAssignmentState(state);
    scenarios = buildScenarioAssignments(picks, participantId, 'server_block');
  }

  const payload = {
    ok: true,
    participant_id: participantId,
    study_mode: studyMode,
    scenarios,
    relationship: assignBalancedRelationship(),
    assigned_at: new Date().toISOString(),
  };
  writeParticipantAssignment(participantId, payload);
  response.json(payload);
});

/** Items and relationship structures handed out so far. */
app.get('/api/assignment-counts', (request, response) => {
  if (!requireExportAuth(request, response)) return;
  const items = {};
  const categories = {};
  const relationshipStructures = {};
  const relationFactors = {};
  for (const file of fs.readdirSync(participantAssignDir)) {
    if (!file.endsWith('.json')) continue;
    try {
      const saved = JSON.parse(fs.readFileSync(path.join(participantAssignDir, file), 'utf8'));
      for (const s of saved.scenarios ?? []) {
        items[s.information_item_id] = (items[s.information_item_id] ?? 0) + 1;
        categories[s.information_category] = (categories[s.information_category] ?? 0) + 1;
      }
      if (isValidRelationshipAssignment(saved.relationship)) {
        const structureId = saved.relationship.relationship_structure_id;
        relationshipStructures[structureId] = (relationshipStructures[structureId] ?? 0) + 1;
        for (const field of [
          'owner_b_relation_condition',
          'owner_c_relation_condition',
          'owner_d_relation_condition',
          'bc_relation_condition',
          'cd_relation_condition',
        ]) {
          const level = saved.relationship[field];
          relationFactors[field] ??= {};
          relationFactors[field][level] = (relationFactors[field][level] ?? 0) + 1;
        }
      }
    } catch {
      // skip unreadable file
    }
  }
  response.json({
    items,
    categories,
    relation_factors: relationFactors,
    relationship_structures: relationshipStructures,
    state: readAssignmentState(),
    relationship_state: readRelationshipState(),
    balancing_counts: currentCounts(),
  });
});

app.post('/api/sessions/draft', (request, response) => {
  const body = request.body ?? {};
  const participantId = body.participant_id;
  if (!participantId) {
    response.status(400).json({ error: 'participant_id required' });
    return;
  }

  const file = sessionPath(participantId);
  if (fs.existsSync(file)) {
    try {
      const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (existing.status === 'completed' || existing.submitted) {
        response.status(409).json({ error: 'Session already completed' });
        return;
      }
    } catch {
      // overwrite corrupt draft
    }
  }

  const record = {
    ...body,
    status: 'in_progress',
    submitted: false,
    updated_at: new Date().toISOString(),
  };
  fs.writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`);
  response.json({ ok: true, participant_id: participantId });
});

app.post('/api/sessions', (request, response) => {
  const body = request.body ?? {};
  const participantId = body.participant_id;
  if (!participantId) {
    response.status(400).json({ error: 'participant_id required' });
    return;
  }

  const file = sessionPath(participantId);
  if (fs.existsSync(file)) {
    try {
      const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (existing.status === 'completed' || existing.submitted) {
        response.status(409).json({
          error: 'Duplicate submission',
          participant_id: participantId,
        });
        return;
      }
    } catch {
      // continue and overwrite
    }
  }

  const record = {
    ...body,
    status: 'completed',
    submitted: true,
    saved_at: new Date().toISOString(),
  };
  fs.writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`);
  response.json({ ok: true, participant_id: participantId });
});

app.get('/api/export/wide.csv', (request, response) => {
  if (!requireExportAuth(request, response)) return;
  const completed = readAllSessions().filter(
    (s) => s.status === 'completed' || s.submitted,
  );
  const csv = exportWideCsv(completed);
  response.setHeader('Content-Type', 'text/csv; charset=utf-8');
  response.setHeader(
    'Content-Disposition',
    'attachment; filename="chain_privacy_wide.csv"',
  );
  response.send(csv);
});

app.get('/api/export/long.csv', (request, response) => {
  if (!requireExportAuth(request, response)) return;
  const completed = readAllSessions().filter(
    (s) => s.status === 'completed' || s.submitted,
  );
  const csv = exportLongCsv(completed);
  response.setHeader('Content-Type', 'text/csv; charset=utf-8');
  response.setHeader(
    'Content-Disposition',
    'attachment; filename="chain_privacy_long.csv"',
  );
  response.send(csv);
});

app.get('/api/export/scenarios.csv', (request, response) => {
  if (!requireExportAuth(request, response)) return;
  const completed = readAllSessions().filter(
    (s) => s.status === 'completed' || s.submitted,
  );
  const csv = exportScenarioCsv(completed);
  response.setHeader('Content-Type', 'text/csv; charset=utf-8');
  response.setHeader(
    'Content-Disposition',
    'attachment; filename="chain_privacy_scenarios.csv"',
  );
  response.send(csv);
});

app.get('/api/sessions', (request, response) => {
  if (!requireExportAuth(request, response)) return;
  response.json(readAllSessions());
});

const distDir = path.join(projectRoot, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/.*/, (_request, response) => {
    response.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(port, host, () => {
  console.log(`chain-privacy-survey listening on http://${host}:${port}`);
  console.log(`sessions directory: ${sessionDir}`);
  console.log(`item assignment state: ${assignmentStatePath}`);
  console.log(`relationship assignment state: ${relationshipStatePath}`);
});
