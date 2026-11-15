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
    inputs: [FLOW_IN, port('message', 'string', 'studio.graph.param.message')],
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

const TEXT_VALUE: GraphPort = { id: 'value', kind: 'string', labelKey: 'studio.graph.port.value' };
const TEXT_A = port('a', 'string', 'studio.graph.port.a');
const TEXT_B = port('b', 'string', 'studio.graph.port.b');

const BOOL_A = port('a', 'boolean', 'studio.graph.port.a');
const BOOL_B = port('b', 'boolean', 'studio.graph.port.b');
const BOOL_C = port('c', 'boolean', 'studio.graph.port.c');
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

/** 邏輯完備：xor／nand／nor 與三元組合 */
const LOGIC_EXTRA_SPECS: readonly GraphNodeSpec[] = [
  {
    type: 'cond.xor',
    category: 'condition',
    labelKey: 'studio.graph.node.condXor',
    descriptionKey: 'studio.graph.node.condXor.desc',
    glyph: '^',
    inputs: [BOOL_A, BOOL_B],
    outputs: [BOOL_VALUE],
    params: [],
  },
  {
    type: 'cond.nand',
    category: 'condition',
    labelKey: 'studio.graph.node.condNand',
    descriptionKey: 'studio.graph.node.condNand.desc',
    glyph: 'ND',
    inputs: [BOOL_A, BOOL_B],
    outputs: [BOOL_VALUE],
    params: [],
  },
  {
    type: 'cond.nor',
    category: 'condition',
    labelKey: 'studio.graph.node.condNor',
    descriptionKey: 'studio.graph.node.condNor.desc',
    glyph: 'NR',
    inputs: [BOOL_A, BOOL_B],
    outputs: [BOOL_VALUE],
    params: [],
  },
  {
    type: 'cond.anyOf',
    category: 'condition',
    labelKey: 'studio.graph.node.condAnyOf',
    descriptionKey: 'studio.graph.node.condAnyOf.desc',
    glyph: 'ANY',
    inputs: [BOOL_A, BOOL_B, BOOL_C],
    outputs: [BOOL_VALUE],
    params: [],
  },
  {
    type: 'cond.allOf',
    category: 'condition',
    labelKey: 'studio.graph.node.condAllOf',
    descriptionKey: 'studio.graph.node.condAllOf.desc',
    glyph: 'ALL',
    inputs: [BOOL_A, BOOL_B, BOOL_C],
    outputs: [BOOL_VALUE],
    params: [],
  },
  {
    type: 'cond.between',
    category: 'condition',
    labelKey: 'studio.graph.node.condBetween',
    descriptionKey: 'studio.graph.node.condBetween.desc',
    glyph: 'BT',
    inputs: [NUM_VALUE],
    outputs: [BOOL_VALUE],
    params: [
      numberParam('min', 'studio.graph.param.min', 0, -99999, 99999),
      numberParam('max', 'studio.graph.param.max', 10, -99999, 99999),
    ],
  },
];

