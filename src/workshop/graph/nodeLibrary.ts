/**
 * 固定節點庫：事件 / 條件 / 動作 / 流程 / 數值 / JS。
 *
 * 這一支是「節點能長成什麼樣」的唯一真相：畫布、檢視器、驗證器、codegen
 * 都從這裡讀埠與參數規格，不在各自的檔案裡另外列一份。
 * 節點 type 一旦發布就不可改名（存檔與 .ggmod 都靠它）。
 */
import type {
  GraphNodeSpec,
  GraphParamSpec,
  GraphParamValue,
  GraphPort,
} from './model';
import { GRAPH_STATE_FIELDS, GRAPH_STATUS_EFFECTS } from './model';
import type { ModScriptHook } from '@/types/modScript';

/* ---------------------------------------------------------------- 埠 */

const FLOW_IN: GraphPort = { id: 'in', kind: 'flow', labelKey: 'studio.graph.port.in' };
const FLOW_OUT: GraphPort = { id: 'out', kind: 'flow', labelKey: 'studio.graph.port.out' };
const COND_IN: GraphPort = { id: 'cond', kind: 'boolean', labelKey: 'studio.graph.port.cond' };
const NUM_VALUE: GraphPort = { id: 'value', kind: 'number', labelKey: 'studio.graph.port.value' };
const BOOL_VALUE: GraphPort = { id: 'value', kind: 'boolean', labelKey: 'studio.graph.port.value' };

function port(id: string, kind: GraphPort['kind'], labelKey: string): GraphPort {
  return { id, kind, labelKey };
}

/* -------------------------------------------------------------- 參數 */

function numberParam(
  key: string,
  labelKey: string,
  value: number,
  min = -1000000,
  max = 1000000,
  step = 1,
): GraphParamSpec {
  return { key, kind: 'number', labelKey, default: value, min, max, step };
}

function textParam(key: string, labelKey: string, value: string, placeholderKey?: string): GraphParamSpec {
  return placeholderKey
    ? { key, kind: 'text', labelKey, default: value, placeholderKey }
    : { key, kind: 'text', labelKey, default: value };
}

function selectParam(
  key: string,
  labelKey: string,
  value: string,
  options: readonly { value: string; labelKey: string }[],
): GraphParamSpec {
  return { key, kind: 'select', labelKey, default: value, options };
}

const COMPARE_OPTIONS = [
  { value: '>', labelKey: 'studio.graph.op.gt' },
  { value: '>=', labelKey: 'studio.graph.op.gte' },
  { value: '<', labelKey: 'studio.graph.op.lt' },
  { value: '<=', labelKey: 'studio.graph.op.lte' },
  { value: '===', labelKey: 'studio.graph.op.eq' },
  { value: '!==', labelKey: 'studio.graph.op.ne' },
] as const;

const STATE_FIELD_OPTIONS = GRAPH_STATE_FIELDS.map((field) => ({
  value: field,
  labelKey: 'studio.graph.state.' + field,
}));

const STATUS_OPTIONS = GRAPH_STATUS_EFFECTS.map((effect) => ({
  value: effect,
  labelKey: 'studio.graph.status.' + effect,
}));

/* ------------------------------------------------------------ 事件表 */

interface EventDefinition {
  type: string;
  hook: ModScriptHook;
}

/** 12 個 hook 一個都不能少（與 MOD_SCRIPT_HOOKS 對齊） */
const EVENT_NODE_TYPES: readonly EventDefinition[] = [
  { type: 'event.gameStart', hook: 'onGameStart' },
  { type: 'event.waveStart', hook: 'onWaveStart' },
  { type: 'event.waveClear', hook: 'onWaveClear' },
  { type: 'event.enemyKilled', hook: 'onEnemyKilled' },
  { type: 'event.towerPlaced', hook: 'onTowerPlaced' },
  { type: 'event.tick', hook: 'onTick' },
  { type: 'event.gameOver', hook: 'onGameOver' },
  { type: 'event.victory', hook: 'onVictory' },
  { type: 'event.towerSold', hook: 'onTowerSold' },
  { type: 'event.bossSpawn', hook: 'onBossSpawn' },
  { type: 'event.moneyChanged', hook: 'onMoneyChanged' },
  { type: 'event.enemyLeaked', hook: 'onEnemyLeaked' },
  { type: 'event.towerUpgraded', hook: 'onTowerUpgraded' },
  { type: 'event.enemySpawned', hook: 'onEnemySpawned' },
  { type: 'event.skillUsed', hook: 'onSkillUsed' },
  { type: 'event.bossKilled', hook: 'onBossKilled' },
  { type: 'event.wavePrepared', hook: 'onWavePrepared' },
];

