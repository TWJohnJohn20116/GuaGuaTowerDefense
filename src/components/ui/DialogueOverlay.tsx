import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DialogueLine } from '@/types/campaign';
import { UserIcon, RobotIcon, SkipForwardIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { isDialogueAdvanceKey, nextDialogueAdvance } from '@/data/dialogueAdvance';
import { Deck, Key } from '@/components/hl';

interface DialogueOverlayProps {
  dialogues: DialogueLine[];
  onComplete: () => void;
}

/**
 * 對局對話蓋層 — HARDLINE
 * 下半部一張 Deck（1px 線、左上切角），發話者用 mono 標籤 + 2px 左緣，
 * 沒有漸層遮罩、沒有模糊、沒有發光裝飾。
 */
export const DialogueOverlay = ({ dialogues, onComplete }: DialogueOverlayProps) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const currentDialogue = dialogues[currentIndex];

  useEffect(() => {
    if (!currentDialogue) return;

    setDisplayedText('');
    setIsTyping(true);

    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < currentDialogue.text.length) {
        setDisplayedText(currentDialogue.text.substring(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 30); // 打字速度

    return () => clearInterval(typingInterval);
  }, [currentIndex, currentDialogue]);

  const handleNext = useCallback(() => {
    if (!currentDialogue) return;
    const action = nextDialogueAdvance(isTyping, currentIndex, dialogues.length);
    if (action === 'reveal') {
      setDisplayedText(currentDialogue.text);
      setIsTyping(false);
      return;
    }
    if (action === 'next') {
      setCurrentIndex(currentIndex + 1);
      return;
    }
    onComplete();
  }, [currentDialogue, currentIndex, dialogues.length, isTyping, onComplete]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isDialogueAdvanceKey(e.key)) return;
      e.preventDefault();
      e.stopPropagation();
      handleNext();
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [handleNext]);

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete();
  };

  if (!currentDialogue) return null;

  const isPlayer = currentDialogue.speaker.includes('你');

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[9999] flex flex-col justify-end bg-[rgba(6,7,10,0.55)] p-4 md:p-8"
      onClick={handleNext}
    >
      {/* 跳過 */}
      <div className="absolute right-4 top-4 z-50 md:right-8 md:top-8">
        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center gap-2 border border-[var(--hl-line-strong)] bg-[var(--hl-deck)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-3)] transition-colors hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]"
        >
          <span>{t.tutorial.skip}</span>
          <SkipForwardIcon className="h-3 w-3" />
        </button>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[560px]">
        {/* 發話者 */}
        <motion.div
          key={`speaker-${currentIndex}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
          className={`mb-1.5 flex ${isPlayer ? 'justify-start' : 'justify-end'}`}
        >
          <div
            className={`flex items-center gap-2 border border-[var(--hl-line)] border-l-2 bg-[var(--hl-deck)] px-2.5 py-1.5 ${
              isPlayer ? 'border-l-[var(--hl-reach)]' : 'border-l-[var(--hl-caution)]'
            }`}
          >
            {isPlayer
              ? <UserIcon className="h-3 w-3 text-[var(--hl-reach)]" />
              : <RobotIcon className="h-3 w-3 text-[var(--hl-caution)]" />}
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--hl-ink-2)]">
              {currentDialogue.speaker}
            </span>
          </div>
        </motion.div>

        {/* 對話內容 */}
        <motion.div
          key={`box-${currentIndex}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          <Deck notch className="relative overflow-hidden px-4 py-4 md:px-6 md:py-5">
            <div className="min-h-[76px]">
              <p className="text-[15px] leading-relaxed text-[var(--hl-ink)] md:text-[17px]">
                {displayedText}
                {!isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="ml-1 inline-block h-3.5 w-[7px] translate-y-px bg-[var(--hl-signal)] align-middle"
                  />
                )}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[var(--hl-line)] pt-2">
              <span className="hl-label">{t.tutorial.clickToContinue}</span>
              <Key>{currentIndex + 1} / {dialogues.length}</Key>
            </div>
          </Deck>
        </motion.div>
      </div>
    </div>
  );
};
