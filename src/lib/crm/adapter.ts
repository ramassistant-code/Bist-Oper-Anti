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

// מאגר גיבוי לבדיקות מקומיות במקרה שאין חיבור לרשת או שהססמה ב-.env.local עדיין לא הוגדרה
const MOCK_CUSTOMERS: CrmCustomer[] = [
  {
    id: "CM-8021",
    name: "יוסי כהן",
    phone: "050-1234567",
    email: "yossi@chef-kitchen.co.il",
    companyName: "מסעדת השף בע״מ",
    vatNumber: "515982341",
    address: "רוטשילד 45, תל אביב",
    source: "Call Maker (סביבת פיתוח)",
    status: "פעיל",
  },
  {
    id: "CM-8022",
    name: "מיכל רוזן",
    phone: "054-9876543",
    email: "michal@premium-realty.co.il",
    companyName: "רוזן נדל״ן פרימיום",
    vatNumber: "514892013",
    address: "דרך מנחם בגין 144, תל אביב",
    source: "Call Maker (סביבת פיתוח)",
    status: "פעיל",
  },
  {
    id: "CM-8023",
    name: "אורן ברקוביץ׳",
    phone: "052-5551234",
    email: "oren@spark-media.io",
    companyName: "ספארק מדיה דיגיטל",
    vatNumber: "516709823",
    address: "התע״ש 12, רמת גן",
    source: "Call Maker (סביבת פיתוח)",
    status: "ליד חם",
  },
  {
    id: "CM-8024",
    name: "דנה שפירא",
    phone: "053-4447890",
    email: "dana@shapiro-law.co.il",
    companyName: "שפירא ושות׳ משרד עורכי דין",
    vatNumber: "513498112",
    address: "שדרות שאול המלך 33, תל אביב",
    source: "Call Maker (סביבת פיתוח)",
    status: "פעיל",
  },
];

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
        max: 3,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 5000,
      });
    } catch (e) {
      console.warn("⚠️ לא ניתן היה ליצור חיבור בריכת PG, נשתמש בנתוני גיבוי:", e);
      return null;
    }
  }

  return pool;
}

/**
 * איתור לקוחות ב-CRM (קריאה בלבד!)
 * מבוצע אך ורק SELECT, ללא שום פעולת כתיבה.
 */
export async function searchCrmCustomers(query: string): Promise<CrmCustomer[]> {
  const cleanQuery = (query || "").trim();
  const pgPool = getReadOnlyPool();

  if (pgPool && cleanQuery.length >= 2) {
    try {
      // שאילתת SELECT בלבד עם בדיקה מול טבלת clients / leads
      const searchPattern = `%${cleanQuery}%`;
      const result = await pgPool.query(
        `SELECT id, name, phone, email, 
                COALESCE(company_name, '') as company_name, 
                COALESCE(business_id, '') as vat_number,
                COALESCE(address, '') as address,
                COALESCE(status, 'פעיל') as status
         FROM clients 
         WHERE name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1 
         ORDER BY id DESC LIMIT 15`,
        [searchPattern]
      );

      if (result.rows && result.rows.length > 0) {
        return result.rows.map((row: any) => ({
          id: String(row.id),
          name: row.name || "ללא שם",
          phone: row.phone || "",
          email: row.email || "",
          companyName: row.company_name || "",
          vatNumber: row.vat_number || "",
          address: row.address || "",
          source: "Supabase DB (קריאה בלבד)",
          status: row.status || "פעיל",
        }));
      }
    } catch (err: any) {
      console.warn("ℹ️ שאילתת CRM מול ה-DB המרוחק לא צלחה, עובר למאגר הגיבוי המקומי:", err.message);
    }
  }

  // סינון מקומי ממאגר הגיבוי
  if (!cleanQuery) {
    return MOCK_CUSTOMERS;
  }

  const q = cleanQuery.toLowerCase();
  return MOCK_CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.companyName.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
  );
}

/**
 * שליפת לקוח ספציפי לפי מזהה (קריאה בלבד)
 */
export async function getCrmCustomerById(id: string): Promise<CrmCustomer | null> {
  const pgPool = getReadOnlyPool();
  if (pgPool) {
    try {
      const result = await pgPool.query(
        `SELECT id, name, phone, email, 
                COALESCE(company_name, '') as company_name, 
                COALESCE(business_id, '') as vat_number,
                COALESCE(address, '') as address,
                COALESCE(status, 'פעיל') as status
         FROM clients WHERE id::text = $1 LIMIT 1`,
        [id]
      );

      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: String(row.id),
          name: row.name || "",
          phone: row.phone || "",
          email: row.email || "",
          companyName: row.company_name || "",
          vatNumber: row.vat_number || "",
          address: row.address || "",
          source: "Supabase DB (קריאה בלבד)",
          status: row.status || "פעיל",
        };
      }
    } catch (err: any) {
      console.warn("ℹ️ שליפת לקוח מ-DB נכשלה, נבדוק במאגר הגיבוי:", err.message);
    }
  }

  const found = MOCK_CUSTOMERS.find((c) => c.id === id);
  return found || null;
}
