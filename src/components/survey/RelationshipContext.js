import { createContext, useContext } from 'react';

/** The participant's assigned relationship structure (null until assigned). */
export const RelationshipContext = createContext(null);

export function useRelationshipAssignment() {
  return useContext(RelationshipContext);
}