/** 讀快照的布林／字串條件（不需要門檻參數的那一類） */
const SNAPSHOT_COND_SPECS: readonly GraphNodeSpec[] = [
  {
    type: 'cond.waveModulo',
    category: 'condition',
    labelKey: 'studio.graph.node.condWaveModulo',
    descriptionKey: 'studio.graph.node.condWaveModulo.desc',
    glyph: 'W%',
    inputs: [],
    outputs: [BOOL_VALUE],
    params: [numberParam('every', 'studio.graph.param.every', 5, 2, 99)],
  },
  {
    type: 'cond.waveParity',
    category: 'condition',
    labelKey: 'studio.graph.node.condWaveParity',
    descriptionKey: 'studio.graph.node.condWaveParity.desc',
    glyph: 'WP',
    inputs: [],
    outputs: [BOOL_VALUE],
    params: [
      selectParam('parity', 'studio.graph.param.parity', 'even', [
        { value: 'even', labelKey: 'studio.graph.opt.even' },
        { value: 'odd', labelKey: 'studio.graph.opt.odd' },
      ]),
    ],
  },
  {
    type: 'cond.towerType',
    category: 'condition',
    labelKey: 'studio.graph.node.condTowerType',
    descriptionKey: 'studio.graph.node.condTowerType.desc',
    glyph: 'TT',
    inputs: [],
    outputs: [BOOL_VALUE],
    params: [textParam('towerType', 'studio.graph.param.towerType', 'basic')],
  },
  {
    type: 'cond.bossOnField',
    category: 'condition',
    labelKey: 'studio.graph.node.condBossOnField',
    descriptionKey: 'studio.graph.node.condBossOnField.desc',
    glyph: 'BO',
    inputs: [],
    outputs: [BOOL_VALUE],
    params: [],
  },
  {
    type: 'cond.fieldEmpty',
    category: 'condition',
    labelKey: 'studio.graph.node.condFieldEmpty',
    descriptionKey: 'studio.graph.node.condFieldEmpty.desc',
    glyph: 'FE',
    inputs: [],
    outputs: [BOOL_VALUE],
    params: [],
  },
  {
    type: 'cond.pathName',
    category: 'condition',
    labelKey: 'studio.graph.node.condPathName',
    descriptionKey: 'studio.graph.node.condPathName.desc',
    glyph: 'PN',
    inputs: [],
    outputs: [BOOL_VALUE],
    params: [
      textParam('path', 'studio.graph.param.path', 'classic'),
      selectParam('op', 'studio.graph.param.op', '===', [
        { value: '===', labelKey: 'studio.graph.op.eq' },
        { value: '!==', labelKey: 'studio.graph.op.ne' },
      ]),
    ],
  },
  {
    type: 'cond.varString',
    category: 'condition',
    labelKey: 'studio.graph.node.condVarString',
    descriptionKey: 'studio.graph.node.condVarString.desc',
    glyph: 'VS',
    inputs: [],
    outputs: [BOOL_VALUE],
    params: [
      textParam('key', 'studio.graph.param.storeKey', 'phase'),
      textParam('value', 'studio.graph.param.stringValue', ''),
      selectParam('op', 'studio.graph.param.op', '===', [
        { value: '===', labelKey: 'studio.graph.op.eq' },
        { value: '!==', labelKey: 'studio.graph.op.ne' },
      ]),
    ],
    permissions: ['storage'],
  },
];

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

