import { Pool } from "pg";

export interface CrmCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  companyName: string;
  vatNumber: string;
  address: string;
  source: string;
  status: string;
}

let pool: Pool | null = null;

function getReadOnlyPool(): Pool | null {
  const connectionString = process.env.CRM_SOURCE_DATABASE_URL;
  if (!connectionString || connectionString.includes("[YOUR-PASSWORD]") || connectionString.includes("your_anon_key")) {
    return null;
  }

  if (!pool) {
    try {
      pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 5,
        idleTimeoutMillis: 15000,
        connectionTimeoutMillis: 6000,
      });
    } catch (e) {
      console.warn("⚠️ שגיאה באיתחול Pool ל-CRM:", e);
      return null;
    }
  }

  return pool;
}

/**
 * איתור לקוחות ולידים ב-CRM (קריאה בלבד מ-Supabase ייצור)
 * מחפש הן בטבלת customers (1,000+ לקוחות קיימים) והן בטבלת leads (4,000+ לידים)
 */
export async function searchCrmCustomers(query: string): Promise<CrmCustomer[]> {
  const cleanQuery = (query || "").trim();
  const pgPool = getReadOnlyPool();

  if (pgPool && cleanQuery.length >= 2) {
    try {
      const searchPattern = `%${cleanQuery}%`;

      // שאילתת SELECT משולבת לקוחות ולידים
      const sql = `
        SELECT 
          id::text as id,
          name,
          COALESCE(phone, '') as phone,
          COALESCE(email, '') as email,
          COALESCE(invoice_name, name) as company_name,
          COALESCE(tax_id, '') as vat_number,
          '' as address,
          'לקוח קיים' as status,
          'CRM - לקוח' as source,
          1 as priority
        FROM customers
        WHERE (name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1 OR invoice_name ILIKE $1)
          AND deleted_at IS NULL

        UNION ALL

        SELECT 
          id::text as id,
          name,
          COALESCE(phone, '') as phone,
          COALESCE(email, '') as email,
          name as company_name,
          '' as vat_number,
          '' as address,
          COALESCE(status, 'ליד') as status,
          'CRM - ליד' as source,
          2 as priority
        FROM leads
        WHERE (name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1)
          AND deleted_at IS NULL

        ORDER BY priority ASC, name ASC
        LIMIT 25;
      `;

      const result = await pgPool.query(sql, [searchPattern]);

      if (result.rows && result.rows.length > 0) {
        return result.rows.map((row: any) => ({
          id: row.id,
          name: row.name || "ללא שם",
          phone: row.phone || "",
          email: row.email || "",
          companyName: row.company_name || "",
          vatNumber: row.vat_number || "",
          address: row.address || "",
          source: row.source || "CRM",
          status: row.status || "פעיל",
        }));
      }
    } catch (err: any) {
      console.warn("ℹ️ שאילתת CRM מול Supabase לא צלחה:", err.message);
    }
  }

  return [];
}

/**
 * שליפת לקוח ספציפי לפי מזהה (קריאה בלבד)
 */
export async function getCrmCustomerById(id: string): Promise<CrmCustomer | null> {
  const pgPool = getReadOnlyPool();
  if (pgPool) {
    try {
      // בדיקה בלקוחות
      const custRes = await pgPool.query(
        `SELECT id::text, name, COALESCE(phone, '') as phone, COALESCE(email, '') as email,
                COALESCE(invoice_name, name) as company_name, COALESCE(tax_id, '') as vat_number
         FROM customers WHERE id::text = $1 AND deleted_at IS NULL LIMIT 1`,
        [id]
      );
      if (custRes.rows && custRes.rows.length > 0) {
        const row = custRes.rows[0];
        return {
          id: row.id,
          name: row.name,
          phone: row.phone,
          email: row.email,
          companyName: row.company_name,
          vatNumber: row.vat_number,
          address: "",
          source: "CRM - לקוח",
          status: "לקוח קיים",
        };
      }

      // בדיקה בלידים
      const leadRes = await pgPool.query(
        `SELECT id::text, name, COALESCE(phone, '') as phone, COALESCE(email, '') as email,
                COALESCE(status, 'ליד') as status
         FROM leads WHERE id::text = $1 AND deleted_at IS NULL LIMIT 1`,
        [id]
      );
      if (leadRes.rows && leadRes.rows.length > 0) {
        const row = leadRes.rows[0];
        return {
          id: row.id,
          name: row.name,
          phone: row.phone,
          email: row.email,
          companyName: row.name,
          vatNumber: "",
          address: "",
          source: "CRM - ליד",
          status: row.status,
        };
      }
    } catch (err: any) {
      console.warn("ℹ️ שליפת לקוח מ-CRM נכשלה:", err.message);
    }
  }

  return null;
}
