/**
 * Demo list members — same shape expected from the API.
 * Pass `:members="apiResponse"` into ListMembers.vue when wired.
 *
 * @typedef {Object} ListMember
 * @property {string|number} id
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} status — Subscribed | Unsubscribed | Non-subscribed | Pending | Cleaned
 * @property {string} phoneNumber
 * @property {string} createdAt — ISO 8601
 */

export const SEED_LIST_MEMBERS = [
  {
    id: '1',
    email: 'sam.frank@domain.com',
    firstName: 'Sam',
    lastName: 'Frank',
    status: 'Subscribed',
    phoneNumber: '9876543210',
    createdAt: '2026-04-23T18:12:00Z'
  },
  {
    id: '2',
    email: 'john.doe@domain.com',
    firstName: 'John',
    lastName: 'Doe',
    status: 'Unsubscribed',
    phoneNumber: '9123456780',
    createdAt: '2026-04-23T17:45:00Z'
  },
  {
    id: '3',
    email: 'emma.watson@domain.com',
    firstName: 'Emma',
    lastName: 'Watson',
    status: 'Non-subscribed',
    phoneNumber: '9988776655',
    createdAt: '2026-04-22T14:30:00Z'
  },
  {
    id: '4',
    email: 'raj.kumar@domain.com',
    firstName: 'Raj',
    lastName: 'Kumar',
    status: 'Pending',
    phoneNumber: '9012345678',
    createdAt: '2026-04-22T11:00:00Z'
  },
  {
    id: '5',
    email: 'anita.sharma@domain.com',
    firstName: 'Anita',
    lastName: 'Sharma',
    status: 'Cleaned',
    phoneNumber: '8899776655',
    createdAt: '2026-04-21T09:15:00Z'
  },
  {
    id: '6',
    email: 'vikram.singh@domain.com',
    firstName: 'Vikram',
    lastName: 'Singh',
    status: 'Subscribed',
    phoneNumber: '7766554433',
    createdAt: '2026-04-21T08:00:00Z'
  },
  {
    id: '7',
    email: 'meera.nair@domain.com',
    firstName: 'Meera',
    lastName: 'Nair',
    status: 'Subscribed',
    phoneNumber: '9090909090',
    createdAt: '2026-04-20T16:20:00Z'
  },
  {
    id: '8',
    email: 'arjun.reddy@domain.com',
    firstName: 'Arjun',
    lastName: 'Reddy',
    status: 'Unsubscribed',
    phoneNumber: '9345678901',
    createdAt: '2026-04-20T10:00:00Z'
  },
  {
    id: '9',
    email: 'neha.verma@domain.com',
    firstName: 'Neha',
    lastName: 'Verma',
    status: 'Pending',
    phoneNumber: '9812345678',
    createdAt: '2026-04-19T15:45:00Z'
  },
  {
    id: '10',
    email: 'rohit.menon@domain.com',
    firstName: 'Rohit',
    lastName: 'Menon',
    status: 'Subscribed',
    phoneNumber: '9871234560',
    createdAt: '2026-04-19T12:00:00Z'
  },
  {
    id: '11',
    email: 'kiran.patel@domain.com',
    firstName: 'Kiran',
    lastName: 'Patel',
    status: 'Non-subscribed',
    phoneNumber: '9701234567',
    createdAt: '2026-04-18T18:30:00Z'
  },
  {
    id: '12',
    email: 'pooja.mehta@domain.com',
    firstName: 'Pooja',
    lastName: 'Mehta',
    status: 'Subscribed',
    phoneNumber: '9823456789',
    createdAt: '2026-04-18T09:00:00Z'
  },
  {
    id: '13',
    email: 'rahul.iyer@domain.com',
    firstName: 'Rahul',
    lastName: 'Iyer',
    status: 'Cleaned',
    phoneNumber: '9955667788',
    createdAt: '2026-04-17T14:00:00Z'
  },
  {
    id: '14',
    email: 'divya.naidu@domain.com',
    firstName: 'Divya',
    lastName: 'Naidu',
    status: 'Subscribed',
    phoneNumber: '9087654321',
    createdAt: '2026-04-17T11:30:00Z'
  }
]
