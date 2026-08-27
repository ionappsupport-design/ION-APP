import { ScannedFile } from '../types';

/**
 * Pure function that determines the final deletion payload based on user selection.
 * This guarantees that NO files are returned if NO categories are selected.
 */
export function filterSelectedFiles(
  files: ScannedFile[],
  selectedCategories: Record<string, boolean>
): ScannedFile[] {
  // Defensive check: if no categories are true, return empty immediately.
  const anySelected = Object.values(selectedCategories).some(v => v);
  if (!anySelected) return [];

  return files.filter(f => {
    if (selectedCategories.duplicate && f.isDuplicate && !f.isOriginal) return true;
    if (selectedCategories.large && f.category === 'large') return true;
    if (selectedCategories.screenshot && f.category === 'screenshot') return true;
    if (selectedCategories.blurry && f.isBlurry) return true;
    
    // Junk categories mapped to the single "junk" checkbox
    const isJunkSubtype = f.isJunk || f.category === 'junk' || f.category === 'temp' || f.category === 'cache';
    if (selectedCategories.junk && isJunkSubtype && !f.isDuplicate && f.category !== 'screenshot' && f.category !== 'large' && !f.isBlurry) {
      return true;
    }
    
    return false;
  });
}
