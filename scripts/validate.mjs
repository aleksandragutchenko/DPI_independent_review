import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.argv.includes('--dist') ? path.join(root, 'dist') : path.join(root, 'src');
const parse = async file => JSON.parse(await readFile(path.join(base, file), 'utf8'));
const site = await parse('assets/site-data.json');
const submission = await parse('submission.json');
const expectedIds = Array.from({ length: 100 }, (_, i) => `D${String(i + 1).padStart(3, '0')}`);
const ids = site.decisions.map(item => item.id);
const submissionIds = submission.decisions.map(item => item.id);
const routes = ['', 'decisions', 'review', 'profit-and-loss', 'cash-flow', 'balance-sheet', 'schedules', 'reconciliations', 'opening-balances'];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(JSON.stringify(ids) === JSON.stringify(expectedIds), 'Site decision IDs are not exactly D001-D100 in order.');
assert(new Set(ids).size === 100, 'Site decision IDs are not unique.');
assert(JSON.stringify(submissionIds) === JSON.stringify(expectedIds), 'Submission decision IDs are not exactly D001-D100 in order.');
assert(new Set(submissionIds).size === 100, 'Submission decision IDs are not unique.');
assert(site.decisions.filter(item => item.tier === 'operational').length === 75, 'Operational decision count is not 75.');
assert(site.decisions.filter(item => item.tier === 'material_judgment').length === 25, 'Material judgment count is not 25.');
assert(submission.decisions.filter(item => item.reviewTier === 'operational').length === 75, 'Submission operational count is not 75.');
assert(submission.decisions.filter(item => item.reviewTier === 'material_judgment').length === 25, 'Submission material count is not 25.');
assert(site.decisions.filter(item => item.tier === 'material_judgment').every(item => item.studentFinalAnswer), 'A material judgment is missing a student final answer.');
assert(site.decisions.filter(item => item.tier === 'material_judgment').every(item => item.studentReasoning || item.reasoningEmbedded), 'A material judgment has neither separate nor embedded reasoning.');
assert(site.decisions.filter(item => item.tier === 'material_judgment').every(item => item.studentReasoning && !/reasoning.*included|included.*final answer/i.test(item.studentReasoning)), 'A material judgment has missing or generic reasoning.');
assert(JSON.stringify(site.rows['Profit and Loss']) === JSON.stringify(submission.statements.profitAndLoss), 'Profit and Loss differs between site data and submission.');
assert(JSON.stringify(site.rows['Cash Flow']) === JSON.stringify(submission.statements.cashFlow), 'Cash Flow differs between site data and submission.');
assert(JSON.stringify(site.rows['Balance Sheet']) === JSON.stringify(submission.statements.balanceSheet), 'Balance Sheet differs between site data and submission.');
assert(site.summary.material === 25 && site.validation.materialCount === 25, 'Review summary material count is not 25.');
assert(!site.decisions.some(item => item.tier === 'operational' && (item.studentFinalAnswer || item.studentReasoning)), 'Operational decisions should not require student review fields.');
assert(site.decisions.find(item => item.id === 'D048').studentFinalAnswer.includes('€405,000'), 'D048 does not use €405,000 materials consumed.');
assert(site.decisions.find(item => item.id === 'D075').studentFinalAnswer.includes('€112,000 net closing inventory'), 'D075 does not select €112,000 inventory.');
assert(site.decisions.find(item => item.id === 'D075').studentFinalAnswer.includes('€121,000 amount is disclosed as an alternative'), 'D075 does not disclose the €121,000 alternative.');
assert(site.summary.netProfit === 65000 && site.summary.totalAssets === 531000 && site.summary.closingEquity === 125000, 'Summary figures do not match the approved treatment.');
assert(site.validation.balanceSheetDifference === 0 && site.validation.equityRollForwardDifference === 0, 'Financial statements do not reconcile.');
assert(site.validation.cashReconciliationDifference === 0 && site.validation.cashFlowClosingCash === 60000, 'Cash Flow does not reconcile to closing bank cash.');
assert(site.validation.payrollClosingPayable === 32000 && site.validation.payrollReconciliationDifference === 0, 'Payroll payable does not reconcile to €32,000.');
assert(site.validation.disposalProvisionRecognized === 0 && site.validation.disposalQuoteDisclosed === 2000, 'Disposal quote treatment is inconsistent.');
assert(site.validation.materialEffectEquationFailures.length === 0, 'A material decision effect fails the accounting equation.');
assert(site.decisions.find(item => item.id === 'D043').effects.assets === 0 && site.decisions.find(item => item.id === 'D043').effects.ppe === 60000, 'D043 purchase effects are incorrect.');
assert(site.decisions.find(item => item.id === 'D044').effects.assets === 0 && site.decisions.find(item => item.id === 'D044').effects.ppe === 20000, 'D044 purchase effects are incorrect.');
assert(site.decisions.find(item => item.id === 'D049').effects.assets === -75000 && site.decisions.find(item => item.id === 'D049').effects.liabilities === 5000, 'D049 payroll effects are incorrect.');
assert(['D058','D072'].every(id => site.decisions.find(item => item.id === id).effects.profit === -22000 && site.decisions.find(item => item.id === id).effects.liabilities === 0), 'Damaged-stock decisions do not use the no-provision treatment.');
assert(submission.student.name === 'Gutčenko Aleksandra' && submission.student.id === 'ag25162@edu.lu.lv', 'Student identification is incomplete.');
assert(submission.certification?.status === 'personally reviewed and certified' && submission.certification?.date === '2026-09-23' && submission.certification?.statement, 'Student certification is incomplete.');
for (const route of routes) await access(path.join(base, route, 'index.html'));

console.log(JSON.stringify({
  validatedDirectory: base,
  decisionIds: 100,
  operational: 75,
  materialJudgments: 25,
  materialStudentAnswers: 25,
  separateReasoningFields: site.decisions.filter(item => item.tier === 'material_judgment' && item.studentReasoning).length,
  embeddedReasoningAccepted: site.decisions.filter(item => item.tier === 'material_judgment' && item.reasoningEmbedded).length,
  worksheetRoutes: routes.length - 1,
  jsonValid: true
  ,approvedInventory: 112000
  ,alternativePhysicalCount: 121000
  ,netProfit: 65000
  ,totalAssets: 531000
  ,totalLiabilities: 406000
  ,closingEquity: 125000
  ,balanceSheetDifference: 0
  ,equityRollForwardDifference: 0
  ,closingCash: 60000
  ,payrollClosingPayable: 32000
  ,disposalProvisionRecognized: 0
  ,materialEffectEquationFailures: 0
  ,studentCertificationComplete: true
}, null, 2));
