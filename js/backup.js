import { exportData, saveSetting, state } from './store.js';
import { ymd, today as getToday, daysBetween } from './logic.js';
import { isIOS } from './install.js';
import { toast } from './ui.js';

export async function exportToFile() {
  const json = await exportData();
  const name = `mashq-kundaligi-${ymd()}.json`;
  const blob = new Blob([JSON.stringify(json, null, 1)], { type: 'application/json' });
  // iOS standalone apps can't use <a download> reliably; use the share sheet.
  const file = new File([blob], name, { type: 'application/json' });
  if (isIOS() && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name });
    } catch (e) {
      if (e.name === 'AbortError') return false;
      throw e;
    }
  } else {
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: name });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  await saveSetting('lastBackupAt', ymd());
  toast('Zaxira nusxa saqlandi');
  return true;
}

/** Weekly backup reminder: due 7 days after the last export (or after first launch). */
export function backupDue(today = getToday()) {
  const { lastBackupAt, firstLaunch, backupNagAt } = state.settings;
  const since = lastBackupAt || firstLaunch || today;
  if (daysBetween(since, today) < 7) return false;
  if (backupNagAt && daysBetween(backupNagAt, today) < 3) return false;
  return Object.keys(state.sessions).length > 0;
}