function eventSpec(definition: EventDefinition): GraphNodeSpec {
  const suffix = definition.hook.slice(2);
  const labelKey = 'studio.graph.event.' + suffix.charAt(0).toLowerCase() + suffix.slice(1);
  return {
    type: definition.type,
    category: 'event',
    labelKey,
    descriptionKey: labelKey + '.desc',
    glyph: 'EV',
    hook: definition.hook,
    inputs: [],
    outputs: [FLOW_OUT],
    params: [],
  };
}

/* ------------------------------------------------------------ 節點庫 */

const CHANCE: GraphNodeSpec = {
  type: 'cond.chance',
  category: 'condition',
  labelKey: 'studio.graph.node.condChance',
  descriptionKey: 'studio.graph.node.condChance.desc',
  glyph: 'CH',
  inputs: [],
  outputs: [BOOL_VALUE],
  params: [numberParam('probability', 'studio.graph.param.probability', 0.25, 0, 1, 0.05)],
};

const COMPARE: GraphNodeSpec = {
  type: 'cond.compare',
  category: 'condition',
  labelKey: 'studio.graph.node.condCompare',
  descriptionKey: 'studio.graph.node.condCompare.desc',
  glyph: 'CP',
  inputs: [port('a', 'number', 'studio.graph.port.a'), port('b', 'number', 'studio.graph.port.b')],
  outputs: [BOOL_VALUE],
  params: [selectParam('op', 'studio.graph.param.op', '>', COMPARE_OPTIONS)],
};

const ENEMY_COUNT: GraphNodeSpec = {
  type: 'cond.enemyCount',
  category: 'condition',
  labelKey: 'studio.graph.node.condEnemyCount',
  descriptionKey: 'studio.graph.node.condEnemyCount.desc',
  glyph: 'EC',
  inputs: [],
  outputs: [BOOL_VALUE],
  params: [
    selectParam('op', 'studio.graph.param.op', '>=', COMPARE_OPTIONS),
    numberParam('count', 'studio.graph.param.count', 10, 0, 999),
  ],
};

const MONEY_COND: GraphNodeSpec = {
  type: 'cond.money',
  category: 'condition',
  labelKey: 'studio.graph.node.condMoney',
  descriptionKey: 'studio.graph.node.condMoney.desc',
  glyph: 'MC',
  inputs: [],
  outputs: [BOOL_VALUE],
  params: [
    selectParam('op', 'studio.graph.param.op', '>=', COMPARE_OPTIONS),
    numberParam('amount', 'studio.graph.param.amount', 100, 0, 99999),
  ],
};

