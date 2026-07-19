import { DOCTYPES } from '../data/doctypes';
import { db, call } from './frappe-sdk-retry';
import { getErrorMessage } from './error-utils';

export interface Customer {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
  idx: number;
  naming_series: string;
  customer_name: string;
  customer_type: string;
  mobile_number: string;
  customer_group: string;
  territory: string;
  is_internal_customer: number;
  language: string;
  default_commission_rate: number;
  so_required: number;
  dn_required: number;
  is_frozen: number;
  disabled: number;
  doctype: string;
  companies: Record<string, unknown>[];
  credit_limits: Record<string, unknown>[];
  accounts: Record<string, unknown>[];
  sales_team: Record<string, unknown>[];
  portal_users: Record<string, unknown>[];
}

export interface CreateCustomerData {
  customer_name: string;
  mobile_number: string;
  customer_group?: string;
  territory?: string;
}

export interface CreateCustomerResponse {
  data: {
    name: string;
    customer_name: string;
    mobile_number: string;
    customer_group?: string;
    territory?: string;
  };
  _server_messages?: string;
}


export async function getCustomerGroups() {
  try {
    const groups = await db.getDocList(DOCTYPES.CUSTOMER_GROUP, {
      fields: ['name'],
      limit: "*" as unknown as number,
      orderBy: {
        field: 'name',
        order: 'asc',
      },
    });
    return groups;
  } catch (error) {
    throw new Error(`Failed to fetch customer groups: ${getErrorMessage(error)}`);
  }
}

export async function getCustomerTerritories() {
  try {
    const territories = await db.getDocList(DOCTYPES.CUSTOMER_TERRITORY, {
      fields: ['name'],
      limit: "*" as unknown as number,
      orderBy: {
        field: 'name',
        order: 'asc',
      },
    });
    return territories;
  } catch (error) {
    throw new Error(`Failed to fetch customer territories: ${getErrorMessage(error)}`);
  }
}

export async function addCustomer(
  customerData: CreateCustomerData
): Promise<CreateCustomerResponse> {
  try {
    const response = await call.post('ury.ury_pos.api.create_customer', customerData);
    const msg = response.message;
    if (!msg || msg.status !== "success") {
      throw new Error("Failed to create Customer. API response error");
    }
    // R40-FIX: Include `name` (the customer ID) in the response so that
    // CustomerSelect can set the correct customer ID. Previously, the response
    // type was CreateCustomerData which lacks a `name` field, causing
    // `created.name` to be undefined when setting the selected customer.
    return {
      data: {
        name: msg.name,
        customer_name: msg.customer_name,
        mobile_number: msg.mobile_number,
        customer_group: msg.customer_group,
        territory: msg.territory
      }
    };

  } catch (error) {
    throw new Error(`Failed to create customer: ${getErrorMessage(error)}`);
  }
}

// R41-FIX: Renamed from getscramblePattern (camelCase violation) to getScramblePattern
function getScramblePattern(text: string) {
  const escaped = text.replace(/[%_\\]/g, '\\$&');
  return `%${escaped.split("").join("%")}%`;
}

export async function searchCustomers(search: string, limit = 5) {
  if (!search.trim()) return [];

  const pattern = getScramblePattern(search);

  try {
    const res = await db.getDocList(DOCTYPES.CUSTOMER, {
      fields: ["name", "customer_name", "mobile_number"],
      orFilters: [
        ["customer_name", "like", pattern],
        ["mobile_number", "like", pattern],
        ["name", "like", pattern],
      ],
      limit,
      limit_start: 0,
    });

    return res.map((doc: { name: string; customer_name?: string; mobile_number?: string }) => ({
      ...doc,
      // R41-FIX: Keep the content field for backward compatibility with any
      // consumers that still reference it, but the primary fields are now
      // the typed `customer_name` and `mobile_number` properties.
      content: `Customer Name : ${doc.customer_name ?? ""} | Mobile Number : ${doc.mobile_number ?? ""}`,
    }));
  } catch (error) {
    throw new Error(`Customer search failed: ${getErrorMessage(error)}`);
  }
}
