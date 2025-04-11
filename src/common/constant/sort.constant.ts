export enum Sort {
  LAST_CREATED = 'LAST_CREATED',
  FIRST_CREATED = 'FIRST_CREATED',
  EXPENSIVE = 'EXPENSIVE',
  INEXPENSIVE = 'INEXPENSIVE',
}

export const SortValue: Record<
  Sort,
  { column: string; order: 'ASC' | 'DESC' }
> = {
  [Sort.LAST_CREATED]: { column: 'createdAt', order: 'DESC' },
  [Sort.FIRST_CREATED]: { column: 'createdAt', order: 'ASC' },
  [Sort.EXPENSIVE]: { column: 'price', order: 'DESC' },
  [Sort.INEXPENSIVE]: { column: 'price', order: 'ASC' },
};