const ACTION_SPECS: readonly GraphNodeSpec[] = [
  {
    type: 'action.addMoney',
    category: 'action',
    labelKey: 'studio.graph.node.addMoney',
    descriptionKey: 'studio.graph.node.addMoney.desc',
    glyph: '$$',
    inputs: [FLOW_IN, port('amount', 'number', 'studio.graph.param.amount')],
    outputs: [FLOW_OUT],
    params: [numberParam('amount', 'studio.graph.param.amount', 25, -99999, 99999)],
    permissions: ['economy'],
  },
  {
    type: 'action.damageBase',
    category: 'action',
    labelKey: 'studio.graph.node.damageBase',
    descriptionKey: 'studio.graph.node.damageBase.desc',
    glyph: 'DB',
    inputs: [FLOW_IN, port('amount', 'number', 'studio.graph.param.amount')],
    outputs: [FLOW_OUT],
    params: [numberParam('amount', 'studio.graph.param.amount', 1, 0, 9999)],
    permissions: ['base.health'],
  },
  {
    type: 'action.healBase',
    category: 'action',
    labelKey: 'studio.graph.node.healBase',
    descriptionKey: 'studio.graph.node.healBase.desc',
    glyph: 'HB',
    inputs: [FLOW_IN, port('amount', 'number', 'studio.graph.param.amount')],
    outputs: [FLOW_OUT],
    params: [numberParam('amount', 'studio.graph.param.amount', 1, 0, 9999)],
    permissions: ['base.health'],
  },
  {
    type: 'action.spawnEnemy',
    category: 'action',
    labelKey: 'studio.graph.node.spawnEnemy',
    descriptionKey: 'studio.graph.node.spawnEnemy.desc',
    glyph: 'EN',
    inputs: [FLOW_IN],
    outputs: [FLOW_OUT],
    params: [
      textParam('enemyType', 'studio.graph.param.enemyType', 'grunt', 'studio.graph.param.enemyType.hint'),
      numberParam('count', 'studio.graph.param.count', 3, 1, 50),
      numberParam('intervalMs', 'studio.graph.param.intervalMs', 200, 0, 10000, 50),
    ],
    permissions: ['enemy.spawn'],
  },
  {
    type: 'action.applyStatus',
    category: 'action',
    labelKey: 'studio.graph.node.applyStatus',
    descriptionKey: 'studio.graph.node.applyStatus.desc',
    glyph: 'ST',
    inputs: [FLOW_IN],
    outputs: [FLOW_OUT],
    params: [
      selectParam('effect', 'studio.graph.param.effect', 'slow', STATUS_OPTIONS),
      numberParam('durationMs', 'studio.graph.param.durationMs', 2000, 100, 60000, 100),
      numberParam('value', 'studio.graph.param.value', 0.35, 0, 100, 0.05),
      textParam('enemyType', 'studio.graph.param.targetEnemyType', '', 'studio.graph.param.enemyType.hint'),
    ],
    permissions: ['enemy.modify'],
  },
  {
    type: 'action.log',
    category: 'action',
    labelKey: 'studio.graph.node.log',
    descriptionKey: 'studio.graph.node.log.desc',
    glyph: 'LG',
    inputs: [FLOW_IN],
    outputs: [FLOW_OUT],
    params: [textParam('message', 'studio.graph.param.message', '', 'studio.graph.param.message.hint')],
    permissions: ['log'],
  },
  {
    type: 'action.setVar',
    category: 'action',
    labelKey: 'studio.graph.node.setVar',
    descriptionKey: 'studio.graph.node.setVar.desc',
    glyph: 'SV',
    inputs: [FLOW_IN, port('value', 'number', 'studio.graph.param.value')],
    outputs: [FLOW_OUT],
    params: [
      textParam('key', 'studio.graph.param.storeKey', 'counter', 'studio.graph.param.storeKey.hint'),
      numberParam('value', 'studio.graph.param.value', 0, -999999, 999999),
    ],
    permissions: ['storage'],
  },
  {
    type: 'action.addVar',
    category: 'action',
    labelKey: 'studio.graph.node.addVar',
    descriptionKey: 'studio.graph.node.addVar.desc',
    glyph: 'AV',
    inputs: [FLOW_IN, port('delta', 'number', 'studio.graph.param.delta')],
    outputs: [FLOW_OUT],
    params: [
      textParam('key', 'studio.graph.param.storeKey', 'counter', 'studio.graph.param.storeKey.hint'),
      numberParam('delta', 'studio.graph.param.delta', 1, -999999, 999999),
    ],
    permissions: ['storage'],
  },
];

const FLOW_SPECS: readonly GraphNodeSpec[] = [
  {
    type: 'flow.if',
    category: 'flow',
    labelKey: 'studio.graph.node.if',
    descriptionKey: 'studio.graph.node.if.desc',
    glyph: 'IF',
    inputs: [FLOW_IN, COND_IN],
    outputs: [
      port('then', 'flow', 'studio.graph.port.then'),
      port('else', 'flow', 'studio.graph.port.else'),
    ],
    params: [],
  },
  {
    type: 'flow.sequence',
    category: 'flow',
    labelKey: 'studio.graph.node.sequence',
    descriptionKey: 'studio.graph.node.sequence.desc',
    glyph: 'SQ',
    inputs: [FLOW_IN],
    outputs: [
      port('first', 'flow', 'studio.graph.port.first'),
      port('second', 'flow', 'studio.graph.port.second'),
      port('third', 'flow', 'studio.graph.port.third'),
    ],
    params: [],
  },
  {
    type: 'flow.throttle',
    category: 'flow',
    labelKey: 'studio.graph.node.throttle',
    descriptionKey: 'studio.graph.node.throttle.desc',
    glyph: 'TH',
    inputs: [FLOW_IN],
    outputs: [FLOW_OUT],
    params: [numberParam('intervalMs', 'studio.graph.param.intervalMs', 500, 0, 60000, 50)],
    permissions: ['storage'],
  },
  {
    type: 'flow.loop',
    category: 'flow',
    labelKey: 'studio.graph.node.loop',
    descriptionKey: 'studio.graph.node.loop.desc',
    glyph: 'LP',
    inputs: [FLOW_IN],
    outputs: [port('body', 'flow', 'studio.graph.port.body')],
    params: [numberParam('count', 'studio.graph.param.times', 3, 1, 50)],
  },
];

