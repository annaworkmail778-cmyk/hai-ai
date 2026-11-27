/*
 * Owner value / ROI model. Every input is an editable assumption; every output shows its formula.
 * These are hypothetical projections, NOT measured results and NOT guarantees.
 */
export type RoiInputs = {
  monthlyInquiries: number;
  minutesPerInquiry: number;
  staffHandling: number;
  hourlyCost: number;
  automationShare: number; // 0–1, share of inquiries the assistant can fully answer
  avgRoomPrice: number;
  avgNights: number;
  occupancy: number; // 0–1, current
  missedShare: number; // 0–1, inquiries lost today
  recoverableShare: number; // 0–1, of missed inquiries that a 24/7 reply can recover
  directConversion: number; // 0–1, recovered inquiries that turn into bookings
  otaBookingsPerMonth: number;
  otaShiftShare: number; // 0–1, OTA bookings that could move to direct
  otaCommission: number; // 0–1
  firstResponseHours: number; // current average first response time
};

export type RoiLine = { label: string; value: number; unit: "h" | "AMD" | "count" | "%" | "fte"; formula: string };

export function computeRoi(i: RoiInputs) {
  const hoursSaved = (i.monthlyInquiries * i.minutesPerInquiry * i.automationShare) / 60;
  const perPerson = i.staffHandling > 0 ? hoursSaved / i.staffHandling : hoursSaved;
  const staffValue = hoursSaved * i.hourlyCost;
  const fte = hoursSaved / 160;
  const missed = i.monthlyInquiries * i.missedShare;
  const recovered = missed * i.recoverableShare;
  const extraBookings = recovered * i.directConversion;
  const bookingValue = i.avgRoomPrice * i.avgNights;
  const extraRevenue = extraBookings * bookingValue;
  const shifted = i.otaBookingsPerMonth * i.otaShiftShare;
  const commissionSaved = shifted * bookingValue * i.otaCommission;
  const totalMonthly = staffValue + extraRevenue + commissionSaved;
  const lines: RoiLine[] = [
    { label: "Խնայված աշխատաժամեր ամսական", value: hoursSaved, unit: "h", formula: `${i.monthlyInquiries} հարցում × ${i.minutesPerInquiry} րոպե × ${pct(i.automationShare)} ավտոմատ ÷ 60` },
    { label: "Խնայված ժամեր մեկ աշխատակցի համար", value: perPerson, unit: "h", formula: `${fmt1(hoursSaved)} ժ ÷ ${i.staffHandling} աշխատակից` },
    { label: "Ազատված աշխատաժամանակի արժեքը", value: staffValue, unit: "AMD", formula: `${fmt1(hoursSaved)} ժ × ${money(i.hourlyCost)} / ժ` },
    { label: "Լրիվ դրույքի համարժեք", value: fte, unit: "fte", formula: `${fmt1(hoursSaved)} ժ ÷ 160 ժ ամսական` },
    { label: "Այսօր կորցվող հարցումներ ամսական", value: missed, unit: "count", formula: `${i.monthlyInquiries} × ${pct(i.missedShare)}` },
    { label: "Հնարավոր լրացուցիչ ուղիղ ամրագրումներ", value: extraBookings, unit: "count", formula: `${fmt1(missed)} կորցված × ${pct(i.recoverableShare)} վերականգնվող × ${pct(i.directConversion)} փոխակերպում` },
    { label: "Եկամտի հնարավորություն ամսական", value: extraRevenue, unit: "AMD", formula: `${fmt1(extraBookings)} ամրագրում × ${money(i.avgRoomPrice)} × ${i.avgNights} գիշեր` },
    { label: "Միջնորդավճարի խնայողություն ամսական", value: commissionSaved, unit: "AMD", formula: `${i.otaBookingsPerMonth} OTA ամրագրում × ${pct(i.otaShiftShare)} ուղիղ × ${money(bookingValue)} × ${pct(i.otaCommission)}` },
  ];
  return { hoursSaved, perPerson, staffValue, fte, missed, recovered, extraBookings, extraRevenue, commissionSaved, totalMonthly, bookingValue, lines, automationShare: i.automationShare };
}

const pct = (x: number) => `${Math.round(x * 100)}%`;
const fmt1 = (x: number) => (Math.round(x * 10) / 10).toLocaleString("en-US");
const money = (x: number) => `${Math.round(x).toLocaleString("en-US").replace(/,/g, " ")} ֏`;
