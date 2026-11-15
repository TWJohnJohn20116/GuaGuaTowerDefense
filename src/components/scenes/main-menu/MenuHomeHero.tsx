import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { Btn, Dot } from '@/components/hl';
import { HOME_HERO_CLASS } from '@/data/mainMenuHome';
import { EASE_OUT } from '@/utils/motionTokens';

/** 進場：淡入上移。常數放模組層，避免每次 render 建新物件讓動畫重播 */
const FADE_UP = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } };

/** 裝飾圓慢速旋轉：90 秒一圈，幾乎察覺不到，但畫面不是死的 */
const SPIN = { rotate: 360 };
const SPIN_SLOW = { duration: 90, repeat: Infinity, ease: 'linear' as const };

/**
 * 主選單 · Hero 舞台
 *
 * 整個畫面唯一的「主角」：品牌識別與開始遊戲共用正中央同一塊版位，
 * 不再像舊版把品牌塞進左欄、主行動壓在欄底。
 * 全畫面只准許一處大面積訊號色 —— 就是這顆開始遊戲。
 *
 * 動效節奏吃 motionTokens：標籤 300ms、品牌 400ms、按鈕 400ms（延遲 220ms），
 * 全部只動 transform 與 opacity。裝飾圓用虛線邊框，旋轉才看得出來。
 */
export function MenuHomeHero({ focused, onFocus }: { focused: boolean; onFocus: () => void }) {
  const { t } = useTranslation();
  const setScene = useGameStore((s) => s.setScene);

  return (
    <section className={HOME_HERO_CLASS}>
      <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[22px] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] shadow-[0_6px_0_-1px_rgba(46,36,64,0.18)]">
        {/* 同心圓裝飾：包一層 overflow-hidden，避免絕對定位溢出被算進 scroll 區 */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.span
            className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[10px] border-dashed border-[var(--cn-ink)]/[0.07]"
            animate={SPIN}
            transition={SPIN_SLOW}
          />
          <span className="absolute -bottom-20 -left-12 h-64 w-64 rounded-full border-[10px] border-[var(--cn-ink)]/[0.05]" />
        </span>

        <div className="relative flex min-h-0 flex-1 flex-col justify-between gap-4 p-5 lg:p-7">
          {/* 頂：營運標籤 */}
          <motion.div
            {...FADE_UP}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="flex items-center gap-2"
          >
            <Dot tone="signal" pulse />
            <span className="arc-label">{t.mainMenu.hero.kicker}</span>
            <span className="h-px flex-1 bg-[var(--cn-line-soft)]" />
          </motion.div>

          {/* 中：品牌 */}
          <div className="flex flex-1 flex-col justify-center gap-3">
            <motion.div
              {...FADE_UP}
              transition={{ duration: 0.4, delay: 0.06, ease: EASE_OUT }}
              className="flex flex-col gap-1.5"
            >
              <h1 className="text-[44px] font-black leading-[0.88] tracking-[-0.05em] text-[var(--cn-ink)] lg:text-[92px]">
                {t.mainMenu.title}
              </h1>
              <p className="max-w-[34ch] text-[11.5px] leading-relaxed text-[var(--cn-ink-3)]">
                {t.mainMenu.subtitle}
              </p>
            </motion.div>

            {/* 三枚特色標籤：撐住品牌與按鈕之間那段空白 */}
            <motion.div
              {...FADE_UP}
              transition={{ duration: 0.35, delay: 0.16, ease: EASE_OUT }}
              className="flex flex-wrap gap-1.5"
            >
              {[t.mainMenu.hero.tagOffline, t.mainMenu.hero.tagLocalSave, t.mainMenu.hero.tagRender].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border-2 border-[var(--cn-line-soft)] bg-[var(--cn-paper-2)] px-2.5 py-[3px] font-mono text-[10px] font-bold tracking-[0.04em] text-[var(--cn-ink-3)]"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>

          {/* 底：主行動 */}
          <motion.div
            {...FADE_UP}
            transition={{ duration: 0.4, delay: 0.22, ease: EASE_OUT }}
            className="flex flex-col gap-2"
          >
            <Btn
              variant="signal"
              size="lg"
              block
              kbd="ENTER"
              data-focus-id="start"
              onClick={() => setScene('pathSelection')}
              onMouseEnter={onFocus}
              onFocus={onFocus}
              className={[
                'min-h-16 rounded-[20px] lg:min-h-[76px]',
                focused ? 'outline-[4px] outline-offset-2 outline-[var(--cn-signal)]/40' : '',
              ].join(' ')}
            >
              <span className="text-[20px] font-black tracking-[0.08em] lg:text-[25px]">
                {t.mainMenu.startGame}
              </span>
            </Btn>
            <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--cn-ink-4)]">
              <span>{t.mainMenu.hero.hintEnter}</span>
              <span>{t.mainMenu.hero.hintSave}</span>
              <span>{t.mainMenu.hero.hintRender}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default MenuHomeHero;