const VALUE_SPECS: readonly GraphNodeSpec[] = [
  {
    type: 'num.literal',
    category: 'value',
    labelKey: 'studio.graph.node.literal',
    descriptionKey: 'studio.graph.node.literal.desc',
    glyph: '#',
    inputs: [],
    outputs: [NUM_VALUE],
    params: [numberParam('value', 'studio.graph.param.value', 1, -999999, 999999, 1)],
  },
  {
    type: 'num.add',
    category: 'value',
    labelKey: 'studio.graph.node.add',
    descriptionKey: 'studio.graph.node.add.desc',
    glyph: '+',
    inputs: [port('a', 'number', 'studio.graph.port.a'), port('b', 'number', 'studio.graph.port.b')],
    outputs: [NUM_VALUE],
    params: [],
  },
  {
    type: 'num.sub',
    category: 'value',
    labelKey: 'studio.graph.node.sub',
    descriptionKey: 'studio.graph.node.sub.desc',
    glyph: '-',
    inputs: [port('a', 'number', 'studio.graph.port.a'), port('b', 'number', 'studio.graph.port.b')],
    outputs: [NUM_VALUE],
    params: [],
  },
  {
    type: 'num.mul',
    category: 'value',
    labelKey: 'studio.graph.node.mul',
    descriptionKey: 'studio.graph.node.mul.desc',
    glyph: '*',
    inputs: [port('a', 'number', 'studio.graph.port.a'), port('b', 'number', 'studio.graph.port.b')],
    outputs: [NUM_VALUE],
    params: [],
  },
  {
    type: 'num.div',
    category: 'value',
    labelKey: 'studio.graph.node.div',
    descriptionKey: 'studio.graph.node.div.desc',
    glyph: '/',
    inputs: [port('a', 'number', 'studio.graph.port.a'), port('b', 'number', 'studio.graph.port.b')],
    outputs: [NUM_VALUE],
    params: [],
  },
  {
    type: 'num.state',
    category: 'value',
    labelKey: 'studio.graph.node.stateField',
    descriptionKey: 'studio.graph.node.stateField.desc',
    glyph: 'SF',
    inputs: [],
    outputs: [NUM_VALUE],
    params: [selectParam('field', 'studio.graph.param.field', 'wave', STATE_FIELD_OPTIONS)],
    permissions: ['state.read'],
  },
  {
    type: 'num.var',
    category: 'value',
    labelKey: 'studio.graph.node.storeVar',
    descriptionKey: 'studio.graph.node.storeVar.desc',
    glyph: 'VR',
    inputs: [],
    outputs: [NUM_VALUE],
    params: [textParam('key', 'studio.graph.param.storeKey', 'counter', 'studio.graph.param.storeKey.hint')],
    permissions: ['storage', 'state.read'],
  },
  {
    type: 'num.random',
    category: 'value',
    labelKey: 'studio.graph.node.random',
    descriptionKey: 'studio.graph.node.random.desc',
    glyph: 'RN',
    inputs: [],
    outputs: [NUM_VALUE],
    params: [
      numberParam('min', 'studio.graph.param.min', 0, 0, 999999),
      numberParam('max', 'studio.graph.param.max', 10, 0, 999999),
    ],
  },
];

/* ------------------------------------------------- 第二輪新增節點
 *
 * 這一整批都是「純 UI／編譯」：只讀 ModScriptStateSnapshot、只用既有 7 種指令，
 * 不需要動執行期、不需要新權限（除了變數讀寫沿用 storage）。
 */