const FLOW_EXTRA_SPECS: readonly GraphNodeSpec[] = [
  {
    type: 'flow.switch',
    category: 'flow',
    labelKey: 'studio.graph.node.switch',
    descriptionKey: 'studio.graph.node.switch.desc',
    glyph: 'SW',
    inputs: [FLOW_IN, NUM_VALUE],
    outputs: [
      port('case1', 'flow', 'studio.graph.port.case1'),
      port('case2', 'flow', 'studio.graph.port.case2'),
      port('case3', 'flow', 'studio.graph.port.case3'),
      port('default', 'flow', 'studio.graph.port.default'),
    ],
    params: [
      numberParam('v1', 'studio.graph.param.case1', 1, -99999, 99999),
      numberParam('v2', 'studio.graph.param.case2', 2, -99999, 99999),
      numberParam('v3', 'studio.graph.param.case3', 3, -99999, 99999),
    ],
  },
  {
    type: 'flow.gate',
    category: 'flow',
    labelKey: 'studio.graph.node.gate',
    descriptionKey: 'studio.graph.node.gate.desc',
    glyph: 'GT',
    inputs: [FLOW_IN],
    outputs: [FLOW_OUT],
    params: [numberParam('every', 'studio.graph.param.every', 3, 2, 999)],
    permissions: ['storage'],
  },
  {
    type: 'flow.sequenceN',
    category: 'flow',
    labelKey: 'studio.graph.node.sequenceN',
    descriptionKey: 'studio.graph.node.sequenceN.desc',
    glyph: 'SQ6',
    inputs: [FLOW_IN],
    outputs: [
      port('first', 'flow', 'studio.graph.port.first'),
      port('second', 'flow', 'studio.graph.port.second'),
      port('third', 'flow', 'studio.graph.port.third'),
      port('fourth', 'flow', 'studio.graph.port.fourth'),
      port('fifth', 'flow', 'studio.graph.port.fifth'),
      port('sixth', 'flow', 'studio.graph.port.sixth'),
    ],
    params: [],
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
    type: 'action.logValue',
    category: 'action',
    labelKey: 'studio.graph.node.logValue',
    descriptionKey: 'studio.graph.node.logValue.desc',
    glyph: 'LV',
    inputs: [FLOW_IN, NUM_VALUE],
    outputs: [FLOW_OUT],
    params: [],
    permissions: ['log'],
  },
  {
    type: 'action.applyStatusAll',
    category: 'action',
    labelKey: 'studio.graph.node.applyStatusAll',
    descriptionKey: 'studio.graph.node.applyStatusAll.desc',
    glyph: 'SA',
    inputs: [FLOW_IN],
    outputs: [FLOW_OUT],
    params: [
      selectParam('effect', 'studio.graph.param.effect', 'slow', STATUS_OPTIONS),
      numberParam('durationMs', 'studio.graph.param.durationMs', 2000, 1, 60000, 100),
      numberParam('value', 'studio.graph.param.value', 0.5, -999, 999, 0.05),
    ],
    permissions: ['enemy.modify'],
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

/** 字串節點：讓 log／變數／狀態機能寫出可讀內容（埠種類早就有 string，只是沒有節點） */
const TEXT_SPECS: readonly GraphNodeSpec[] = [
  {
    type: 'text.literal',
    category: 'value',
    labelKey: 'studio.graph.node.textLiteral',
    descriptionKey: 'studio.graph.node.textLiteral.desc',
    glyph: 'TX',
    inputs: [],
    outputs: [TEXT_VALUE],
    params: [textParam('text', 'studio.graph.param.text', '')],
  },
  {
    type: 'text.concat',
    category: 'value',
    labelKey: 'studio.graph.node.textConcat',
    descriptionKey: 'studio.graph.node.textConcat.desc',
    glyph: '++',
    inputs: [TEXT_A, TEXT_B],
    outputs: [TEXT_VALUE],
    params: [],
  },
  {
    type: 'text.number',
    category: 'value',
    labelKey: 'studio.graph.node.textNumber',
    descriptionKey: 'studio.graph.node.textNumber.desc',
    glyph: 'N2',
    inputs: [NUM_VALUE],
    outputs: [TEXT_VALUE],
    params: [],
  },
  {
    type: 'text.template',
    category: 'value',
    labelKey: 'studio.graph.node.textTemplate',
    descriptionKey: 'studio.graph.node.textTemplate.desc',
    glyph: 'TPL',
    inputs: [NUM_VALUE],
    outputs: [TEXT_VALUE],
    params: [textParam('template', 'studio.graph.param.template', '漏了 {n} 隻')],
  },
  {
    type: 'text.upper',
    category: 'value',
    labelKey: 'studio.graph.node.textUpper',
    descriptionKey: 'studio.graph.node.textUpper.desc',
    glyph: 'UP',
    inputs: [TEXT_A],
    outputs: [TEXT_VALUE],
    params: [],
  },
  {
    type: 'text.slice',
    category: 'value',
    labelKey: 'studio.graph.node.textSlice',
    descriptionKey: 'studio.graph.node.textSlice.desc',
    glyph: 'SL',
    inputs: [TEXT_A],
    outputs: [TEXT_VALUE],
    params: [
      numberParam('start', 'studio.graph.param.start', 0, 0, 200),
      numberParam('length', 'studio.graph.param.length', 8, 1, 200),
    ],
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

const MATH_EXTRA_SPECS: readonly GraphNodeSpec[] = [
  mathSpec('num.mod', 'numMod', 'MD', [NUM_A, NUM_B]),
  mathSpec('num.pow', 'numPow', 'PW', [NUM_A, NUM_B]),
  mathSpec('num.abs', 'numAbs', 'AB', [port('value', 'number', 'studio.graph.port.value')]),
  mathSpec('num.floor', 'numFloor', 'FL', [port('value', 'number', 'studio.graph.port.value')]),
  mathSpec('num.ceil', 'numCeil', 'CE', [port('value', 'number', 'studio.graph.port.value')]),
  {
    type: 'num.randomFloat',
    category: 'value',
    labelKey: 'studio.graph.node.numRandomFloat',
    descriptionKey: 'studio.graph.node.numRandomFloat.desc',
    glyph: 'RF',
    inputs: [],
    outputs: [NUM_VALUE],
    params: [],
  },
  stateValueSpec('num.maxWaves', 'numMaxWaves', 'MW'),
  {
    type: 'num.enemiesOfType',
    category: 'value',
    labelKey: 'studio.graph.node.numEnemiesOfType',
    descriptionKey: 'studio.graph.node.numEnemiesOfType.desc',
    glyph: 'EO',
    inputs: [],
    outputs: [NUM_VALUE],
    params: [textParam('enemyType', 'studio.graph.param.enemyType', 'grunt')],
  },
];

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
  ...LOGIC_EXTRA_SPECS,
  ...STATE_COND_SPECS,
  ...SNAPSHOT_COND_SPECS,
  ...ACTION_SPECS,
  ...TOWER_ACTION_SPECS,
  CLEAR_VAR_SPEC,
  ...FLOW_SPECS,
  ...FLOW_EXTRA_SPECS,
  ONCE_SPEC,
  ...VALUE_SPECS,
  ...STATE_VALUE_SPECS,
  ...MATH_EXTRA_SPECS,
  ...TEXT_SPECS,
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
