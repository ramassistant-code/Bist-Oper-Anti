import { db, components, products, productComponents, studioUsers } from "./index";

async function seed() {
  console.log("🌱 התחלת זריעת נתונים מקומיים לסטודיו BIST...");

  // 1. משתמשי צוות
  const userRam = {
    id: "usr-" + Date.now() + "-1",
    fullName: "רם שחר",
    role: "מנהל",
    phone: "050-0000000",
    email: "ram@bist.co.il",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const userEditor = {
    id: "usr-" + Date.now() + "-2",
    fullName: "איתי כהן",
    role: "עורך",
    phone: "052-1111111",
    email: "itay@bist.co.il",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const userCamera = {
    id: "usr-" + Date.now() + "-3",
    fullName: "דניאל לוי",
    role: "צלם",
    phone: "054-2222222",
    email: "daniel@bist.co.il",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  await db.insert(studioUsers).values([userRam, userEditor, userCamera]).onConflictDoNothing();
  console.log("✓ משתמשי צוות הוזנו");

  // 2. רכיבי עבודה (Components)
  const compStudioHour = {
    id: "cmp-" + Date.now() + "-1",
    componentNumber: "CMP-101",
    name: "שעת צילום באולפן (וידאו / סאונד)",
    deliverableType: "שעות אולפן",
    unitType: "שעות",
    costEstimate: 150,
    defaultPrice: 350,
    sopLink: "https://drive.google.com/drive/folders/bist-studio-guidelines",
    internalNotes: "לוודא כיול מיקרופונים ותאורת 3 נקודות לפני תחילת הצילום",
    quoteDescriptionDefault: "שעת שימוש באולפן מאובזר כולל מערך צילום 4K, תאורת מפתח, וסאונד מקצועי בליווי טכנאי",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const compLocationHour = {
    id: "cmp-" + Date.now() + "-2",
    componentNumber: "CMP-102",
    name: "שעת צילום חוץ / לוקיישן לקוח",
    deliverableType: "שעות אולפן",
    unitType: "שעות",
    costEstimate: 220,
    defaultPrice: 480,
    sopLink: "https://drive.google.com/drive/folders/bist-outdoor-guidelines",
    internalNotes: "להגיע 30 דקות מראש לבדיקת תאורה ורעשי רקע",
    quoteDescriptionDefault: "צילום בלוקיישן הלקוח כולל מערך נייד, גיבוי סאונד וציוד צילום מקצועי",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const compReelEdit = {
    id: "cmp-" + Date.now() + "-3",
    componentNumber: "CMP-103",
    name: "עריכת סרטון רילס / טיקטוק מותאם סושיאל",
    deliverableType: "עריכת וידאו",
    unitType: "יחידות",
    costEstimate: 180,
    defaultPrice: 420,
    sopLink: "https://drive.google.com/drive/folders/bist-reels-editing",
    internalNotes: "קאטים מהירים, כתוביות בולטות בעברית, גרפיקות Hook ב-3 השניות הראשונות",
    quoteDescriptionDefault: "עריכת וידאו אנכית (9:16) כולל אפקטים ויזואליים, כתוביות מעוצבות, ומוזיקה ברישיון מסחרי",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const compPodcastEpisode = {
    id: "cmp-" + Date.now() + "-4",
    componentNumber: "CMP-104",
    name: "הקלטה, ניתוב ועריכת פרק פודקאסט (עד 60 דק')",
    deliverableType: "סאונד",
    unitType: "יחידות",
    costEstimate: 280,
    defaultPrice: 750,
    sopLink: "https://drive.google.com/drive/folders/bist-podcast-workflow",
    internalNotes: "ניתוב 2-3 מצלמות בזמן אמת, סינון רעשים, מאסטרינג שמע",
    quoteDescriptionDefault: "הפקת פרק פודקאסט מלא: צילום רב-מצלמתי, מאסטרינג סאונד, פתיח וסגיר ממותגים",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const compCoverArt = {
    id: "cmp-" + Date.now() + "-5",
    componentNumber: "CMP-105",
    name: "עיצוב עטיפה / קאבר ממומן (Thumbnail)",
    deliverableType: "גרפיקה",
    unitType: "יחידות",
    costEstimate: 60,
    defaultPrice: 160,
    sopLink: null,
    internalNotes: "עיצוב מושך קליקים עם טקסט קצר וקונטרסט גבוה",
    quoteDescriptionDefault: "עיצוב קאבר מותאם לאינסטגרם / יוטיוב המותאם לחוקי הפלטפורמה",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const compStillsSession = {
    id: "cmp-" + Date.now() + "-6",
    componentNumber: "CMP-106",
    name: "סשן צילומי סטילס תדמית ועסקים (20 תמונות מעובדות)",
    deliverableType: "סטילס",
    unitType: "יחידות",
    costEstimate: 300,
    defaultPrice: 800,
    sopLink: null,
    internalNotes: "תאורת פורטרטים רכה, מסירת גלריה דיגיטלית לבחירת הלקוח",
    quoteDescriptionDefault: "צילומי סטילס מקצועיים באולפן כולל ליטוש ועיבוד ממוחשב ברזולוציה מלאה",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const compExtraRevision = {
    id: "cmp-" + Date.now() + "-7",
    componentNumber: "CMP-107",
    name: "סבב תיקונים נוסף (מעבר ל-2 סבבים כלולים)",
    deliverableType: "תיקונים",
    unitType: "סבבים",
    costEstimate: 70,
    defaultPrice: 180,
    sopLink: null,
    internalNotes: "חיוב אך ורק אם השינויים חורגים מהבריף המקורי שאושר",
    quoteDescriptionDefault: "סבב תיקונים מרוכז על פי משוב הלקוח",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.insert(components).values([
    compStudioHour,
    compLocationHour,
    compReelEdit,
    compPodcastEpisode,
    compCoverArt,
    compStillsSession,
    compExtraRevision,
  ]).onConflictDoNothing();
  console.log("✓ רכיבי אופרציה (Components) הוזנו");

  // 3. מוצרים וחבילות (Products)
  const prodReels5 = {
    id: "prd-" + Date.now() + "-1",
    productNumber: "PRD-201",
    name: "חבילת 5 סרטוני רילס לעסקים (צילום + עריכה מלאה)",
    category: "חבילות סושיאל",
    deliverableType: "וידאו",
    price: 2400,
    productionCost: 1200,
    quoteDescriptionDefault: "חבילה מקיפה הכוללת יום צילום מרוכז באולפן BIST ועריכת 5 סרטונים מותאמים לרשתות החברתיות עם כתוביות וסאונד",
    quoteNotesDefault: "כולל 2 סבבי תיקונים לכל סרטון. לוחות זמנים: טיוטה ראשונה תוך 5 ימי עסקים מסיום הצילום.",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const prodReels10 = {
    id: "prd-" + Date.now() + "-2",
    productNumber: "PRD-202",
    name: "חבילת 10 סרטוני רילס פרימיום (צילום + גרפיקה מונפשת)",
    category: "חבילות סושיאל",
    deliverableType: "וידאו",
    price: 4500,
    productionCost: 2200,
    quoteDescriptionDefault: "חבילת מיתוג חודשית מלאה: 10 סרטוני רילס ברמת גימור גבוהה, שילוב אנימציות וגרפיקות תומכות מותג",
    quoteNotesDefault: "כולל תסריטאות ראשונית, 4 שעות אולפן, ועד 2 סבבי תיקונים לכל תוצר.",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const prodPodcastEpisode = {
    id: "prd-" + Date.now() + "-3",
    productNumber: "PRD-203",
    name: "הפקת פודקאסט מצולם - פרק בודד (עד שעה)",
    category: "פודקאסטים",
    deliverableType: "סאונד",
    price: 1200,
    productionCost: 550,
    quoteDescriptionDefault: "צילום והקלטת פודקאסט באולפן BIST, ניתוב חי בזמן אמת, מאסטרינג שמע ומסירת קובץ וידאו מלא + קובץ אודיו נקי",
    quoteNotesDefault: "כולל 2 סרטוני טיזר קצרים לטיקטוק/אינסטגרם לגיוס מאזינים.",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const prodBrandStills = {
    id: "prd-" + Date.now() + "-4",
    productNumber: "PRD-204",
    name: "יום צילומי תדמית ופורטרט עסקי באולפן",
    category: "תדמית",
    deliverableType: "סטילס",
    price: 1800,
    productionCost: 700,
    quoteDescriptionDefault: "סשן צילומי תדמית מקיף לבעלי עסקים וצוותים, כולל מגוון לוקים, תאורת סטודיו מחמיאה ובחירת 25 תמונות מעובדות",
    quoteNotesDefault: "מסירת גלריה דיגיטלית מלאה תוך 48 שעות לבחירה.",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.insert(products).values([
    prodReels5,
    prodReels10,
    prodPodcastEpisode,
    prodBrandStills,
  ]).onConflictDoNothing();
  console.log("✓ מוצרים וחבילות הוזנו");

  // 4. חיבור עץ מוצר (BOM: Product Components)
  // חבילת 5 רילס מכילה: 2 שעות אולפן + 5 עריכות רילס
  await db.insert(productComponents).values([
    {
      id: "bom-1",
      productId: prodReels5.id,
      componentId: compStudioHour.id,
      defaultQuantity: 2,
      sortOrder: 1,
      isOptional: false,
    },
    {
      id: "bom-2",
      productId: prodReels5.id,
      componentId: compReelEdit.id,
      defaultQuantity: 5,
      sortOrder: 2,
      isOptional: false,
    },
    // חבילת 10 רילס: 4 שעות אולפן + 10 עריכות רילס
    {
      id: "bom-3",
      productId: prodReels10.id,
      componentId: compStudioHour.id,
      defaultQuantity: 4,
      sortOrder: 1,
      isOptional: false,
    },
    {
      id: "bom-4",
      productId: prodReels10.id,
      componentId: compReelEdit.id,
      defaultQuantity: 10,
      sortOrder: 2,
      isOptional: false,
    },
    // פודקאסט: 2 שעות אולפן + פרק פודקאסט + 2 עריכות רילס (טיזרים)
    {
      id: "bom-5",
      productId: prodPodcastEpisode.id,
      componentId: compStudioHour.id,
      defaultQuantity: 2,
      sortOrder: 1,
      isOptional: false,
    },
    {
      id: "bom-6",
      productId: prodPodcastEpisode.id,
      componentId: compPodcastEpisode.id,
      defaultQuantity: 1,
      sortOrder: 2,
      isOptional: false,
    },
    {
      id: "bom-7",
      productId: prodPodcastEpisode.id,
      componentId: compReelEdit.id,
      defaultQuantity: 2,
      sortOrder: 3,
      isOptional: false,
    },
  ]).onConflictDoNothing();
  console.log("✓ עץ מוצר והרכבי חבילות (BOM) הוזנו");

  console.log("🎉 זריעת הנתונים הסתיימה בהצלחה!");
}

seed().catch((err) => {
  console.error("שגיאה בזריעת נתונים:", err);
  process.exit(1);
});