const BOOL_A = port('a', 'boolean', 'studio.graph.port.a');
const BOOL_B = port('b', 'boolean', 'studio.graph.port.b');
const NUM_A = port('a', 'number', 'studio.graph.port.a');
const NUM_B = port('b', 'number', 'studio.graph.port.b');

const AND_SPEC: GraphNodeSpec = {
  type: 'cond.and',
  category: 'condition',
  labelKey: 'studio.graph.node.condAnd',
  descriptionKey: 'studio.graph.node.condAnd.desc',
  glyph: '&&',
  inputs: [BOOL_A, BOOL_B],
  outputs: [BOOL_VALUE],
  params: [],
};

const OR_SPEC: GraphNodeSpec = {
  type: 'cond.or',
  category: 'condition',
  labelKey: 'studio.graph.node.condOr',
  descriptionKey: 'studio.graph.node.condOr.desc',
  glyph: '||',
  inputs: [BOOL_A, BOOL_B],
  outputs: [BOOL_VALUE],
  params: [],
};

const NOT_SPEC: GraphNodeSpec = {
  type: 'cond.not',
  category: 'condition',
  labelKey: 'studio.graph.node.condNot',
  descriptionKey: 'studio.graph.node.condNot.desc',
  glyph: '!',
  inputs: [BOOL_A],
  outputs: [BOOL_VALUE],
  params: [],
};

/** 讀快照的條件：門檻比對一律「運算子 + 數值」兩個參數 */
function thresholdParams(valueKey: string, labelKey: string, value: number, min: number, max: number): GraphParamSpec[] {
  return [
    selectParam('op', 'studio.graph.param.op', '>=', COMPARE_OPTIONS),
    numberParam(valueKey, labelKey, value, min, max),
  ];
}

const STATE_COND_SPECS: readonly GraphNodeSpec[] = [
  {
    type: 'cond.wave',
    category: 'condition',
    labelKey: 'studio.graph.node.condWave',
    descriptionKey: 'studio.graph.node.condWave.desc',
    glyph: 'WV',
    inputs: [],
    outputs: [BOOL_VALUE],
    params: thresholdParams('value', 'studio.graph.param.wave', 3, 1, 999),
  },
  {
    type: 'cond.health',
    category: 'condition',
    labelKey: 'studio.graph.node.condHealth',
    descriptionKey: 'studio.graph.node.condHealth.desc',
    glyph: 'HP',
    inputs: [],
    outputs: [BOOL_VALUE],
    params: thresholdParams('value', 'studio.graph.param.health', 10, 0, 9999),
  },
  {
    type: 'cond.towerCount',
    category: 'condition',
    labelKey: 'studio.graph.node.condTowerCount',
    descriptionKey: 'studio.graph.node.condTowerCount.desc',
    glyph: 'TC',
    inputs: [],
    outputs: [BOOL_VALUE],
    params: thresholdParams('value', 'studio.graph.param.count', 5, 0, 999),
  },
  {
    type: 'cond.elapsed',
    category: 'condition',
    labelKey: 'studio.graph.node.condElapsed',
    descriptionKey: 'studio.graph.node.condElapsed.desc',
    glyph: 'TM',
    inputs: [],
    outputs: [BOOL_VALUE],
    params: thresholdParams('seconds', 'studio.graph.param.seconds', 60, 0, 99999),
  },
  {
    type: 'cond.enemyType',
    category: 'condition',
    labelKey: 'studio.graph.node.condEnemyType',
    descriptionKey: 'studio.graph.node.condEnemyType.desc',
    glyph: 'ET',
    inputs: [],
    outputs: [BOOL_VALUE],
    params: [
      textParam('enemyType', 'studio.graph.param.enemyType', 'grunt'),
      selectParam('op', 'studio.graph.param.op', '>=', COMPARE_OPTIONS),
      numberParam('value', 'studio.graph.param.count', 1, 0, 999),
    ],
  },
  {
    type: 'cond.difficulty',
    category: 'condition',
    labelKey: 'studio.graph.node.condDifficulty',
    descriptionKey: 'studio.graph.node.condDifficulty.desc',
    glyph: 'DF',
    inputs: [],
    outputs: [BOOL_VALUE],
    params: [
      textParam('difficulty', 'studio.graph.param.difficulty', 'normal'),
      selectParam('op', 'studio.graph.param.op', '===', [
        { value: '===', labelKey: 'studio.graph.op.eq' },
        { value: '!==', labelKey: 'studio.graph.op.ne' },
      ]),
    ],
  },
  {
    type: 'cond.endless',
    category: 'condition',
    labelKey: 'studio.graph.node.condEndless',
    descriptionKey: 'studio.graph.node.condEndless.desc',
    glyph: 'EN',
    inputs: [],
    outputs: [BOOL_VALUE],
    params: [
      selectParam('value', 'studio.graph.param.expect', 'true', [
        { value: 'true', labelKey: 'studio.graph.opt.yes' },
        { value: 'false', labelKey: 'studio.graph.opt.no' },
      ]),
    ],
  },
  {
    type: 'cond.varCompare',
    category: 'condition',
    labelKey: 'studio.graph.node.condVarCompare',
    descriptionKey: 'studio.graph.node.condVarCompare.desc',
    glyph: 'VC',
    inputs: [],
    outputs: [BOOL_VALUE],
    params: [
      textParam('key', 'studio.graph.param.storeKey', 'counter'),
      selectParam('op', 'studio.graph.param.op', '>=', COMPARE_OPTIONS),
      numberParam('value', 'studio.graph.param.value', 1, -99999, 99999),
    ],
    permissions: ['storage'],
  },
];

