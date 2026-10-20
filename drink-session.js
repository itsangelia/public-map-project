// Pure shared-table transitions. Transactions and database rules enforce the same order.
export const DRINK_OPTIONS = [
 ['sparkling','milk-tea','slush'], ['strawberry','matcha','mango'],
 ['pearls','jelly','red-bean'], ['foam','ice-cream','lemon']
];
export function seatTable(table, uid, round, visitors) {
 const stale = table && (!visitors[table.a] || (table.b && !visitors[table.b]));
 if (!table || stale) return {round,a:uid,step:0};
 if (table.a===uid || table.b===uid) return undefined;
 if (!table.b && table.step===0) return {...table,b:uid};
 return undefined;
}
export function chooseDrink(table, uid, round, expectedStep, option) {
 if (!table || table.round!==round || table.step!==expectedStep || !table.b ||
     (table.step%2===0?table.a:table.b)!==uid || !DRINK_OPTIONS[expectedStep]?.includes(option)) return undefined;
 return {...table,['c'+expectedStep]:option,step:expectedStep+1};
}
