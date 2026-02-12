import rawChangelog from '../../../CHANGELOG.md?raw';

const SECTION_ORDER = ['Added', 'Changed', 'Fixed', 'Performance', 'UI/UX'];

const splitLatestEntry = () => {
  if (!rawChangelog) return null;
  const entries = rawChangelog.split(/\n##\s+/).slice(1);
  if (!entries.length) return null;
  const [headerLine, ...rest] = entries[0].split('\n');
  return {
    title: headerLine.trim(),
    body: rest.join('\n'),
  };
};

const parseSections = (body) => {
  const sections = new Map();
  SECTION_ORDER.forEach((title) => sections.set(title, []));

  let activeSection = null;
  const lines = body.split('\n');
  for (const line of lines) {
    const headingMatch = line.match(/^###\s+(.*)$/);
    if (headingMatch) {
      const heading = headingMatch[1].trim();
      activeSection = sections.has(heading) ? heading : null;
      continue;
    }

    if (!activeSection) continue;
    const itemMatch = line.match(/^[-*]\s+(.*)$/);
    if (itemMatch) {
      const item = itemMatch[1].trim();
      if (item) sections.get(activeSection).push(item);
    }
  }

  return SECTION_ORDER.map((title) => ({
    title,
    items: sections.get(title),
  })).filter((section) => section.items.length > 0);
};

export const getLatestReleaseNotes = () => {
  const entry = splitLatestEntry();
  if (!entry) {
    return { title: 'Release Notes', sections: [] };
  }
  return {
    title: entry.title,
    sections: parseSections(entry.body),
  };
};