const ONCE_SPEC: GraphNodeSpec = {
  type: 'flow.once',
  category: 'flow',
  labelKey: 'studio.graph.node.once',
  descriptionKey: 'studio.graph.node.once.desc',
  glyph: 'ON',
  inputs: [FLOW_IN],
  outputs: [FLOW_OUT],
  params: [],
  permissions: ['storage'],
};

/** 需要新指令的動作（塔增益／計分／座標升級與出售） */
const TOWER_ACTION_SPECS: readonly GraphNodeSpec[] = [
  {
    type: 'action.addScore',
    category: 'action',
    labelKey: 'studio.graph.node.addScore',
    descriptionKey: 'studio.graph.node.addScore.desc',
    glyph: 'SC',
    inputs: [FLOW_IN, port('amount', 'number', 'studio.graph.param.amount')],
    outputs: [FLOW_OUT],
    params: [numberParam('amount', 'studio.graph.param.amount', 10, -99999, 99999)],
    permissions: ['economy'],
  },
  {
    type: 'action.modifyTower',
    category: 'action',
    labelKey: 'studio.graph.node.modifyTower',
    descriptionKey: 'studio.graph.node.modifyTower.desc',
    glyph: 'MT',
    inputs: [FLOW_IN],
    outputs: [FLOW_OUT],
    params: [
      textParam('scope', 'studio.graph.param.towerScope', '*'),
      selectParam('stat', 'studio.graph.param.towerStat', 'damage', [
        { value: 'damage', labelKey: 'studio.graph.opt.damage' },
        { value: 'range', labelKey: 'studio.graph.opt.range' },
        { value: 'fireRate', labelKey: 'studio.graph.opt.fireRate' },
      ]),
      numberParam('multiplier', 'studio.graph.param.multiplier', 1.2, 0.1, 5, 0.05),
    ],
    permissions: ['tower.modify'],
  },
  {
    type: 'action.upgradeTowerAt',
    category: 'action',
    labelKey: 'studio.graph.node.upgradeTowerAt',
    descriptionKey: 'studio.graph.node.upgradeTowerAt.desc',
    glyph: 'UT',
    inputs: [FLOW_IN],
    outputs: [FLOW_OUT],
    params: [
      numberParam('row', 'studio.graph.param.row', 0, 0, 999),
      numberParam('col', 'studio.graph.param.col', 0, 0, 999),
    ],
    permissions: ['tower.modify', 'economy'],
  },
  {
    type: 'action.sellTowerAt',
    category: 'action',
    labelKey: 'studio.graph.node.sellTowerAt',
    descriptionKey: 'studio.graph.node.sellTowerAt.desc',
    glyph: 'ST',
    inputs: [FLOW_IN],
    outputs: [FLOW_OUT],
    params: [
      numberParam('row', 'studio.graph.param.row', 0, 0, 999),
      numberParam('col', 'studio.graph.param.col', 0, 0, 999),
    ],
    permissions: ['tower.modify', 'economy'],
  },
];

