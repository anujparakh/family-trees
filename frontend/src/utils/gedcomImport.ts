import type { FamilyTree, Person, Family } from '@/data/types';

interface GEDCOMIndividual {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  gender?: 'male' | 'female' | 'other';
  notes?: string;
  familyAsSpouse: string[]; // Family IDs where this person is a parent
  familyAsChild?: string; // Family ID where this person is a child
}

interface GEDCOMFamily {
  id: string;
  husbandId?: string;
  wifeId?: string;
  childrenIds: string[];
  marriageDate?: string;
  divorceDate?: string;
}

/**
 * Parse a GEDCOM file and convert to FamilyTree structure
 */
export async function importFromGEDCOM(file: File): Promise<FamilyTree> {
  const text = await file.text();
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  const individuals: Map<string, GEDCOMIndividual> = new Map();
  const families: Map<string, GEDCOMFamily> = new Map();
  const idMap: Map<string, string> = new Map(); // Map GEDCOM IDs to UUIDs

  let currentContext: 'individual' | 'family' | 'header' | null = null;
  let currentId: string | null = null;
  let treeName = 'Imported Family Tree';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(' ');
    const level = parseInt(parts[0]);

    // Level 0 records
    if (level === 0) {
      if (line.includes('@') && line.includes('INDI')) {
        // Individual record
        const gedcomId = parts[1].replace(/@/g, '');
        const uuid = crypto.randomUUID();
        idMap.set(gedcomId, uuid);
        currentContext = 'individual';
        currentId = gedcomId;
        individuals.set(gedcomId, {
          id: uuid,
          firstName: '',
          lastName: '',
          familyAsSpouse: [],
        });
      } else if (line.includes('@') && line.includes('FAM')) {
        // Family record
        const gedcomId = parts[1].replace(/@/g, '');
        const uuid = crypto.randomUUID();
        idMap.set(gedcomId, uuid);
        currentContext = 'family';
        currentId = gedcomId;
        families.set(gedcomId, {
          id: uuid,
          childrenIds: [],
        });
      } else if (line.includes('HEAD')) {
        currentContext = 'header';
        currentId = null;
      }
      continue;
    }

    // Level 1 and 2 records
    if (currentContext === 'individual' && currentId) {
      const individual = individuals.get(currentId)!;

      if (level === 1) {
        if (line.includes('NAME')) {
          const nameMatch = line.match(/NAME (.+)/);
          if (nameMatch) {
            const fullName = nameMatch[1];
            const nameParts = fullName.split('/').map(p => p.trim());
            individual.firstName = nameParts[0] || '';
            individual.lastName = nameParts[1] || '';
          }
        } else if (line.includes('SEX')) {
          const sexMatch = line.match(/SEX ([MFU])/);
          if (sexMatch) {
            const sex = sexMatch[1];
            individual.gender = sex === 'M' ? 'male' : sex === 'F' ? 'female' : 'other';
          }
        } else if (line.includes('BIRT')) {
          // Next line might have DATE
          const nextLine = lines[i + 1];
          if (nextLine && nextLine.includes('DATE')) {
            const dateMatch = nextLine.match(/DATE (.+)/);
            if (dateMatch) {
              individual.birthDate = parseGEDCOMDate(dateMatch[1]);
            }
          }
        } else if (line.includes('DEAT')) {
          // Next line might have DATE
          const nextLine = lines[i + 1];
          if (nextLine && nextLine.includes('DATE')) {
            const dateMatch = nextLine.match(/DATE (.+)/);
            if (dateMatch) {
              individual.deathDate = parseGEDCOMDate(dateMatch[1]);
            }
          }
        } else if (line.includes('NOTE')) {
          const noteMatch = line.match(/NOTE (.+)/);
          if (noteMatch) {
            individual.notes = noteMatch[1];
          }
          // Check for CONT (continuation) lines
          let j = i + 1;
          while (j < lines.length && lines[j].startsWith('2 CONT')) {
            const contMatch = lines[j].match(/2 CONT (.+)/);
            if (contMatch) {
              individual.notes = (individual.notes || '') + '\n' + contMatch[1];
            }
            j++;
          }
        } else if (line.includes('FAMS')) {
          const famMatch = line.match(/@(.+)@/);
          if (famMatch) {
            individual.familyAsSpouse.push(famMatch[1]);
          }
        } else if (line.includes('FAMC')) {
          const famMatch = line.match(/@(.+)@/);
          if (famMatch) {
            individual.familyAsChild = famMatch[1];
          }
        }
      }
    } else if (currentContext === 'family' && currentId) {
      const family = families.get(currentId)!;

      if (level === 1) {
        if (line.includes('HUSB')) {
          const husbMatch = line.match(/@(.+)@/);
          if (husbMatch) {
            family.husbandId = husbMatch[1];
          }
        } else if (line.includes('WIFE')) {
          const wifeMatch = line.match(/@(.+)@/);
          if (wifeMatch) {
            family.wifeId = wifeMatch[1];
          }
        } else if (line.includes('CHIL')) {
          const childMatch = line.match(/@(.+)@/);
          if (childMatch) {
            family.childrenIds.push(childMatch[1]);
          }
        } else if (line.includes('MARR')) {
          // Next line might have DATE
          const nextLine = lines[i + 1];
          if (nextLine && nextLine.includes('DATE')) {
            const dateMatch = nextLine.match(/DATE (.+)/);
            if (dateMatch) {
              family.marriageDate = parseGEDCOMDate(dateMatch[1]);
            }
          }
        } else if (line.includes('DIV')) {
          // Next line might have DATE
          const nextLine = lines[i + 1];
          if (nextLine && nextLine.includes('DATE')) {
            const dateMatch = nextLine.match(/DATE (.+)/);
            if (dateMatch) {
              family.divorceDate = parseGEDCOMDate(dateMatch[1]);
            }
          }
        }
      }
    } else if (currentContext === 'header') {
      if (line.includes('NOTE')) {
        const noteMatch = line.match(/NOTE (.+)/);
        if (noteMatch) {
          treeName = noteMatch[1];
        }
      }
    }
  }

  // Convert to FamilyTree structure
  const persons: Record<string, Person> = {};
  individuals.forEach((individual) => {
    persons[individual.id] = {
      id: individual.id,
      firstName: individual.firstName,
      lastName: individual.lastName,
      birthDate: individual.birthDate,
      deathDate: individual.deathDate,
      gender: individual.gender,
      notes: individual.notes,
    };
  });

  const familiesArray: Family[] = [];
  families.forEach((family) => {
    const parents: string[] = [];
    if (family.husbandId) {
      const uuid = idMap.get(family.husbandId);
      if (uuid) parents.push(uuid);
    }
    if (family.wifeId) {
      const uuid = idMap.get(family.wifeId);
      if (uuid) parents.push(uuid);
    }

    const children: string[] = [];
    for (const childGedcomId of family.childrenIds) {
      const uuid = idMap.get(childGedcomId);
      if (uuid) children.push(uuid);
    }

    familiesArray.push({
      id: family.id,
      parents,
      children,
      marriageDate: family.marriageDate,
      divorceDate: family.divorceDate,
      status: family.divorceDate ? 'divorced' : family.marriageDate ? 'married' : undefined,
    });
  });

  // Find root person (someone who is not a child in any family, or first person)
  let rootPersonId = '';
  for (const [gedcomId, individual] of individuals.entries()) {
    if (!individual.familyAsChild) {
      const uuid = idMap.get(gedcomId);
      if (uuid) {
        rootPersonId = uuid;
        break;
      }
    }
  }
  // Fallback to first person if no root found
  if (!rootPersonId && individuals.size > 0) {
    const firstGedcomId = Array.from(individuals.keys())[0];
    const uuid = idMap.get(firstGedcomId);
    if (uuid) rootPersonId = uuid;
  }

  return {
    name: treeName,
    persons,
    families: familiesArray,
    rootPersonId,
  };
}

/**
 * Parse GEDCOM date format (e.g., "25 DEC 1990") to ISO date string
 */
function parseGEDCOMDate(gedcomDate: string): string {
  const monthMap: Record<string, string> = {
    JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
    JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
  };

  const parts = gedcomDate.trim().split(' ');

  if (parts.length === 3) {
    // Format: DD MMM YYYY
    const day = parts[0].padStart(2, '0');
    const month = monthMap[parts[1]] || '01';
    const year = parts[2];
    return `${year}-${month}-${day}`;
  } else if (parts.length === 2) {
    // Format: MMM YYYY
    const month = monthMap[parts[0]] || '01';
    const year = parts[1];
    return `${year}-${month}-01`;
  } else if (parts.length === 1) {
    // Format: YYYY
    return `${parts[0]}-01-01`;
  }

  return gedcomDate;
}
