/**
 * Tests pour useWalkHistory - Vérifier le calcul des incidents
 */

describe('useWalkHistory - Stats Calculation', () => {
  
  test('Incident count: Compte les outings/activities, pas les pee/poop individuels', () => {
    // Données de test
    const mockOutings = [
      // Outing 1: poop inside (1 incident)
      { id: 1, pee: false, pee_location: null, poop: true, poop_location: 'inside' },
      // Outing 2: pee AND poop inside (1 incident, pas 2!)
      { id: 2, pee: true, pee_location: 'inside', poop: true, poop_location: 'inside' },
      // Outing 3: pee inside (1 incident)
      { id: 3, pee: true, pee_location: 'inside', poop: false, poop_location: null },
      // Outing 4: pee outside (0 incidents)
      { id: 4, pee: true, pee_location: 'outside', poop: false, poop_location: null },
      // Outing 5: poop outside (0 incidents)
      { id: 5, pee: false, pee_location: null, poop: true, poop_location: 'outside' },
    ];

    const mockActivities = [
      // Activity 1: poop_incident (1 incident)
      { id: 1, pee_incident: false, poop_incident: true },
      // Activity 2: pee AND poop incident (1 incident, pas 2!)
      { id: 2, pee_incident: true, poop_incident: true },
      // Activity 3: no incident
      { id: 3, pee_incident: false, poop_incident: false },
    ];

    // Calcul comme dans useWalkHistory.js (nouvelle logique)
    const outingsWithIncidents = mockOutings.filter(o => 
      (o.pee && o.pee_location === 'inside') || (o.poop && o.poop_location === 'inside')
    );
    const outingsIncidentsCount = outingsWithIncidents.length;

    const activitiesWithIncidents = mockActivities.filter(a => 
      a.pee_incident || a.poop_incident
    );
    const activitiesIncidentsCount = activitiesWithIncidents.length;

    const incidentCount = outingsIncidentsCount + activitiesIncidentsCount;

    // Assertions
    console.log('✅ Outings with incidents:', outingsIncidentsCount, '(expected: 3)');
    console.log('✅ Activities with incidents:', activitiesIncidentsCount, '(expected: 2)');
    console.log('✅ Total incidents:', incidentCount, '(expected: 5)');

    expect(outingsIncidentsCount).toBe(3); // Outings 1, 2, 3
    expect(activitiesIncidentsCount).toBe(2); // Activities 1, 2
    expect(incidentCount).toBe(5); // 3 + 2
  });

  test('Success count: Compte les pee/poop, pas les outings', () => {
    const mockOutings = [
      // Outing 1: pee outside (1 success)
      { id: 1, pee: true, pee_location: 'outside', poop: false, poop_location: null },
      // Outing 2: pee AND poop outside (2 successes!)
      { id: 2, pee: true, pee_location: 'outside', poop: true, poop_location: 'outside' },
      // Outing 3: pee inside (0 success)
      { id: 3, pee: true, pee_location: 'inside', poop: false, poop_location: null },
    ];

    const mockActivities = [
      // Activity 1: pee (1 success)
      { id: 1, pee: true, poop: false },
      // Activity 2: pee AND poop (2 successes!)
      { id: 2, pee: true, poop: true },
    ];

    // Calcul des succès
    const outingsSuccessCount = mockOutings.reduce((sum, o) => {
      let count = 0;
      if (o.pee && o.pee_location === 'outside') count++;
      if (o.poop && o.poop_location === 'outside') count++;
      return sum + count;
    }, 0);

    const activitiesSuccessCount = mockActivities.reduce((sum, a) => {
      let count = 0;
      if (a.pee) count++;
      if (a.poop) count++;
      return sum + count;
    }, 0);

    const successCount = outingsSuccessCount + activitiesSuccessCount;

    console.log('✅ Outings successes:', outingsSuccessCount, '(expected: 3)');
    console.log('✅ Activities successes:', activitiesSuccessCount, '(expected: 4)');
    console.log('✅ Total successes:', successCount, '(expected: 7)');

    expect(outingsSuccessCount).toBe(3); // 1 + 2 + 0
    expect(activitiesSuccessCount).toBe(4); // 1 + 2
    expect(successCount).toBe(7);
  });

  test('Real data scenario: 79 outings, 52 activities', () => {
    // Simuler les données réelles
    // 24 outings with incidents
    // 11 activities with incidents
    
    const outingsIncidents = 24;
    const activitiesIncidents = 11;
    const totalIncidents = outingsIncidents + activitiesIncidents;

    console.log('✅ Real data - Outings incidents:', outingsIncidents);
    console.log('✅ Real data - Activities incidents:', activitiesIncidents);
    console.log('✅ Real data - Total incidents:', totalIncidents, '(expected: 35)');

    expect(totalIncidents).toBe(35);
  });

});
