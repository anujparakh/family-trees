import { FamilyTree } from './types';

/**
 * Mock family tree data for POC
 * 3 generations with ~16 people
 *
 * Structure:
 * - Generation 0 (Grandparents): William & Margaret Smith
 * - Generation 1 (Parents):
 *   - John & Mary Smith (2 children)
 *   - Sarah Smith & David Johnson (3 children)
 * - Generation 2 (Children): 5 kids total
 */
export const mockFamilyTree: FamilyTree = {
  persons: {
    // Generation 0 - Grandparents
    p1: {
      id: 'p1',
      firstName: 'William',
      lastName: 'Smith',
      birthDate: '1945-03-15',
      deathDate: '2015-11-22',
      gender: 'male',
    },
    p2: {
      id: 'p2',
      firstName: 'Margaret',
      lastName: 'Johnson',
      birthDate: '1947-07-22',
      gender: 'female',
    },

    // Generation 1 - Parents
    p3: {
      id: 'p3',
      firstName: 'John',
      lastName: 'Smith',
      birthDate: '1970-05-10',
      gender: 'male',
    },
    p4: {
      id: 'p4',
      firstName: 'Mary',
      lastName: 'Wilson',
      birthDate: '1972-09-18',
      gender: 'female',
    },
    p5: {
      id: 'p5',
      firstName: 'Sarah',
      lastName: 'Smith',
      birthDate: '1968-12-03',
      gender: 'female',
    },
    p6: {
      id: 'p6',
      firstName: 'David',
      lastName: 'Johnson',
      birthDate: '1967-02-14',
      gender: 'male',
    },

    // Generation 2 - Children of John & Mary
    p7: {
      id: 'p7',
      firstName: 'Emma',
      lastName: 'Smith',
      birthDate: '1998-06-12',
      gender: 'female',
    },
    p8: {
      id: 'p8',
      firstName: 'Michael',
      lastName: 'Smith',
      birthDate: '2000-11-08',
      gender: 'male',
    },

    // Generation 2 - Children of Sarah & David
    p9: {
      id: 'p9',
      firstName: 'Sophia',
      lastName: 'Johnson',
      birthDate: '1995-01-20',
      gender: 'female',
    },
    p10: {
      id: 'p10',
      firstName: 'James',
      lastName: 'Johnson',
      birthDate: '1997-08-15',
      gender: 'male',
    },
    p11: {
      id: 'p11',
      firstName: 'Oliver',
      lastName: 'Johnson',
      birthDate: '2002-04-25',
      gender: 'male',
    },

    // Extended family - Margaret's second marriage
    p12: {
      id: 'p12',
      firstName: 'Robert',
      lastName: 'Brown',
      birthDate: '1946-10-05',
      gender: 'male',
    },

    // Half-sibling from Margaret's second marriage
    p13: {
      id: 'p13',
      firstName: 'Lisa',
      lastName: 'Brown',
      birthDate: '1980-03-30',
      gender: 'female',
    },
    p14: {
      id: 'p14',
      firstName: 'Thomas',
      lastName: 'Anderson',
      birthDate: '1978-07-12',
      gender: 'male',
    },

    // Children of Lisa & Thomas
    p15: {
      id: 'p15',
      firstName: 'Ava',
      lastName: 'Anderson',
      birthDate: '2005-09-18',
      gender: 'female',
    },
    p16: {
      id: 'p16',
      firstName: 'Noah',
      lastName: 'Anderson',
      birthDate: '2008-12-22',
      gender: 'male',
    },
  },

  families: [
    // Family 1: William & Margaret -> John, Sarah
    {
      id: 'f1',
      parents: ['p1', 'p2'],
      children: ['p3', 'p5'],
      marriageDate: '1967-06-15',
      status: 'divorced', // Divorced before William's death
    },

    // Family 2: John & Mary -> Emma, Michael
    {
      id: 'f2',
      parents: ['p3', 'p4'],
      children: ['p7', 'p8'],
      marriageDate: '1995-08-20',
      status: 'married',
    },

    // Family 3: Sarah & David -> Sophia, James, Oliver
    {
      id: 'f3',
      parents: ['p5', 'p6'],
      children: ['p9', 'p10', 'p11'],
      marriageDate: '1993-05-12',
      status: 'married',
    },

    // Family 4: Margaret & Robert -> Lisa (second marriage)
    {
      id: 'f4',
      parents: ['p2', 'p12'],
      children: ['p13'],
      marriageDate: '1978-11-10',
      status: 'married',
    },

    // Family 5: Lisa & Thomas -> Ava, Noah
    {
      id: 'f5',
      parents: ['p13', 'p14'],
      children: ['p15', 'p16'],
      marriageDate: '2003-04-18',
      status: 'married',
    },
  ],

  // Start tree from William (the patriarch)
  rootPersonId: 'p1',
};

export default mockFamilyTree;
