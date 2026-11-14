import type { Translations } from '@/i18n';
import type { SrcFileCategory } from '@/components/scenes/encyclopedia/encyclopediaFileRegistry';

export function getFileCategoryLabel(enc: Translations['encyclopedia'], category: SrcFileCategory): string {
  if (category === 'root') return enc.fileCategoryRoot;
  if (category === 'other') return enc.fileCategoryOther;
  return category;
}

export function getInferredFileDescription(
  enc: Translations['encyclopedia'],
  category: SrcFileCategory,
  folder: string,
  format: string,
): string {
  return enc.fileInferredDescription
    .replace('{category}', getFileCategoryLabel(enc, category))
    .replace('{folder}', folder)
    .replace('{format}', format.toUpperCase());
}
