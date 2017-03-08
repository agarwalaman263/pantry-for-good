import union from 'lodash/union';
import difference from 'lodash/difference';
import {denormalize} from 'normalizr';

import {customer as customerSchema, arrayOfCustomers} from './schemas';
import {CALL_API} from '../middleware/api';

export const LOAD_CUSTOMERS_REQUEST = 'customer/LOAD_CUSTOMERS_REQUEST';
export const LOAD_CUSTOMERS_SUCCESS = 'customer/LOAD_CUSTOMERS_SUCCESS';
export const LOAD_CUSTOMERS_FAILURE = 'customer/LOAD_CUSTOMERS_FAILURE';
export const LOAD_CUSTOMER_REQUEST = 'customer/LOAD_CUSTOMER_REQUEST';
export const LOAD_CUSTOMER_SUCCESS = 'customer/LOAD_CUSTOMER_SUCCESS';
export const LOAD_CUSTOMER_FAILURE = 'customer/LOAD_CUSTOMER_FAILURE';
export const SAVE_CUSTOMER_REQUEST = 'customer/SAVE_CUSTOMER_REQUEST';
export const SAVE_CUSTOMER_SUCCESS = 'customer/SAVE_CUSTOMER_SUCCESS';
export const SAVE_CUSTOMER_FAILURE = 'customer/SAVE_CUSTOMER_FAILURE';
export const DELETE_CUSTOMER_REQUEST = 'customer/DELETE_CUSTOMER_REQUEST';
export const DELETE_CUSTOMER_SUCCESS = 'customer/DELETE_CUSTOMER_SUCCESS';
export const DELETE_CUSTOMER_FAILURE = 'customer/DELETE_CUSTOMER_FAILURE';

export const loadCustomers = () => ({
  [CALL_API]: {
    endpoint: 'admin/customers',
    schema: arrayOfCustomers,
    types: [LOAD_CUSTOMERS_REQUEST, LOAD_CUSTOMERS_SUCCESS, LOAD_CUSTOMERS_FAILURE]
  }
});

export const loadCustomer = (id, admin) => ({
  [CALL_API]: {
    endpoint: admin ? `admin/customers/${id}` : `customer/${id}`,
    schema: customerSchema,
    types: [LOAD_CUSTOMER_REQUEST, LOAD_CUSTOMER_SUCCESS, LOAD_CUSTOMER_FAILURE]
  }
});

export const saveCustomer = (customer, admin) => {
  let endpoint;
  if (admin) endpoint = customer.id ? `admin/customers/${customer.id}` : `admin/customers`
  else endpoint = customer.id ? `customer/${customer.id}` : `customer`
  return {
    [CALL_API]: {
      endpoint,
      method: customer.id ? 'PUT' : 'POST',
      body: customer,
      schema: customerSchema,
      types: [SAVE_CUSTOMER_REQUEST, SAVE_CUSTOMER_SUCCESS, SAVE_CUSTOMER_FAILURE]
    }
  };
};

export const deleteCustomer = id => ({
  [CALL_API]: {
    endpoint: `admin/customers/${id}`,
    method: 'DELETE',
    types: [DELETE_CUSTOMER_REQUEST, DELETE_CUSTOMER_SUCCESS, DELETE_CUSTOMER_FAILURE]
  }
});

export default (state = {
  ids: []
}, action) => {
  switch (action.type) {
    case LOAD_CUSTOMERS_REQUEST:
    case LOAD_CUSTOMER_REQUEST:
      return {
        ...state,
        fetching: true,
        saving: false,
        fetchError: null,
        saveError: null
      };
    case SAVE_CUSTOMER_REQUEST:
    case DELETE_CUSTOMER_REQUEST:
      return {
        ...state,
        fetching: false,
        saving: true,
        fetchError: null,
        saveError: null
      };
    case LOAD_CUSTOMERS_SUCCESS:
    case LOAD_CUSTOMER_SUCCESS:
    case SAVE_CUSTOMER_SUCCESS:
    case DELETE_CUSTOMER_SUCCESS:
      const result = Array.isArray(action.response.result) ? action.response.result : [action.response.result];
      return {
        ...state,
        ids: action.type === DELETE_CUSTOMER_SUCCESS ?
                  difference(result, state.ids) :
                  union(result, state.ids),
        fetching: false,
        saving: false
      };
    case LOAD_CUSTOMERS_FAILURE:
    case LOAD_CUSTOMER_FAILURE:
      return {
        ...state,
        fetching: false,
        saving: false,
        fetchError: action.error
      };
    case SAVE_CUSTOMER_FAILURE:
    case DELETE_CUSTOMER_FAILURE:
      return {
        ...state,
        fetching: false,
        saving: false,
        saveError: action.error
      };
    default: return state;
  }
};

export const selectors = {
  getAll(customers, entities) {
    return denormalize({customers}, {customers: arrayOfCustomers}, entities).customers;
  },
  getOne(id, entities) {
    return denormalize({customers: id}, {customers: customerSchema}, entities).customers;
  },
  loading(customers) {
    return customers.fetching
  },
  loadError(customers) {
    return customers.fetchError
  },
  saving(customers) {
    return customers.saving
  },
  saveError(customers) {
    return customers.saveError
  }
}
