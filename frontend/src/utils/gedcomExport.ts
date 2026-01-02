import type { FamilyTree, Person, Family } from '@/data/types';

/**
 * Convert a FamilyTree to GEDCOM format
 * GEDCOM (GEnealogical Data COMmunication) is a standard format for genealogical data
 */
export function exportToGEDCOM(tree: FamilyTree): string {
  const lines: string[] = [];

  // Header
  lines.push('0 HEAD');
  lines.push('1 SOUR Family Tree App');
  lines.push('2 NAME Family Tree Viewer');
  lines.push('1 GEDC');
  lines.push('2 VERS 5.5.1');
  lines.push('2 FORM LINEAGE-LINKED');
  lines.push('1 CHAR UTF-8');
  lines.push(`1 DATE ${formatGEDCOMDate(new Date())}`);
  if (tree.name) {
    lines.push(`1 NOTE ${tree.name}`);
  }
  if (tree.description) {
    lines.push(`2 CONT ${tree.description}`);
  }

  // Individual records
  Object.values(tree.persons).forEach((person) => {
    lines.push(...generateIndividualRecord(person));
  });

  // Family records
  tree.families.forEach((family) => {
    lines.push(...generateFamilyRecord(family, tree.persons));
  });

  // Trailer
  lines.push('0 TRLR');

  return lines.join('\n');
}

/**
 * Generate GEDCOM individual record
 */
function generateIndividualRecord(person: Person): string[] {
  const lines: string[] = [];

  lines.push(`0 @${person.id}@ INDI`);

  // Name
  const fullName = `${person.firstName || ''} /${person.lastName || ''}/`;
  lines.push(`1 NAME ${fullName}`);
  lines.push(`2 GIVN ${person.firstName || ''}`);
  lines.push(`2 SURN ${person.lastName || ''}`);

  // Gender
  if (person.gender) {
    const gedcomGender = person.gender === 'male' ? 'M' : person.gender === 'female' ? 'F' : 'U';
    lines.push(`1 SEX ${gedcomGender}`);
  }

  // Birth date
  if (person.birthDate) {
    lines.push('1 BIRT');
    lines.push(`2 DATE ${formatGEDCOMDate(new Date(person.birthDate))}`);
  }

  // Death date
  if (person.deathDate) {
    lines.push('1 DEAT');
    lines.push(`2 DATE ${formatGEDCOMDate(new Date(person.deathDate))}`);
  }

  // Notes
  if (person.notes) {
    const noteLines = person.notes.split('\n');
    lines.push(`1 NOTE ${noteLines[0]}`);
    // Add continuation lines for multi-line notes
    for (let i = 1; i < noteLines.length; i++) {
      lines.push(`2 CONT ${noteLines[i]}`);
    }
  }

  return lines;
}

/**
 * Generate GEDCOM family record
 */
function generateFamilyRecord(family: Family, persons: Record<string, Person>): string[] {
  const lines: string[] = [];

  lines.push(`0 @${family.id}@ FAM`);

  // Parents (spouses)
  if (family.parents.length > 0) {
    // Typically first parent is husband, second is wife (but this is flexible)
    const parent1 = persons[family.parents[0]];
    const parent2 = family.parents[1] ? persons[family.parents[1]] : null;

    if (parent1?.gender === 'male') {
      lines.push(`1 HUSB @${family.parents[0]}@`);
    } else {
      lines.push(`1 WIFE @${family.parents[0]}@`);
    }

    if (parent2) {
      if (parent2.gender === 'male') {
        lines.push(`1 HUSB @${family.parents[1]}@`);
      } else {
        lines.push(`1 WIFE @${family.parents[1]}@`);
      }
    }
  }

  // Children
  family.children.forEach((childId) => {
    lines.push(`1 CHIL @${childId}@`);
  });

  // Marriage date
  if (family.marriageDate) {
    lines.push('1 MARR');
    lines.push(`2 DATE ${formatGEDCOMDate(new Date(family.marriageDate))}`);
  }

  // Divorce date
  if (family.divorceDate) {
    lines.push('1 DIV');
    lines.push(`2 DATE ${formatGEDCOMDate(new Date(family.divorceDate))}`);
  }

  return lines;
}

/**
 * Format a date for GEDCOM (DD MMM YYYY format)
 */
function formatGEDCOMDate(date: Date): string {
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Download a GEDCOM file
 */
export function downloadGEDCOM(tree: FamilyTree): void {
  const gedcomContent = exportToGEDCOM(tree);
  const blob = new Blob([gedcomContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${tree.name || 'family-tree'}.ged`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
