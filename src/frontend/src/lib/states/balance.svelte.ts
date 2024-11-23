export const balance = $state({
	value: 0,
	decimals: 8,
	bigInt: BigInt(0)
});

export const setBalance = (value: number, bigInt: bigint) => {
	balance.bigInt = bigInt;
	balance.value = value;
};