const CLEAR_VAR_SPEC: GraphNodeSpec = {
  type: 'action.clearVar',
  category: 'action',
  labelKey: 'studio.graph.node.clearVar',
  descriptionKey: 'studio.graph.node.clearVar.desc',
  glyph: 'CV',
  inputs: [FLOW_IN],
  outputs: [FLOW_OUT],
  params: [textParam('key', 'studio.graph.param.storeKey', '')],
  permissions: ['storage'],
};

/** 讀快照的數值來源：沒有任何參數，接了就有值 */
function stateValueSpec(type: string, labelKey: string, glyph: string): GraphNodeSpec {
  return {
    type,
    category: 'value',
    labelKey: 'studio.graph.node.' + labelKey,
    descriptionKey: 'studio.graph.node.' + labelKey + '.desc',
    glyph,
    inputs: [],
    outputs: [NUM_VALUE],
    params: [],
  };
}

function mathSpec(
  type: string,
  labelKey: string,
  glyph: string,
  inputs: GraphPort[],
): GraphNodeSpec {
  return {
    type,
    category: 'value',
    labelKey: 'studio.graph.node.' + labelKey,
    descriptionKey: 'studio.graph.node.' + labelKey + '.desc',
    glyph,
    inputs,
    outputs: [NUM_VALUE],
    params: [],
  };
}

const STATE_VALUE_SPECS: readonly GraphNodeSpec[] = [
  stateValueSpec('num.wave', 'numWave', 'NW'),
  stateValueSpec('num.health', 'numHealth', 'NH'),
  stateValueSpec('num.money', 'numMoney', 'NM'),
  stateValueSpec('num.towerCount', 'numTowerCount', 'NT'),
  stateValueSpec('num.enemyCount', 'numEnemyCount', 'NE'),
  stateValueSpec('num.elapsedSec', 'numElapsedSec', 'NS'),
  mathSpec('num.min', 'numMin', 'MN', [NUM_A, NUM_B]),
  mathSpec('num.max', 'numMax', 'MX', [NUM_A, NUM_B]),
  mathSpec('num.clamp', 'numClamp', 'CL', [
    port('value', 'number', 'studio.graph.port.value'),
    port('min', 'number', 'studio.graph.param.min'),
    port('max', 'number', 'studio.graph.param.max'),
  ]),
  mathSpec('num.round', 'numRound', 'RD', [port('value', 'number', 'studio.graph.port.value')]),
];

const JS_SPEC: GraphNodeSpec = {
  type: 'js.node',
  category: 'js',
  labelKey: 'studio.graph.node.js',
  descriptionKey: 'studio.graph.node.js.desc',
  glyph: 'JS',
  inputs: [FLOW_IN],
  outputs: [FLOW_OUT],
  params: [],
  unanalyzable: true,
};

/** 完整節點庫（順序＝檢視器面板的分類順序） */
const NODE_LIBRARY: readonly GraphNodeSpec[] = [
  ...EVENT_NODE_TYPES.map(eventSpec),
  CHANCE,
  COMPARE,
  ENEMY_COUNT,
  MONEY_COND,
  AND_SPEC,
  OR_SPEC,
  NOT_SPEC,
  ...STATE_COND_SPECS,
  ...ACTION_SPECS,
  ...TOWER_ACTION_SPECS,
  CLEAR_VAR_SPEC,
  ...FLOW_SPECS,
  ONCE_SPEC,
  ...VALUE_SPECS,
  ...STATE_VALUE_SPECS,
  JS_SPEC,
];

const SPEC_BY_TYPE = new Map<string, GraphNodeSpec>(NODE_LIBRARY.map((spec) => [spec.type, spec]));

export function nodeSpec(type: string): GraphNodeSpec | null {
  return SPEC_BY_TYPE.get(type) ?? null;
}

export function nodeSpecsByCategory(category: GraphNodeSpec['category']): GraphNodeSpec[] {
  return NODE_LIBRARY.filter((spec) => spec.category === category);
}

export function eventSpecByHook(hook: ModScriptHook): GraphNodeSpec | null {
  for (const spec of NODE_LIBRARY) {
    if (spec.hook === hook) return spec;
  }
  return null;
}

/** 依規格產生預設參數 */
export function defaultParams(spec: GraphNodeSpec): Record<string, GraphParamValue> {
  const params: Record<string, GraphParamValue> = {};
  for (const param of spec.params) {
    params[param.key] = param.default;
  }
  return params;
}
